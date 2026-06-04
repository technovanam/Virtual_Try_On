from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class AnalysisStatusResponse(BaseModel):
    analysisId: str
    status: str
    progress: int
    createdAt: datetime
    completedAt: Optional[datetime] = None
    imageId: Optional[str] = None
    analysisType: Optional[str] = None
