from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class GeminiAnalyzeRequest(BaseModel):
    imageUrl: str = Field(..., description="The URL of the uploaded selfie to analyze.")

class GeminiAnalysisResponse(BaseModel):
    status: str
    analysisId: str
    faceShape: Optional[str] = None
    hairLength: Optional[str] = None
    hairTexture: Optional[str] = None
    hairType: Optional[str] = None
    hairDensity: Optional[str] = None
    hairVolume: Optional[str] = None
    hairColor: Optional[str] = None
    confidence: Optional[float] = None
    healthObservations: Optional[List[str]] = None
    bestHairstyles: Optional[List[str]] = None
    bestHairColors: Optional[List[str]] = None
    bestBeardStyles: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    recommendedStylesDetailed: Optional[List[dict]] = None
    facialFeatureSummary: Optional[str] = None
    analyzedAt: Optional[datetime] = None
    analysisVersion: Optional[int] = 1
