from fastapi import APIRouter, File, UploadFile
from services.face_detection import detect_face_shape
from services.hair_analysis import analyze_hair, analyze_beard
from services.recommendation_engine import generate_ai_recommendations

router = APIRouter()

@router.post("/upload")
async def process_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        # Run AI intelligence services
        face_result = detect_face_shape(contents)
        hair_result = analyze_hair(contents)
        beard_result = analyze_beard(contents)
        
        # Generate personalized styling insight from OpenRouter AI
        ai_recommendation = generate_ai_recommendations(
            face_shape=face_result["face_shape"],
            hair_type=hair_result["hair_type"],
            density=hair_result["hair_density"]
        )
        
        # Consolidate results
        return {
            "face_shape": face_result["face_shape"],
            "forehead_type": face_result["forehead_type"],
            "jawline_type": face_result["jawline_type"],
            "symmetry_score": face_result["symmetry_score"],
            
            "hair_type": hair_result["hair_type"],
            "hair_texture": hair_result["hair_texture"],
            "hair_density": hair_result["hair_density"],
            "hair_health_score": hair_result["hair_health_score"],
            
            "beard_density": beard_result["beard_density"],
            "beard_compatibility_score": beard_result["beard_compatibility_score"],
            
            "ai_insight": ai_recommendation["insight"],
            "ai_care_tips": ai_recommendation["care_tips"],
            
            "recommended_styles": ["fade_01", "korean_02", "buzz_03"],
            "celebrity_matches": [
                {"name": "Zayn Malik", "similarity": 89},
                {"name": "Gong Yoo", "similarity": 82}
            ]
        }
    except Exception as e:
        return {"error": f"Image processing failed: {str(e)}"}

@router.get("/{uid}/latest")
async def get_latest_analysis(uid: str):
    return {"message": "Latest analysis placeholder"}

@router.get("/{uid}/history")
async def get_analysis_history(uid: str):
    return []
