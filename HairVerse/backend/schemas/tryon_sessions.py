from typing import List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

class TryOnSession(BaseModel):
    sessionId: str
    uploadedImage: Optional[str] = None
    selectedHairstyle: Optional[str] = None
    selectedColor: Optional[str] = None
    comparisonIds: Optional[List[str]] = []
    analysisId: Optional[str] = None
    progress: Optional[int] = 0
    status: Optional[str] = "started"
    createdAt: datetime
    updatedAt: datetime

class TryOnSessionResponse(BaseModel):
    sessions: List[TryOnSession]
    total: int
