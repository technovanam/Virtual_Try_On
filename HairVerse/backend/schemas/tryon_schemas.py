from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TryOnStartRequest(BaseModel):
    imageId: str
    hairstyleId: str

class TryOnStartResponse(BaseModel):
    tryOnId: str
    status: str

class TryOnStatusResponse(BaseModel):
    tryOnId: str
    status: str
    resultImage: Optional[str] = None
    imageId: Optional[str] = None
    hairstyleId: Optional[str] = None
    createdAt: Optional[datetime] = None
    completedAt: Optional[datetime] = None
