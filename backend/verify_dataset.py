# backend/verify_dataset.py
import os

DATASET_PATH = "../dataset"

if not os.path.exists(DATASET_PATH):
    print(f"❌ Error: Path '{DATASET_PATH}' does not exist. Check your folder location.")
else:
    classes = [d for d in os.listdir(DATASET_PATH) if os.path.isdir(os.path.join(DATASET_PATH, d))]
    print(f"✅ Found {len(classes)} classes in dataset:\n")
    
    total_images = 0
    for cls in sorted(classes):
        cls_path = os.path.join(DATASET_PATH, cls)
        img_count = len([f for f in os.listdir(cls_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))])
        total_images += img_count
        print(f" • {cls}: {img_count} images")
        
    print(f"\n📊 Total Images Verified: {total_images}")