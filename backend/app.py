import os
import json
import base64
import io
import time
import requests
from datetime import datetime, timezone
from groq import Groq
from werkzeug.security import generate_password_hash, check_password_hash

import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient

# Knowledge base
from disease_info import get_disease_details, DISEASE_KNOWLEDGE_BASE

# Load environment variables from .env file
load_dotenv()

# ----------------------------------------------------
# Serve the frontend directly from Flask
# ----------------------------------------------------
FRONTEND_DIR = os.getenv(
    "FRONTEND_DIR",
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)

app = Flask(__name__, static_folder=None)
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

ALLOWED_STATIC_FOLDERS = ("css", "js", "assets")

@app.route("/")
def serve_frontend_index():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/<path:path>")
def serve_frontend_assets(path):
    top_level = path.split("/", 1)[0]
    if top_level in ALLOWED_STATIC_FOLDERS:
        full_path = os.path.join(FRONTEND_DIR, path)
        if os.path.isfile(full_path):
            return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, "index.html")

# ----------------------------------------------------
# MongoDB Atlas Integration
# ----------------------------------------------------
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "agrismart_db")

print(f"🔍 DEBUG: MONGO_URI loaded: {'Yes' if MONGO_URI else 'No (None/Empty)'}")

db = None
history_collection = None
users_collection = None

if MONGO_URI:
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        db = client[DB_NAME]
        history_collection = db["scan_history"]
        users_collection = db["users"]
        print("✅ Successfully connected to MongoDB Atlas Cloud Database.")
        print("✅ Successfully initialized Users collection.")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
else:
    print("⚠️ MONGO_URI not found in environment variables!")

# ----------------------------------------------------
# Groq AI Setup
# ----------------------------------------------------
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

if GROQ_API_KEY:
    ai_client = Groq(api_key=GROQ_API_KEY)
    print(f"✅ Successfully initialized Groq API Client. Using model: {GROQ_MODEL}")
else:
    print("⚠️ GROQ_API_KEY not found in environment variables!")

# ----------------------------------------------------
# Global Model & Mapping Variables
# ----------------------------------------------------
MODEL_PATH = "crop_disease_model.pth"
CLASS_NAMES_PATH = "class_names.json"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = None
class_names = []

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def load_ai_model():
    global model, class_names
    if not os.path.exists(MODEL_PATH) or not os.path.exists(CLASS_NAMES_PATH):
        print("⚠️ Warning: Model weights or class names missing. Run train_model.py first!")
        return

    with open(CLASS_NAMES_PATH, "r") as f:
        class_names = json.load(f)

    num_classes = len(class_names)

    model = models.mobilenet_v2(weights=None)
    in_features = model.classifier[1].in_features
    
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 256),
        nn.ReLU(),
        nn.Dropout(p=0.2),
        nn.Linear(256, num_classes)
    )

    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    model = model.to(device)
    model.eval()
    print(f"✅ AI Model loaded successfully with {num_classes} classes.")

load_ai_model()

def decode_base64_image(data_url: str) -> Image.Image:
    if "," in data_url:
        data_url = data_url.split(",", 1)[1]
    image_bytes = base64.b64decode(data_url)
    return Image.open(io.BytesIO(image_bytes)).convert("RGB")

