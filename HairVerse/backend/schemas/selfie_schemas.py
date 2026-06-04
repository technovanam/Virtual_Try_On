from pydantic import BaseModel
from datetime import datetime

class SelfieUploadResponse(BaseModel):
    imageId: str
    imageUrl: str
    uploadedAt: datetime
