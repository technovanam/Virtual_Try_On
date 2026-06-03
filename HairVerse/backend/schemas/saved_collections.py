from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CollectionItem(BaseModel):
    collectionId: str
    collectionName: str
    hairstyleId: str
    hairstyleName: str
    hairstyleImage: str
    category: str
    savedAt: datetime
    notes: Optional[str] = None
    tags: Optional[List[str]] = []

class SavedCollectionResponse(BaseModel):
    collections: List[CollectionItem]
    total: int