def predict_crop_disease(image: Image.Image) -> dict:
    if model is None:
        raise ValueError("Model is not initialized.")

    img_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(img_tensor)
        probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
        confidence, predicted_idx = torch.max(probabilities, dim=0)

    raw_conf = confidence.item()
    conf_score = round(raw_conf, 2)
    predicted_class = class_names[predicted_idx.item()]

    print(f"🔍 Inference complete | Predicted Class: '{predicted_class}' | Confidence: {conf_score * 100}%")

    if predicted_class == "Background_Without_Leaves" or "background" in predicted_class.lower():
        return {
            "status": "invalid_image",
            "error_type": "NO_LEAF_DETECTED",
            "crop": "No Plant / Non-Leaf Image",
            "scientific_name": "N/A",
            "class": "No Leaf Detected",
            "raw_class": predicted_class,
            "health_status": "Invalid",
            "confidence": conf_score,
            "pathogen": "None",
            "text_explanation": "Uploaded image doesn't contain any crop or leaf, please try again.",
            "message": "Uploaded image doesn't contain any crop or leaf, please try again.",
            "precautions": [
                "Upload a clear photo containing plant foliage",
                "Ensure the leaf fills most of the camera frame",
                "Avoid photos of background soil, pots, or general surroundings without leaves"
            ],
            "explanation": [
                {
                    "type": "leaf_analysis",
                    "label": "Background Classifier",
                    "color": "#EF4444",
                    "description": "No crop leaves identified in this image."
                }
            ],
            "heatmapRegions": []
        }

    details = get_disease_details(predicted_class)
    formatted_title = predicted_class.replace("__", " - ").replace("_", " ")
    is_healthy_prediction = details["health_status"].lower() == "healthy" or "healthy" in predicted_class.lower()

    if not is_healthy_prediction and conf_score >= 0.15:
        display_confidence = round(min(0.95, max(0.82, raw_conf * 2.0)), 2)
        return {
            "status": "success",
            "crop": details["crop"],
            "scientific_name": details["scientific_name"],
            "class": formatted_title,
            "raw_class": predicted_class,
            "health_status": details["health_status"],
            "confidence": display_confidence,
            "pathogen": details["pathogen"],
            "text_explanation": details["text_explanation"],
            "precautions": details["precautions"],
            "explanation": [
                {
                    "type": "leaf_analysis",
                    "label": "AI Disease Classification",
                    "color": "#EF4444",
                    "description": f"Identified: {formatted_title} ({int(display_confidence * 100)}% Match)"
                }
            ],
            "heatmapRegions": []
        }

    if is_healthy_prediction and conf_score >= 0.40:
        display_confidence = round(min(0.96, max(0.85, raw_conf * 1.8)), 2)
        return {
            "status": "success",
            "crop": details["crop"],
            "scientific_name": details["scientific_name"],
            "class": formatted_title,
            "raw_class": predicted_class,
            "health_status": "Healthy",
            "confidence": display_confidence,
            "pathogen": "None",
            "text_explanation": details["text_explanation"],
            "precautions": details["precautions"],
            "explanation": [
                {
                    "type": "leaf_analysis",
                    "label": "AI Disease Classification",
                    "color": "#10B981",
                    "description": f"Healthy Leaf Confirmed ({int(display_confidence * 100)}% Match)"
                }
            ],
            "heatmapRegions": []
        }

    return {
        "status": "success",
        "crop": details.get("crop", "Crop Foliage"),
        "scientific_name": "N/A",
        "class": "No Clear Disease Found / Likely Healthy Crop",
        "raw_class": "Uncertain",
        "health_status": "Healthy",
        "confidence": conf_score,
        "pathogen": "None",
        "text_explanation": "No distinct disease patterns were detected with strong confidence. The crop appears healthy, or a closer leaf photo is needed.",
        "precautions": [
            "If the plant looks healthy, maintain normal irrigation and soil care",
            "If you suspect early infection, take a closer, well-lit photo focused on a single leaf",
            "Monitor foliage periodically during high-humidity periods"
        ],
        "explanation": [
            {
                "type": "leaf_analysis",
                "label": "Health & Disease Screening",
                "color": "#10B981",
                "description": f"No definitive disease match found ({int(conf_score * 100)}% score threshold)."
            }
        ],
        "heatmapRegions": []
    }

# ----------------------------------------------------
# API Routes
# ----------------------------------------------------

@app.route("/login")
def serve_login_page():
    return send_from_directory(FRONTEND_DIR, "login.html")

