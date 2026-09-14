# backend/disease_info.py

DISEASE_KNOWLEDGE_BASE = {
    "Pepper__bell___Bacterial_spot": {
        "crop": "Bell Pepper",
        "scientific_name": "Capsicum annuum",
        "pathogen": "Xanthomonas campestris",
        "health_status": "At Risk",
        "text_explanation": "Small, water-soaked, dark green spot lesions detected on the leaf surface.",
        "precautions": [
            "Apply copper-based bactericides early in the morning",
            "Avoid overhead irrigation to prevent bacteria spread",
            "Remove and destroy severely infected plant foliage"
        ]
    },
    "Pepper__bell___healthy": {
        "crop": "Bell Pepper",
        "scientific_name": "Capsicum annuum",
        "pathogen": "None",
        "health_status": "Healthy",
        "text_explanation": "Leaf structure shows uniform green pigmentation with no active lesions.",
        "precautions": [
            "Continue standard watering and crop rotation practices",
            "Monitor weekly for early signs of pest infestation"
        ]
    },
    "Potato___Early_blight": {
        "crop": "Potato",
        "scientific_name": "Solanum tuberosum",
        "pathogen": "Alternaria solani",
        "health_status": "At Risk",
        "text_explanation": "Dark brown concentric rings with surrounding chlorotic yellow halos observed.",
        "precautions": [
            "Apply recommended fungicides containing chlorothalonil or mancozeb",
            "Ensure proper crop spacing for high airflow",
            "Rotate crops with non-solanaceous plants next season"
        ]
    },
    "Potato___Late_blight": {
        "crop": "Potato",
        "scientific_name": "Solanum tuberosum",
        "pathogen": "Phytophthora infestans",
        "health_status": "At Risk",
        "text_explanation": "Large, dark water-soaked lesions spreading rapidly along leaf margins.",
        "precautions": [
            "Apply systemic protective fungicides immediately",
            "Destroy infected haulms prior to tuber harvest",
            "Ensure tubers are well-covered with soil to prevent spore contamination"
        ]
    },
    "Potato___healthy": {
        "crop": "Potato",
        "scientific_name": "Solanum tuberosum",
        "pathogen": "None",
        "health_status": "Healthy",
        "text_explanation": "Healthy leaf tissue with normal cell structure and chlorophyll concentration.",
        "precautions": [
            "Maintain soil moisture at optimal field capacity",
            "Conduct routine inspections every 5 to 7 days"
        ]
    },
    "Tomato_Bacterial_spot": {
        "crop": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "pathogen": "Xanthomonas vesicatoria",
        "health_status": "At Risk",
        "text_explanation": "Numerous dark brown circular spots causing yellowing and premature leaf drop.",
        "precautions": [
            "Spray copper fungicides combined with mancozeb",
            "Sanitize garden tools between plant treatments",
            "Avoid working in the field when foliage is wet"
        ]
    },
    "Tomato_Early_blight": {
        "crop": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "pathogen": "Alternaria solani",
        "health_status": "At Risk",
        "text_explanation": "Concentric target-board spots present on older lower leaves.",
        "precautions": [
            "Prune off lower infected leaves to break fungal spore cycle",
            "Apply drip irrigation instead of sprinkler systems",
            "Apply preventative organic copper spray"
        ]
    },
    "Tomato_Late_blight": {
        "crop": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "pathogen": "Phytophthora infestans",
        "health_status": "At Risk",
        "text_explanation": "Pale green or dark water-soaked spots rapidly expanding into necrotic patches.",
        "precautions": [
            "Apply protective fungicide sprays like copper hydroxide",
            "Immediately remove and burn heavily damaged plants",
            "Avoid overhead watering"
        ]
    },
    "Tomato_Leaf_Mold": {
        "crop": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "pathogen": "Passalora fulva",
        "health_status": "At Risk",
        "text_explanation": "Pale yellow spots on upper leaf surfaces with olive-green velvety mold underneath.",
        "precautions": [
            "Increase greenhouse/field ventilation to reduce humidity below 85%",
            "Apply sulfur-based or copper fungicides",
            "Space plants adequately to allow proper sunlight exposure"
        ]
    },
    "Tomato_Septoria_leaf_spot": {
        "crop": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "pathogen": "Septoria lycopersici",
        "health_status": "At Risk",
        "text_explanation": "Small circular spots with grey-white centers and dark brown borders.",
        "precautions": [
            "Apply mulch around the base of plants to prevent fungal soil splash",
            "Apply fungicidal sprays at first sight of spots",
            "Practice strict 3-year crop rotation"
        ]
    },
    "Tomato_Spider_mites_Two_spotted_spider_mite": {
        "crop": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "pathogen": "Tetranychus urticae",
        "health_status": "At Risk",
        "text_explanation": "Fine white/yellow stippling on leaves with light webbing under foliage.",
        "precautions": [
            "Apply insecticidal soap or neem oil spray to underside of leaves",
            "Introduce natural predators such as predatory mites",
            "Keep crop foliage adequately hydrated during hot periods"
        ]
    },
    "Tomato__Target_Spot": {
        "crop": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "pathogen": "Corynespora cassiicola",
        "health_status": "At Risk",
        "text_explanation": "Necrotic brown spots with prominent light brown centers and yellow borders.",
        "precautions": [
            "Apply appropriate broad-spectrum fungicides",
            "Maintain optimal plant nutrient levels",
            "Remove weeds around crop area that harbor pathogens"
        ]
    },
    "Tomato__Tomato_YellowLeaf__Curl_Virus": {
        "crop": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "pathogen": "TYLCV (Begomovirus)",
        "health_status": "At Risk",
        "text_explanation": "Severe upward leaf curling, yellowing leaf margins, and stunted plant growth.",
        "precautions": [
            "Control whitefly vector populations using yellow sticky traps or neem oil",
            "Use reflective mulches to deter whiteflies from landing",
            "Remove and destroy virus-infected plants immediately"
        ]
    },
    "Tomato__Tomato_mosaic_virus": {
        "crop": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "pathogen": "ToMV (Tobamovirus)",
        "health_status": "At Risk",
        "text_explanation": "Mottled light and dark green mosaic patterns with blister-like leaf malformations.",
        "precautions": [
            "Disinfect tools and wash hands thoroughly before handling plants",
            "Destroy infected plants to stop mechanical transmission",
            "Plant resistant crop varieties in future cycles"
        ]
    },
    "Tomato_healthy": {
        "crop": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "pathogen": "None",
        "health_status": "Healthy",
        "text_explanation": "Vibrant leaf tissue showing normal development and zero leaf spots.",
        "precautions": [
            "Maintain balanced N-P-K fertilization",
            "Inspect foliage regularly for emerging pests"
        ]
    }
}

def get_disease_details(class_name: str) -> dict:
    """Return mapped disease information or a default fallback."""
    cleaned_name = class_name.strip()
    return DISEASE_KNOWLEDGE_BASE.get(cleaned_name, {
        "crop": "Crop / Plant",
        "scientific_name": "Plantae",
        "pathogen": "Unknown",
        "health_status": "Uncertain",
        "text_explanation": f"Detected condition: {class_name}.",
        "precautions": ["Consult a local agricultural extension officer for detailed inspection."]
    })