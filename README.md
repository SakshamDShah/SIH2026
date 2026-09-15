# 🌾 AgriSmart AI — Intelligent Agriculture for a Sustainable Future

**SIH 2026 (Internal Hackathon) — Problem Statement 1 — L. J. Institute of Engineering and Technology [C-433]**

🔗 **Live Demo:** https://sih2026-quza.onrender.com
*(Free-tier hosting — may take 30–60s to wake up if idle.)*

---

## Table of Contents
1. [Problem Statement](#problem-statement)
2. [Project Description](#project-description)
3. [Modules Built](#modules-built)
4. [Setup & Run Instructions](#setup--run-instructions)
5. [Dataset Used](#dataset-used)
6. [Reported Metrics](#reported-metrics)
7. [Architecture Overview](#architecture-overview)
8. [Assumptions & Limitations](#assumptions--limitations)
9. [Advantages](#advantages)
10. [Future Scope](#future-scope)
11. [Originality Declaration](#originality-declaration)
12. [Project Structure](#project-structure)
13. [Conclusion](#conclusion)

---

## Problem Statement

Agriculture faces persistent challenges — water scarcity, unpredictable weather, soil degradation, crop diseases, inefficient irrigation, and overuse of fertilizers/pesticides. AgriSmart AI tackles the **core challenge**: build an AI-powered crop-disease detection tool that identifies plant diseases from leaf images using computer vision, reports its accuracy on a held-out, real-world test set, and presents results to a farmer simply and actionably — then optionally extends into a broader smart-agriculture advisor.

## Project Description

AgriSmart AI is a full-stack web application that lets a farmer photograph a crop leaf and instantly receive a disease diagnosis, a confidence score, and plain-language precautions. Beyond the core detection task, it extends into a smart-farming dashboard: live weather-linked irrigation guidance, a simulated IoT sensor feed, a sustainability score, a GenAI chatbot for farmer questions, scan history, and multi-language accessibility support — aimed at farmers with varying levels of digital literacy and connectivity.

## Modules Built

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

## Setup & Run Instructions

### Option A — Use the Live Demo (fastest)
Open **https://sih2026-quza.onrender.com** and choose "Continue as Guest."

### Option B — Run Locally

**Prerequisites:** Python 3.10+, pip.

```bash
# 1. Clone the repo
git clone https://github.com/SakshamDShah/SIH2026.git
cd SIH2026/backend

# 2. Install dependencies (CPU-only PyTorch)
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
# edit .env and add your own MONGO_URI and GROQ_API_KEY
# (the app still runs without them — login/history and the chatbot are just disabled)

# 4. Run the server
python app.py
```
Then open **http://localhost:5000**. A judge should reach a working prediction in well under 10 minutes from a clean clone.

## Dataset Used

- **Training/validation:** [PlantVillage](https://www.kaggle.com/datasets/emmarex/plantdisease) — lab-condition leaf images, uniform background.
- **Held-out evaluation (field-condition):** [PlantDoc](https://github.com/pratikkayal/PlantDoc-Dataset) — real-world images with natural lighting, clutter, and occlusion, used as the closest public proxy for the organizers' field-condition test protocol.
- **Classes:** 16 total (`class_names.json`) — Bell Pepper, Potato, and Tomato, each healthy or diseased.
- Both datasets are public and used here for research/educational purposes; original authors credited above.

## Reported Metrics

> ⚠️ To be finalized: run `evaluate.py` against the organized PlantDoc test folder, then replace the values below.

| Metric | Value |
|---|---|
| Macro-F1 (held-out test set) | _TBD_ |
| Accuracy (held-out test set) | _TBD_ |
| Train / Validation accuracy | _see training console output_ |

Confusion matrix and per-class precision/recall: generated at `report/confusion_matrix.png` and `report/per_class_metrics.csv` once `evaluate.py` is run.

## Architecture Overview

- **Backend:** Flask, serving both the REST API and the static frontend from a single origin.
- **Computer Vision Model:** MobileNetV2 (ImageNet-pretrained), fine-tuned with a custom head (`Dropout → Linear(256) → ReLU → Dropout → Linear(num_classes)`); last two feature blocks unfrozen.
- **Database:** MongoDB Atlas — user accounts (hashed passwords) and scan history.
- **Generative AI:** Groq API (`openai/gpt-oss-120b`) — farmer chatbot and short weather-advisory text, grounded in a curated disease knowledge base.
- **Weather Data:** Open-Meteo API — live temperature, humidity, weather code, rain probability.
- **Frontend:** HTML/CSS/vanilla JavaScript, multi-tab layout, with regional-language selector and Google Translate integration.
- **Deployment:** Render (free tier), CPU-only PyTorch, Gunicorn as the WSGI server.

## Assumptions & Limitations

- The model is trained and evaluated only on the **16 specific classes** listed in `class_names.json` (Bell Pepper, Potato, Tomato) — it cannot diagnose crops or diseases outside this list.
- Core metric (macro-F1 on a genuine held-out set) is still pending a full evaluation run — see Section 6.
- Bonus modules A (Crop Recommendation), D (Sustainability Score), and G (Agentic Advisor) currently have frontend UI but placeholder backend logic.
- Per the problem statement's own framing, accuracy is expected to be lower on real-world field photos than on lab-condition images — this generalization gap is the intended core challenge, not a defect.
- Free-tier hosting has a cold-start delay (~30–60s after inactivity) and a 512MB memory ceiling; Gunicorn is tuned (`--workers 1 --threads 2 --max-requests 20`) to manage this.

## Advantages

- One-photo, one-touch disease diagnosis — no manual data entry required for the core flow.
- Combines detection with actionable, farmer-friendly precautions rather than a raw label.
- Designed for accessibility: guest mode (no signup needed), regional-language support, and a simple multi-tab layout.
- Extensible architecture — weather, irrigation, and chatbot modules are already wired to real external data sources, not just static text.

## Future Scope

- Complete the Crop Recommendation, Sustainability Score, and Agentic Advisor modules with real backend logic.
- Expand beyond the current 16 classes to more crops (e.g. Corn, Apple, Grape) as named in the problem statement's example class list.
- Add voice-based interaction and deeper regional-language support for low-literacy users.
- Move from a simulated IoT feed to real sensor hardware (ESP32/Raspberry Pi) integration.
- Offline/low-connectivity mode for areas with poor network access.

## Originality Declaration

- Base architecture: MobileNetV2 via `torchvision.models`, pretrained on ImageNet.
- Datasets: PlantVillage and PlantDoc (both public, cited above).
- Third-party libraries: Flask, Flask-CORS, PyMongo, Groq Python SDK, python-dotenv, Pillow, Gunicorn, scikit-learn, matplotlib — all open-source, used via their standard APIs.
- No third-party notebooks or pre-built end-to-end solutions were copied; the Flask app, training script, evaluation script, and frontend were built specifically for this challenge.
- AI coding assistance (Claude) was used during development for debugging, deployment configuration, and documentation, per the hackathon's stated allowance for AI coding assistants.

## Project Structure

```
SIH2026/
├── index.html, login.html          # Frontend pages
├── css/, js/, assets/              # Frontend static files
└── backend/
    ├── app.py                      # Flask app (API + frontend serving)
    ├── train_model.py              # Model training script
    ├── evaluate.py                 # Held-out test set evaluation (macro-F1, confusion matrix)
    ├── verify_dataset.py           # Dataset sanity-check utility
    ├── disease_info.py             # Disease knowledge base
    ├── class_names.json            # Ordered class label list
    ├── crop_disease_model.pth      # Trained model weights
    ├── requirements.txt            # Python dependencies (CPU-only PyTorch)
    ├── .env.example                # Environment variable template
    └── .gitignore
```

## Conclusion

AgriSmart AI demonstrates that a single leaf photo can be turned into an actionable, farmer-friendly diagnosis in seconds — and that this core capability can be extended into a broader advisory platform combining weather intelligence, simulated IoT data, and a conversational assistant. The project is built to be reproducible from a clean clone, honest about its current limitations, and structured to keep growing toward full coverage of the bonus modules outlined in the problem statement.
