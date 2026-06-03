from typing import List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

class Notification(BaseModel):
    notificationId: str
    title: str
    message: str
    type: Optional[str] = "info"
    isRead: Optional[bool] = False
    actionUrl: Optional[str] = None
    createdAt: datetime
    priority: Optional[str] = "normal"

class NotificationResponse(BaseModel):
    notifications: List[Notification]
    unreadCount: int
