from fastapi import APIRouter, Depends, HTTPException
from middleware.auth_middleware import get_current_user
from schemas.ai_insights import AIInsightsResponse
from services.ai_insights_service import AIInsightsService

router = APIRouter()

@router.get("", response_model=AIInsightsResponse)
async def get_ai_insights(current_user: dict = Depends(get_current_user)):
    """
    Fetch personalized hair and appearance insights for the authenticated user.
    """
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        insights = AIInsightsService.get_user_insights(uid)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
