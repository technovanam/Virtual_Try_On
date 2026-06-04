from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class RecommendationItem(BaseModel):
    recommendationId: str
    hairstyleId: str
    hairstyleName: str
    category: str
    suitabilityScore: float
    maintenanceLevel: str
    recommendationReason: str
    generatedAt: datetime
    imageUrl: Optional[str] = None

class RecommendationResponse(BaseModel):
    recommendations: List[RecommendationItem]
    total: int
    generatedAt: Optional[datetime] = None
