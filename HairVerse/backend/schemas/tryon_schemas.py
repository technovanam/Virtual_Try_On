from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class GenerationConfig(BaseModel):
    provider: str = Field(default="replicate", description="Provider to use for generation (e.g., replicate, mock, imagen)")
    steps: Optional[int] = 30
    guidance_scale: Optional[float] = 7.5

class TryOnStartRequest(BaseModel):
    imageId: str
    hairstyleId: str

class GenerateTryOnRequest(BaseModel):
    imageId: str
    hairstyleId: str
    config: Optional[GenerationConfig] = None

class TryOnStartResponse(BaseModel):
    tryOnId: str
    status: str

class TryOnStatusResponse(BaseModel):
    tryOnId: str
    status: str
    resultImage: Optional[str] = None
    imageId: Optional[str] = None
    hairstyleId: Optional[str] = None
    createdAt: Optional[datetime] = None
    completedAt: Optional[datetime] = None
