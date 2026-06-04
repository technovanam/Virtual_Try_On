from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class SavedItemCreate(BaseModel):
    itemType: Literal["hairstyle", "tryon", "comparison"]
    referenceId: str
    title: str
    imageUrl: str

class SavedItem(BaseModel):
    savedId: str
    itemType: str
    referenceId: str
    title: str
    imageUrl: str
    createdAt: datetime
    updatedAt: datetime

class SavedItemResponse(BaseModel):
    items: List[SavedItem]
    total: int
