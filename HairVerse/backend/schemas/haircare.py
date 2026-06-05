from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class HairCareSuggestion(BaseModel):
    suggestionId: str
    title: str
    description: str
    category: str
    priority: str
    confidence: float
    generatedAt: datetime

class HairCareResponse(BaseModel):
    status: str
    suggestions: List[HairCareSuggestion]
    generatedAt: datetime

class GenerateHairCareRequest(BaseModel):
    context: Optional[str] = None
