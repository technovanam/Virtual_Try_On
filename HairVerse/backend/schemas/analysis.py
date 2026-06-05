from typing import Optional, List
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

class CompleteAnalysisResultResponse(BaseModel):
    status: str
    analysisId: str
    faceShape: Optional[str] = None
    jawlineType: Optional[str] = None
    foreheadType: Optional[str] = None
    faceSymmetryScore: Optional[int] = None
    hairLength: Optional[str] = None
    hairDensity: Optional[str] = None
    hairTexture: Optional[str] = None
    hairColor: Optional[str] = None
    hairHealthScore: Optional[int] = None
    hairlineType: Optional[str] = None
    beardDensity: Optional[str] = None
    beardCompatibility: Optional[str] = None
    celebrityMatchSummary: Optional[str] = None
    recommendationSummary: Optional[str] = None
    confidence: Optional[float] = None
    healthObservations: List[str] = []
    recommendations: List[str] = []
    facialFeatureSummary: Optional[str] = None
    analyzedAt: Optional[datetime] = None
