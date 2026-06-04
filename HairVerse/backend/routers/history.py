from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth_middleware import get_current_user
from services.history_service import HistoryService

router = APIRouter()

@router.get(
    "/recent",
    response_model=dict,
    responses={
        200: {"description": "Return user history"},
        401: {"description": "Invalid or expired Firebase ID token"},
    },
)
async def get_recent_history(user: dict = Depends(get_current_user)):
    """
    Get recently tried hairstyles, beard styles, and hair colors for the authenticated user.
    """
    try:
        uid = user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        return HistoryService.get_recent_history(uid)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
