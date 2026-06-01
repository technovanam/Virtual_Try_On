from fastapi import APIRouter
from typing import Optional
from routers.recommendations import HAIRSTYLES_DATABASE

router = APIRouter()

@router.get("/trending")
async def get_trending_hairstyles(category: str = None):
    results = []
    for h in HAIRSTYLES_DATABASE:
        item = {
            **h,
            "matchScore": "95%",
            "why_matches": "Highly popular dynamic trend."
        }
        results.append(item)
    if category:
        return [h for h in results if h["category"].lower() == category.lower()]
    return results[:4]
