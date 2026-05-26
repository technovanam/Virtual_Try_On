from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ProfileUpdate(BaseModel):
    full_name: str
    age: int
    gender: str

@router.post("/register")
async def register():
    return {"message": "Registration handled by client side SDK, this endpoint might not be needed"}

@router.post("/profile")
async def update_profile(profile: ProfileUpdate):
    return {"message": "Profile updated", "data": profile.model_dump()}
