from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class TimelineEvent(BaseModel):
    eventId: str
    eventType: str
    title: str
    description: str
    imageUrl: Optional[str] = None
    referenceId: Optional[str] = None
    createdAt: datetime

class TimelineResponse(BaseModel):
    events: List[TimelineEvent]
    nextCursor: Optional[str] = None
