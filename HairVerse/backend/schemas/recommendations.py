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
    generatedAt: Optional[datetime] = None

class RecommendationListResponse(BaseModel):
    recommendations: List[Recommendation]

class RecommendationGenerateRequest(BaseModel):
    analysisId: Optional[str] = None
