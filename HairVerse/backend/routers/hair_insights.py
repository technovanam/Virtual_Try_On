from fastapi import APIRouter, Depends, HTTPException
from middleware.auth_middleware import get_current_user
from schemas.hair_insights import HairInsightsResponse, HairInsightsHistoryResponse
from services.hair_insights_service import HairInsightsService

router = APIRouter()

@router.get("", response_model=HairInsightsResponse)
async def get_hair_insights(current_user: dict = Depends(get_current_user)):
    """
    Fetch the latest detailed hair insights for the authenticated user.
    """
    uid = current_user.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid user authentication")
    return HairInsightsService.get_insights(uid)

@router.get("/history", response_model=HairInsightsHistoryResponse)
async def get_hair_insights_history(current_user: dict = Depends(get_current_user)):
    """
    Fetch historical hair insights.
    """
    uid = current_user.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid user authentication")
    return HairInsightsService.get_history(uid)

@router.post("/generate", response_model=HairInsightsResponse)
async def generate_hair_insights(current_user: dict = Depends(get_current_user)):
    """
    Trigger a new generation of hair insights using Gemini and the latest selfie.
    """
    uid = current_user.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid user authentication")
    return HairInsightsService.generate_insights(uid)
