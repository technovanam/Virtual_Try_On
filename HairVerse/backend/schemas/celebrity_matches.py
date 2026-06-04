from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CelebrityMatch(BaseModel):
    celebrityId: str
    celebrityName: str
    celebrityImage: str
    hairstyleName: str
    hairstyleImage: str
    matchScore: float
    faceShapeMatch: float
    hairMatch: float
    generatedAt: Optional[datetime] = None

class CelebrityMatchesResponse(BaseModel):
    matches: List[CelebrityMatch]
    total: int
