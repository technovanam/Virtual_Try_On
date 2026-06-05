from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FaceAnalysisStartRequest(BaseModel):
    imageUrl: Optional[str] = None

class FaceAnalysisResponse(BaseModel):
    status: str
    analysisId: Optional[str] = None
    faceShape: Optional[str] = None
    symmetryScore: Optional[float] = None
    foreheadType: Optional[str] = None
    jawlineType: Optional[str] = None
    confidence: Optional[float] = None
    analyzedAt: Optional[datetime] = None
