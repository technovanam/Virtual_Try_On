from typing import List, Optional, Any
from pydantic import BaseModel

class SearchResult(BaseModel):
    id: str
    type: str  # e.g., 'hairstyle', 'category', 'collection'
    title: str
    image: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = []
    popularityScore: Optional[int] = 0

class SearchResponse(BaseModel):
    results: List[SearchResult]
    total: int
    page: int = 1
    limit: int = 20
    totalPages: int = 1
    categories: Optional[List[str]] = []

class TrendingResponse(BaseModel):
    trends: List[str]

class CategoriesResponse(BaseModel):
    categories: List[str]
