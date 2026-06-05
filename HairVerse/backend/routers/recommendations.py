from fastapi import APIRouter, Depends, HTTPException
from middleware.auth_middleware import get_current_user
from schemas.recommendations import RecommendationListResponse, RecommendationGenerateRequest
from services.recommendation_service import RecommendationService

router = APIRouter()

@router.post("/generate", response_model=RecommendationListResponse)
async def generate_recommendations(request: RecommendationGenerateRequest, current_user: dict = Depends(get_current_user)):
    """
    Generate new hairstyle recommendations using the Gemini Vision Engine.
    This combines the user's Profile Setup Data and their recent Face/Hair Analysis.
    """
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        response = RecommendationService.generate_recommendations(uid, request.analysisId)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=RecommendationListResponse)
async def get_recommendations(current_user: dict = Depends(get_current_user)):
    """
    Get the most recently generated personalized hairstyle recommendations.
    """
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        response = RecommendationService.get_recommendations(uid)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
