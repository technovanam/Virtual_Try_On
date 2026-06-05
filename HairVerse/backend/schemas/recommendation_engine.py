from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class RecommendationGenerateRequest(BaseModel):
    faceShape: Optional[str] = None
    hairDensity: Optional[str] = None
    hairTexture: Optional[str] = None
    hairLength: Optional[str] = None
    hairColor: Optional[str] = None
    userPreferences: Optional[dict] = None
    styleGoals: Optional[List[str]] = None

class RecommendationEngineResponse(BaseModel):
    status: str
    recommendationId: Optional[str] = None
    hairstyleId: Optional[str] = None
    suitabilityScore: Optional[float] = None
    reasons: Optional[List[str]] = None
    generatedAt: Optional[datetime] = None
