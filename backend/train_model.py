import os
import json
import random
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split, Dataset, Subset
from torchvision import datasets, transforms, models

# ----------------------------------------------------
# Configuration & Hyperparameters (Fast CPU High-Accuracy Mode)
# ----------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "dataset"))
MODEL_SAVE_PATH = os.path.join(BASE_DIR, "crop_disease_model.pth")
CLASS_NAMES_PATH = os.path.join(BASE_DIR, "class_names.json")

BATCH_SIZE = 64
EPOCHS = 4
LEARNING_RATE = 2.5e-4
IMAGE_SIZE = (224, 224)
MAX_SAMPLES_PER_CLASS = 350  # Balanced count: high accuracy in ~5-8 mins on CPU


class DatasetWrapper(Dataset):
    def __init__(self, subset, transform=None):
        self.subset = subset
        self.transform = transform

    def __getitem__(self, index):
        x, y = self.subset[index]
        if self.transform:
            x = self.transform(x)
        return x, y

    def __len__(self):
        return len(self.subset)


def create_balanced_subsample(dataset, max_samples_per_class):
    """Subsamples the dataset dynamically for balanced class representation and fast CPU training."""
    class_indices = {}
    for idx, (_, label) in enumerate(dataset.samples):
        if label not in class_indices:
            class_indices[label] = []
        class_indices[label].append(idx)

    subsampled_indices = []
    for label, indices in class_indices.items():
        if len(indices) > max_samples_per_class:
            subsampled_indices.extend(random.sample(indices, max_samples_per_class))
        else:
            subsampled_indices.extend(indices)

    random.shuffle(subsampled_indices)
    return Subset(dataset, subsampled_indices)


def train():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"🚀 Using compute device: {device}")

    # 1. Targeted Transforms
    train_transform = transforms.Compose([
        transforms.Resize(IMAGE_SIZE),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.1, contrast=0.1),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    val_transform = transforms.Compose([
        transforms.Resize(IMAGE_SIZE),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # 2. Dataset Loading & Subsampling
    print(f"📦 Scanning dataset from '{DATASET_DIR}'...")
    if not os.path.exists(DATASET_DIR):
        raise FileNotFoundError(f"Cannot find dataset directory at {DATASET_DIR}")

    full_dataset = datasets.ImageFolder(root=DATASET_DIR)
    classes = full_dataset.classes
    num_classes = len(classes)

    print(f"✅ Found {len(full_dataset)} total raw images across {num_classes} classes.")

    # Save class list mapping for app.py
    with open(CLASS_NAMES_PATH, "w") as f:
        json.dump(classes, f, indent=4)
    print(f"💾 Saved class list mapping to '{CLASS_NAMES_PATH}'")

    # Subsample dataset
    fast_dataset = create_balanced_subsample(full_dataset, MAX_SAMPLES_PER_CLASS)
    print(f"⚡ Subsampled dataset to {len(fast_dataset)} total images ({MAX_SAMPLES_PER_CLASS}/class max).")

    # Split: 80% Train, 20% Validation
    train_size = int(0.8 * len(fast_dataset))
    val_size = len(fast_dataset) - train_size
    train_subset, val_subset = random_split(fast_dataset, [train_size, val_size])

    train_dataset = DatasetWrapper(train_subset, transform=train_transform)
    val_dataset = DatasetWrapper(val_subset, transform=val_transform)

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    # 3. Model Setup (Unfreeze last feature layer for high accuracy)
    print("🧠 Initializing MobileNetV2 Model...")
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)

    # Freeze lower feature blocks, unfreeze top block for fine-tuning
    for param in model.features[:-2].parameters():
        param.requires_grad = False
    for param in model.features[-2:].parameters():
        param.requires_grad = True

    # Custom Classification Head (Matches app.py structure)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 256),
        nn.ReLU(),
        nn.Dropout(p=0.2),
        nn.Linear(256, num_classes)
    )

    model = model.to(device)

    # 4. Optimizer & Loss Function
    criterion = nn.CrossEntropyLoss(label_smoothing=0.08)
    optimizer = optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=LEARNING_RATE, weight_decay=1e-2)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS)

    # ----------------------------------------------------
    # Training Loop
    # ----------------------------------------------------
    print(f"\n⚡ Starting Fine-Tuning Training ({EPOCHS} Epochs)...")
    best_val_acc = 0.0

    for epoch in range(EPOCHS):
        model.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            total_train += labels.size(0)
            correct_train += predicted.eq(labels).sum().item()

        scheduler.step()
        epoch_loss = running_loss / total_train
        epoch_acc = (correct_train / total_train) * 100

        # Validation Phase
        model.eval()
        val_loss = 0.0
        correct_val = 0
        total_val = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)

                val_loss += loss.item() * images.size(0)
                _, predicted = outputs.max(1)
                total_val += labels.size(0)
                correct_val += predicted.eq(labels).sum().item()

        val_epoch_loss = val_loss / total_val
        val_acc = (correct_val / total_val) * 100

        print(
            f"Epoch [{epoch+1}/{EPOCHS}] | "
            f"Train Loss: {epoch_loss:.4f} | Train Acc: {epoch_acc:.2f}% | "
            f"Val Loss: {val_epoch_loss:.4f} | Val Acc: {val_acc:.2f}%"
        )

        # Save Best Checkpoint
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), MODEL_SAVE_PATH)
            print(f"  🏆 New best model saved to '{MODEL_SAVE_PATH}' (Val Acc: {val_acc:.2f}%)")

    print(f"\n🎉 Training Complete! Highest Validation Accuracy achieved: {best_val_acc:.2f}%")


if __name__ == "__main__":
    train()