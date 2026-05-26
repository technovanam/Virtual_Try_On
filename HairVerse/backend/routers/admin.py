from fastapi import APIRouter
from typing import List, Dict

router = APIRouter()

@router.get("/users")
async def list_users():
    return [
        {"uid": "user_1", "username": "hair_guru", "email": "guru@example.com", "subscription": "premium"},
        {"uid": "user_2", "username": "fade_king", "email": "king@example.com", "subscription": "free"}
    ]

@router.post("/hairstyles")
async def add_hairstyle(style: dict):
    return {"status": "success", "message": "Hairstyle created", "data": style}

@router.put("/hairstyles/{id}")
async def update_hairstyle(id: str, style: dict):
    return {"status": "success", "message": f"Hairstyle {id} updated", "data": style}

@router.delete("/hairstyles/{id}")
async def delete_hairstyle(id: str):
    return {"status": "success", "message": f"Hairstyle {id} deleted"}

@router.get("/analytics")
async def get_analytics():
    return {
        "total_users": 1420,
        "daily_try_ons": 4890,
        "conversion_rate": "24.6%"
    }

@router.get("/reports")
async def get_reports():
    return [
        {"ticket_id": "t_101", "user": "user_1", "issue": "Blurry scans in low light", "status": "open"}
    ]

@router.post("/trending")
async def update_trending(trending_list: List[str]):
    return {"status": "success", "message": "Trending list updated", "trending": trending_list}
