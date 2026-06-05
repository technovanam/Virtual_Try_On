from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ComparedItem(BaseModel):
    id: str # Can be a TryOnId or HairstyleId depending on what is being compared
    imageUrl: str
    name: Optional[str] = None

class AIStyleScore(BaseModel):
    itemId: str
    score: int
    pros: List[str]
    cons: List[str]

class AIRecommendationPanel(BaseModel):
    bestStyleId: str
    scores: List[AIStyleScore]
    recommendationReason: str

class CompareCreateRequest(BaseModel):
    comparisonType: str # before_after, two_style, four_style, color_comparison, beard_comparison
    items: List[ComparedItem]

class Comparison(BaseModel):
    comparisonId: str
    comparisonType: str
    comparedItems: List[ComparedItem]
    aiPanel: Optional[AIRecommendationPanel] = None
    selectedWinner: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

class CompareListResponse(BaseModel):
    comparisons: List[Comparison]

class CompareResponse(BaseModel):
    status: str
    comparison: Optional[Comparison] = None
