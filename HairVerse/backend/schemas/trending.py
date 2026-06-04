from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TrendingHairstyle(BaseModel):
    hairstyleId: str
    hairstyleName: str
    category: str
    previewImage: str
    trendScore: float
    popularityScore: float
    saveCount: int
    tryOnCount: int
    searchCount: int
    updatedAt: Optional[datetime] = None

class TrendingHairstylesResponse(BaseModel):
    hairstyles: List[TrendingHairstyle]
    total: int
    updatedAt: Optional[datetime] = None
