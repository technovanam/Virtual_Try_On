from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class HairHealthAnalysis(BaseModel):
    dryness: int
    frizz: int
    damage: int
    breakage: int
    strength: int

class HairlineAnalysis(BaseModel):
    hairlineType: str
    foreheadType: str
    growthPattern: str

class ProductSuggestion(BaseModel):
    type: str
    name: str
    reason: str

class HairInsights(BaseModel):
    insightId: str
    hairType: str
    texture: str
    density: str
    healthScore: int
    shineLevel: str
    volumeLevel: str
    grayHairPercentage: int
    
    healthAnalysis: HairHealthAnalysis
    hairlineAnalysis: HairlineAnalysis
    recommendations: List[str]
    productSuggestions: List[ProductSuggestion]
    
    analyzedAt: datetime

class HairInsightsResponse(BaseModel):
    status: str
    insights: Optional[HairInsights] = None

class HairInsightsHistoryResponse(BaseModel):
    history: List[HairInsights]
