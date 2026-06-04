from pydantic import BaseModel
from typing import List, Optional

class HairstyleDetailsResponse(BaseModel):
    hairstyleId: str
    hairstyleName: str
    category: str
    description: str
    maintenanceLevel: str
    popularityScore: int
    imageUrl: str
    tags: List[str]
    createdAt: Optional[str] = None
