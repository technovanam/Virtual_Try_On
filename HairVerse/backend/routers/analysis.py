import base64
from fastapi import APIRouter, Body, File, HTTPException, UploadFile
from pydantic import BaseModel
from services.face_detection import detect_face_shape
from services.hair_analysis import analyze_hair, analyze_beard
from services.recommendation_engine import generate_ai_recommendations

router = APIRouter()

class AnalysisRequest(BaseModel):
    image_base64: str

@router.post("/upload")
async def process_image(
    file: UploadFile = File(default=None),
    payload: AnalysisRequest = Body(default=None)
):
    try:
        contents = None
        if file is not None:
            contents = await file.read()
        elif payload and payload.image_base64:
            header_indicator = "base64,"
            base64_data = payload.image_base64.split(header_indicator, 1)[1] if header_indicator in payload.image_base64 else payload.image_base64
            contents = base64.b64decode(base64_data)
        else:
            raise HTTPException(status_code=400, detail="No image provided")
        
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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")

@router.get("/{uid}/latest")
async def get_latest_analysis(uid: str):
    return {"message": "Latest analysis placeholder"}

@router.get("/{uid}/history")
async def get_analysis_history(uid: str):
    return []
