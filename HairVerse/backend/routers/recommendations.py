from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_recommendations(uid: str = None):
    # MVP: Mock recommendations
    return [
        {
            "id": "style_01",
            "name": "Classic Fade",
            "category": "Fade",
            "suitability_score": 95,
            "preview_url": "https://example.com/fade.png"
        }
    ]

@router.get("/hairstyles")
async def get_hairstyles():
    return []

@router.get("/hairstyles/{id}")
async def get_hairstyle(id: str):
    return {"id": id, "name": "Hairstyle detail"}

@router.get("/trending")
async def get_trending():
    return []
