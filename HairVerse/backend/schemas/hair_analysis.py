from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class HairAnalysisStartRequest(BaseModel):
    imageUrl: Optional[str] = None

class HairAnalysisResponse(BaseModel):
    status: str
    analysisId: Optional[str] = None
    density: Optional[str] = None
    thickness: Optional[str] = None
    length: Optional[str] = None
    texture: Optional[str] = None
    color: Optional[str] = None
    healthScore: Optional[float] = None
    hairlineType: Optional[str] = None
    confidence: Optional[float] = None
    analyzedAt: Optional[datetime] = None
