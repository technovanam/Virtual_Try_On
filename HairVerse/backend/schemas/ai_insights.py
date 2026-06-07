from typing import Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime

class AIInsightsResponse(BaseModel):
    faceAnalysis: Dict[str, Any]
    hairAnalysis: Dict[str, Any]
    geminiAnalysis: Dict[str, Any]
    combinedInsights: Dict[str, Any]
    status: str
