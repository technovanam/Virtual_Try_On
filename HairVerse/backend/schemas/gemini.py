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
    hairDensity: Optional[str] = None
    hairColor: Optional[str] = None
    confidence: Optional[float] = None
    healthObservations: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    facialFeatureSummary: Optional[str] = None
    analyzedAt: Optional[datetime] = None
