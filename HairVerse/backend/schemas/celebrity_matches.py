from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class CelebrityMatchItem(BaseModel):
    matchId: str
    celebrityName: str
    similarityScore: float
    faceShapeMatch: str
    hairstyleMatch: str
    reasoning: str
    imageUrl: str

class CelebrityMatchesResponse(BaseModel):
    matches: List[CelebrityMatchItem]
    generatedAt: Optional[datetime] = None

class CelebrityMatchGenerateRequest(BaseModel):
    analysisId: Optional[str] = None
