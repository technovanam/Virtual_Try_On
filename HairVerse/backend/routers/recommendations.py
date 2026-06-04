from fastapi import APIRouter, Depends, HTTPException
from middleware.auth_middleware import get_current_user
from schemas.recommendations import RecommendationResponse
from services.recommendation_service import RecommendationService

router = APIRouter()

@router.get(
    "/",
    response_model=RecommendationResponse,
    responses={
        200: {"description": "Return recommendations"},
        401: {"description": "Invalid or expired Firebase ID token"},
    },
)
async def get_recommendations(current_user: dict = Depends(get_current_user)):
    """
    Get personalized hairstyle recommendations for the authenticated user.
    """
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        response = RecommendationService.get_recommendations(uid)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
