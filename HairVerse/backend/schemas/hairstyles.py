from pydantic import BaseModel, Field
from typing import List, Optional, Any

class Hairstyle(BaseModel):
    hairstyleId: str
    hairstyleName: str
    category: str
    gender: Optional[str] = None
    description: str
    imageUrl: str
    tags: List[str] = []
    maintenanceLevel: str
    popularityScore: int = 0
    trendingScore: int = 0
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
    isActive: bool = True

class HairstyleDetailsResponse(Hairstyle):
    pass

class PaginatedHairstylesResponse(BaseModel):
    hairstyles: List[Hairstyle]
    nextCursor: Optional[str] = None
    totalCount: Optional[int] = None
