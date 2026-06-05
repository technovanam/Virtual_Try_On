from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime

class Notification(BaseModel):
    notificationId: str
    title: str
    message: str
    category: Literal["recommendation", "hairstyle_trend", "hair_insight", "saved_reminder", "system_update"]
    actionType: Optional[str] = None
    actionId: Optional[str] = None
    isRead: bool
    createdAt: datetime
    
    # Legacy fields
    type: Optional[str] = None
    actionUrl: Optional[str] = None
    priority: Optional[str] = None

class NotificationResponse(BaseModel):
    notifications: List[Notification]
    unreadCount: int
