from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from middleware.auth_middleware import get_current_user, require_admin_role

router = APIRouter()

class NotificationSendRequest(BaseModel):
    uid: str
    title: str
    body: str

class BroadcastRequest(BaseModel):
    title: str
    body: str

@router.post("/send")
async def send_notification(request: NotificationSendRequest, user: dict = Depends(get_current_user)):
    # Users can only send notifications to themselves
    if request.uid != user["uid"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to send notifications to another user.",
        )
    return {"status": "success", "message": f"Notification queued for user {request.uid}"}

@router.post("/broadcast")
async def broadcast_notification(request: BroadcastRequest, user: dict = Depends(require_admin_role)):
    return {"status": "success", "message": "Broadcast notification dispatched to all users"}