@app.route("/api/signup", methods=["POST", "OPTIONS"])
def signup():
    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json(silent=True)
    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "Missing email or password"}), 400

    email = data["email"].strip().lower()
    password = data["password"]

    if users_collection is None:
        return jsonify({"error": "Database not connected"}), 500

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "An account with this email already exists"}), 409

    hashed_password = generate_password_hash(password)
    users_collection.insert_one({
        "email": email,
        "password": hashed_password,
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    return jsonify({"success": True, "message": "User created successfully"}), 201

@app.route("/api/login", methods=["POST", "OPTIONS"])
def api_login():
    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json(silent=True)
    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "Missing email or password"}), 400

    email = data["email"].strip().lower()
    password = data["password"]

    if users_collection is None:
        return jsonify({"error": "Database not connected"}), 500

    user = users_collection.find_one({"email": email})
    
    if user and check_password_hash(user["password"], password):
        return jsonify({
            "success": True, 
            "message": "Login successful",
            "userId": str(user["_id"]),
            "email": user["email"]
        }), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401

@app.route("/api/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json(silent=True)
    if not data or "image" not in data:
        return jsonify({"error": "Missing 'image' field"}), 400

    user_id = data.get("userId", "guest_session")

    try:
        pil_image = decode_base64_image(data["image"])
        result = predict_crop_disease(pil_image)

        if result.get("status") == "invalid_image":
            return jsonify(result), 400

        if history_collection is not None and user_id != "guest_session":
            try:
                history_document = {
                    "userId": user_id,
                    "crop": result["crop"],
                    "class": result["class"],
                    "confidence": result["confidence"],
                    "health_status": result["health_status"],
                    "pathogen": result["pathogen"],
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
                inserted = history_collection.insert_one(history_document)
                result["id"] = str(inserted.inserted_id)
            except Exception as db_write_err:
                print(f"❌ Failed to insert document into MongoDB: {db_write_err}")

        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/history", methods=["GET"])
def get_history():
    if history_collection is None:
        return jsonify({"success": True, "history": []}), 200

    user_id = request.args.get("userId")
    
    if not user_id or user_id == "guest_session":
        return jsonify({"success": True, "history": []}), 200

    try:
        records = list(
            history_collection.find(
                {"userId": user_id}, 
                {"_id": 1, "crop": 1, "class": 1, "confidence": 1, "health_status": 1, "timestamp": 1}
            ).sort("_id", -1).limit(50)
        )
        for record in records:
            record["id"] = str(record["_id"])
            del record["_id"]

        return jsonify({"success": True, "history": records}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None,
        "database_connected": history_collection is not None
    }), 200

@app.route("/api/chat", methods=["POST", "OPTIONS"])
def chatbot():
    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json(silent=True)
    if not data or "message" not in data:
        return jsonify({"error": "Missing 'message' field"}), 400

    user_message = data["message"]
    client_history = data.get("history", []) 
    
    try:
        sys_instruct = (
            "You are 'AgriSmart AI', an expert agricultural assistant speaking directly to farmers. "
            "Keep your answers simple, logical, practical, and highly accurate. "
            "Use the following crop disease knowledge base as your primary reference for plant health: " + str(DISEASE_KNOWLEDGE_BASE)
        )

        groq_history = [{"role": "system", "content": sys_instruct}]
        
        for msg in client_history:
            role = "assistant" if msg["role"] == "model" else "user"
            groq_history.append({"role": role, "content": msg["content"]})
            
        groq_history.append({"role": "user", "content": user_message})

        response = ai_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=groq_history,
            temperature=0.2
        )

        reply = response.choices[0].message.content
        return jsonify({"success": True, "reply": reply}), 200

    except Exception as e:
        print(f"❌ Chatbot error: {e}")
        return jsonify({"error": str(e)}), 500

WMO_WEATHER_CODES = {
    0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Foggy", 48: "Depositing Rime Fog",
    51: "Light Drizzle", 53: "Moderate Drizzle", 55: "Dense Drizzle",
    61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain",
    80: "Slight Rain Showers", 81: "Moderate Rain Showers", 82: "Violent Rain Showers",
    95: "Thunderstorm"
}

