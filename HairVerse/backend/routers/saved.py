from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth_middleware import get_current_user, get_optional_user

router = APIRouter()

@router.get("/")
async def get_saved_collections(user: dict | None = Depends(get_optional_user), uid: str = None):
    # Returns saved collections, mock data for now.
    return [
        {
            "id": "saved_01",
            "name": "Summer Cuts",
            "count": 3,
            "imageUrl": "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=200&h=200&fit=crop"
        },
        {
            "id": "saved_02",
            "name": "Favorites",
            "count": 12,
            "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
        }
    ]
