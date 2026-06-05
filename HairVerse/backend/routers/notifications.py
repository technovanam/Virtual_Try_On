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

@router.patch("/{notification_id}/read")
async def mark_notification_as_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    """
    Mark a notification as read.
    """
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        success = NotificationsService.mark_as_read(uid, notification_id)
        if not success:
            raise HTTPException(status_code=404, detail="Notification not found or failed to update")
            
        return {"success": True, "message": "Notification marked as read"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{notification_id}")
async def delete_notification(notification_id: str, current_user: dict = Depends(get_current_user)):
    """
    Delete a notification.
    """
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        success = NotificationsService.delete_notification(uid, notification_id)
        if not success:
            raise HTTPException(status_code=404, detail="Notification not found or failed to delete")
            
        return {"success": True, "message": "Notification deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
