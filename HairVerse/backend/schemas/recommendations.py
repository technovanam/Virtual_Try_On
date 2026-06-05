from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class Recommendation(BaseModel):
    recommendationId: str
    hairstyleName: str
    category: str
    suitabilityScore: int
    maintenanceLevel: str
    recommendationReason: str
    confidenceScore: float
    imageUrl: Optional[str] = None

class ColorRecommendation(BaseModel):
    colorName: str
    hexCode: str
    reason: str

class BeardRecommendation(BaseModel):
    beardStyle: str
    reason: str
    maintenanceLevel: str

class CelebrityMatch(BaseModel):
    celebrityName: str
    matchScore: int
    reason: str
    imageUrl: Optional[str] = None

class TrendingMatch(BaseModel):
    styleName: str
    trendReason: str

class RecommendationListResponse(BaseModel):
    summary: str
    recommendations: List[Recommendation]
    hairColors: List[ColorRecommendation]
    beards: List[BeardRecommendation]
    celebrities: List[CelebrityMatch]
    trending: List[TrendingMatch]
    generatedAt: Optional[datetime] = None

class RecommendationGenerateRequest(BaseModel):
    analysisId: Optional[str] = None
