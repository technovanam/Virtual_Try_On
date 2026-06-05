from fastapi import APIRouter, Depends, HTTPException
from middleware.auth_middleware import get_current_user
from schemas.recommendation_engine import RecommendationGenerateRequest, RecommendationEngineResponse
from services.recommendation_engine_service import RecommendationEngineService

router = APIRouter()

@router.post("/generate", response_model=RecommendationEngineResponse)
async def generate_recommendation(request: RecommendationGenerateRequest, current_user: dict = Depends(get_current_user)):
    """
    Start the recommendation generation pipeline.
    """
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        return RecommendationEngineService.generate(uid, request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{recommendationId}", response_model=RecommendationEngineResponse)
async def get_recommendation(recommendationId: str, current_user: dict = Depends(get_current_user)):
    """
    Fetch a specific recommendation result.
    """
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        return RecommendationEngineService.get_recommendation(uid, recommendationId)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
