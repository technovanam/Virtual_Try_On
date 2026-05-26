from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class NotificationSendRequest(BaseModel):
    uid: str
    title: str
    body: str

class BroadcastRequest(BaseModel):
    title: str
    body: str

@router.post("/send")
async def send_notification(request: NotificationSendRequest):
    return {"status": "success", "message": f"Notification queued for user {request.uid}"}

@router.post("/broadcast")
async def broadcast_notification(request: BroadcastRequest):
    return {"status": "success", "message": "Broadcast notification dispatched to all users"}
