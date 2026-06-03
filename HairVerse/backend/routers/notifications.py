from fastapi import APIRouter, Depends, HTTPException
from middleware.auth_middleware import get_current_user
from schemas.notifications import NotificationResponse
from services.notifications_service import NotificationsService

router = APIRouter()

@router.get("", response_model=NotificationResponse)
async def get_notifications(current_user: dict = Depends(get_current_user)):
    """
    Fetch notifications for the authenticated user.
    """
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        response = NotificationsService.get_notifications(uid)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
