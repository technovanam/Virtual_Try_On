from pydantic import BaseModel, HttpUrl
from typing import Literal, Optional
from datetime import datetime

class ExportRequest(BaseModel):
    exportType: Literal["tryon", "comparison", "analysis", "recommendation"]
    resourceId: str
    imageUrl: str
    format: Literal["jpg", "png"]
    quality: Literal["standard", "hd", "ultrahd"]

class ExportRecord(BaseModel):
    exportId: str
    exportType: str
    resourceId: str
    imageUrl: str
    format: str
    quality: str
    exportedAt: datetime

class ExportResponse(BaseModel):
    success: bool
    message: str
    exportRecord: ExportRecord
