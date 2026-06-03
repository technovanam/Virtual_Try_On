from typing import List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

class AIInsight(BaseModel):
    analysisId: str
    faceShape: Optional[str] = None
    hairDensity: Optional[str] = None
    hairThickness: Optional[str] = None
    hairLength: Optional[str] = None
    hairHealth: Optional[str] = None
    hairTexture: Optional[str] = None
    hairColor: Optional[str] = None
    confidenceScore: Optional[float] = None
    generatedAt: datetime

class AIInsightsResponse(BaseModel):
    insights: List[AIInsight]
    status: str
