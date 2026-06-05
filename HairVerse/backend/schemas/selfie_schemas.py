from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class SelfieRecord(BaseModel):
    imageId: str
    imageUrl: str
    storagePath: str
    source: str
    status: str
    isActive: bool
    uploadedAt: datetime
    updatedAt: datetime

class SelfieUploadResponse(BaseModel):
    data: SelfieRecord

class SelfieListResponse(BaseModel):
    data: List[SelfieRecord]
    nextCursor: Optional[str] = None

class UpdateActiveRequest(BaseModel):
    isActive: bool
