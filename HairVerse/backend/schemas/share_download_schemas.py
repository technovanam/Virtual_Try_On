from pydantic import BaseModel
from typing import Optional

class TrackRequest(BaseModel):
    resourceType: str
    resourceId: str
    platform: Optional[str] = None

class TrackResponse(BaseModel):
    success: bool
    message: str
    trackedId: str
