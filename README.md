# 🌾 AgriSmart AI — Intelligent Agriculture for a Sustainable Future

**SIH 2026 (Internal Hackathon) — Problem Statement 1 — L. J. Institute of Engineering and Technology [C-433]**

🔗 **Live Demo:** https://sih2026-quza.onrender.com
*(Free-tier hosting — the app may take 30–60s to wake up if it's been idle for a while.)*

🎥 **Demo Video:** _[add your 3–5 minute video link here before final submission]_

---

## 1. Modules Built

| Module | Status |
|---|---|
| **Core — Crop Disease Detection (Computer Vision)** | ✅ Implemented |
| B. Smart Irrigation | ✅ Implemented |
| C. Weather-Based Intelligence | ✅ Implemented |
| E. Farmer Assistant (GenAI chatbot) | ✅ Implemented |
| F. IoT Integration | ✅ Implemented (simulated sensor feed, as explicitly permitted by the problem statement) |
| A. Crop Recommendation | 🚧 UI scaffold present — backend logic in progress |
| D. Sustainability Score | 🚧 UI scaffold present — backend logic in progress |
| G. Agentic Advisor | 🚧 UI scaffold present — decision loop in progress |

---

## 2. Setup & Run Instructions

### Option A — Use the Live Demo (fastest)
Just open **https://sih2026-quza.onrender.com** — no setup required. Choose "Continue as Guest" to try it immediately.

### Option B — Run Locally (for reproducibility verification)

**Prerequisites:** Python 3.10+ (tested on 3.14), pip.

```bash
# 1. Clone the repo
git clone https://github.com/SakshamDShah/SIH2026.git
cd SIH2026/backend

# 2. Install dependencies (CPU-only PyTorch to keep this lightweight)
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
# then edit .env and fill in MONGO_URI and GROQ_API_KEY with your own values
# (the app runs without them, but login/history and the AI chatbot will be disabled)

# 4. Run the server
python app.py
```

Then open **http://localhost:5000** in a browser. The app must reproduce a prediction in well under 10 minutes from a clean clone, per the submission rules.

---

## 3. Dataset Used

- **Training/validation:** [PlantVillage](https://www.kaggle.com/datasets/emmarex/plantdisease) (lab-condition leaf images), as provided at kickoff.
- **Held-out evaluation:** organizers' field-condition test set (PlantDoc-style), used only for official scoring — not used in training.
- **Classes:** 16 total (see `class_names.json`) covering Bell Pepper, Potato, and Tomato — healthy and diseased.
- License: PlantVillage is publicly available for research use; cite the original dataset paper/source in any publication.

---

## 4. Reported Metrics

> ⚠️ **To be completed before submission.** The current pipeline (`train_model.py`) reports train/validation accuracy only. The hackathon requires **macro-averaged F1** and a **confusion matrix** computed on the organizers' held-out field-condition test set — this still needs to be run and the results filled in below.

| Metric | Value |
|---|---|
| Macro-F1 (held-out test set) | _TBD_ |
| Accuracy (held-out test set) | _TBD_ |
| Train accuracy | _see training logs_ |
| Validation accuracy | _see training logs_ |

Confusion matrix and per-class precision/recall: _add image/table here once evaluation is run._

---

## 5. Architecture Overview

- **Backend:** Flask (Python), serving both the REST API and the static frontend from a single origin.
- **Computer Vision Model:** MobileNetV2 (ImageNet-pretrained), fine-tuned with a custom classification head — `Dropout → Linear(256) → ReLU → Dropout → Linear(num_classes)`. Last two feature blocks unfrozen for fine-tuning; rest frozen.
- **Database:** MongoDB Atlas — stores user accounts (hashed passwords) and scan history.
- **Generative AI:** Groq API (`openai/gpt-oss-120b`) — powers the farmer chatbot and short weather-advisory text, grounded in a hand-curated disease knowledge base (`disease_info.py`).
- **Weather Data:** Open-Meteo API — live temperature, humidity, weather code, and rain probability, feeding the rule-based irrigation/fungal-risk logic.
- **Frontend:** HTML/CSS/vanilla JavaScript, multi-tab single-page layout (Home, Today, Detect, Insights, History, About), with a regional-language selector and Google Translate integration for accessibility.
- **Deployment:** Render (free tier), CPU-only PyTorch build, Gunicorn as the production WSGI server.

---

## 6. Known Limitations

- Core metric (macro-F1 on the held-out set) has not yet been computed — see Section 4.
- Bonus modules A (Crop Recommendation), D (Sustainability Score), and G (Agentic Advisor) currently have frontend UI but placeholder/static backend logic — not yet driven by real models or live decision loops.
- Model is trained on lab-condition images; per the problem statement's own framing, accuracy is expected to degrade on real-world field photos — this is the core challenge, not a bug, and is why held-out field evaluation matters more than training accuracy.
- Free-tier hosting has a cold-start delay (~30–60s) after periods of inactivity, and a 512MB memory ceiling — large image uploads or concurrent requests could be constrained; `gunicorn` is configured with `--workers 1 --threads 2 --max-requests 20` to mitigate memory creep from repeated PyTorch inference calls.
- `assets/bg.jpg` and any additional static assets referenced by the frontend should be confirmed present in the repo before judging.

---

## 7. Originality Declaration

- Base architecture: MobileNetV2 via `torchvision.models`, pretrained on ImageNet (Torchvision/PyTorch, BSD-style license).
- Dataset: PlantVillage (public dataset, cited above).
- Third-party libraries: Flask, Flask-CORS, PyMongo, Groq Python SDK, python-dotenv, Pillow, Gunicorn — all open-source, used per their standard APIs.
- No third-party notebooks or pre-built solutions were copied; the Flask app, training script, and frontend were built specifically for this challenge.
- AI coding assistance (Claude) was used during development for debugging, deployment configuration, and documentation — per the hackathon's stated allowance for AI coding assistants.

---

## 8. Project Structure

```
SIH2026/
├── index.html, login.html          # Frontend pages
├── css/, js/, assets/              # Frontend static files
└── backend/
    ├── app.py                      # Flask app (API + frontend serving)
    ├── train_model.py              # Model training script
    ├── verify_dataset.py           # Dataset sanity-check utility
    ├── disease_info.py             # Disease knowledge base
    ├── class_names.json            # Ordered class label list
    ├── crop_disease_model.pth      # Trained model weights
    ├── requirements.txt            # Python dependencies (CPU-only PyTorch)
    ├── .env.example                # Environment variable template
    └── .gitignore
```
