from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class CompareCreateRequest(BaseModel):
    hairstyleIds: List[str]
    selectedImages: Optional[List[str]] = []

class CompareCreateResponse(BaseModel):
    comparisonId: str
    status: str

class CompareGetResponse(BaseModel):
    comparisonId: str
    hairstyles: List[Dict[str, Any]]
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