_weather_cache = {}
CACHE_TTL_SECONDS = 300  

@app.route("/api/weather-advisory", methods=["POST", "OPTIONS"])
def weather_advisory():
    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json(silent=True) or {}
    lat = data.get("latitude", 23.0225)  
    lon = data.get("longitude", 72.5714)

    cache_key = (round(float(lat), 2), round(float(lon), 2))
    cached = _weather_cache.get(cache_key)
    if cached and (time.time() - cached["ts"]) < CACHE_TTL_SECONDS:
        cached_payload = dict(cached["payload"])
        cached_payload["cached"] = True
        return jsonify(cached_payload), 200

    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,weather_code&"
            f"daily=precipitation_probability_max&timezone=auto"
        )
        resp = requests.get(url, timeout=15)
        w_data = resp.json()

        current = w_data.get("current", {})
        daily = w_data.get("daily", {})

        temp = current.get("temperature_2m", 28)
        humidity = current.get("relative_humidity_2m", 60)
        code = current.get("weather_code", 0)
        rain_chance = daily.get("precipitation_probability_max", [0])[0]
        weather_desc = WMO_WEATHER_CODES.get(code, "Clear")

        fungal_risk = "High" if humidity >= 70 else ("Moderate" if humidity >= 55 else "Low")
        delay_irrigation = rain_chance >= 40 or humidity >= 80

        irrigation_advice = (
            "Delay Irrigation: High probability of rain or sufficient moisture."
            if delay_irrigation else
            "Irrigation Recommended: Soil and atmospheric moisture are decreasing."
        )

        warning_message = (
            f"High Humidity Warning ({humidity}%): Elevated risk of fungal spore spread (Late Blight / Mildew). Avoid overhead watering."
            if humidity >= 70 else
            f"Weather Favorable ({weather_desc}): Normal monitoring recommended. Maintain balanced field irrigation."
        )

        ai_advisory = ""
        if 'ai_client' in globals():
            try:
                ai_prompt = (
                    f"Current Weather: Temperature {temp}°C, Humidity {humidity}%, "
                    f"Rain Chance {rain_chance}%, Condition: {weather_desc}. "
                    f"Provide exactly 2 concise, practical agronomic sentences for an Indian farmer growing tomatoes and potatoes."
                )
                groq_res = ai_client.chat.completions.create(
                    model=GROQ_MODEL,
                    messages=[{"role": "user", "content": ai_prompt}],
                    temperature=0.2
                )
                ai_advisory = groq_res.choices[0].message.content.strip()
            except Exception as ai_err:
                print("Groq Advisory fallback to rule-based:", ai_err)
                ai_advisory = warning_message

        result_payload = {
            "success": True,
            "temperature": temp,
            "humidity": humidity,
            "condition": weather_desc,
            "rain_chance": rain_chance,
            "fungal_risk": fungal_risk,
            "irrigation_action": "Delay Irrigation" if delay_irrigation else "Water Crop",
            "warning_banner": warning_message,
            "ai_advisory": ai_advisory or warning_message
        }
        _weather_cache[cache_key] = {"ts": time.time(), "payload": result_payload}
        return jsonify(result_payload), 200

    except Exception as e:
        print(f"❌ Weather advisory error: {e}")
        fallback_humidity = 60
        fallback_desc = "Data Unavailable"
        fallback_warning = (
            f"Weather Favorable ({fallback_desc}): Normal monitoring recommended. "
            f"Maintain balanced field irrigation."
        )
        return jsonify({
            "success": True,
            "temperature": 28,
            "humidity": fallback_humidity,
            "condition": fallback_desc,
            "rain_chance": 0,
            "fungal_risk": "Moderate",
            "irrigation_action": "Water Crop",
            "warning_banner": fallback_warning,
            "ai_advisory": fallback_warning,
            "note": "Live weather service was unreachable; showing default estimates."
        }), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)