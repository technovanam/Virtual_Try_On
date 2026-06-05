from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class SavedItemCreate(BaseModel):
    itemType: Literal["hairstyle", "tryon", "comparison", "haircolor", "beardstyle"]
    referenceId: str
    title: str
    imageUrl: str
    category: Optional[str] = "Favorites" # Acts as Folder name
    matchScore: Optional[int] = 0

class SavedItemUpdate(BaseModel):
    category: Optional[str] = None
    title: Optional[str] = None

class SavedItem(BaseModel):
    savedId: str
    itemType: str
    referenceId: str
    title: str
    imageUrl: str
    category: str
    matchScore: int
    viewCount: int
    createdAt: datetime
    updatedAt: datetime

class SavedItemResponse(BaseModel):
    items: List[SavedItem]
    total: int
