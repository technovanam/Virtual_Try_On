from typing import List, Optional, Any, Dict
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
    beardDensity: Optional[str] = None
    confidenceScores: Optional[Dict[str, float]] = None
    analyzedAt: datetime

class AIInsightsResponse(BaseModel):
    insights: List[AIInsight]
    status: str
