from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth_middleware import get_current_user
from services.auth_service import get_user_profile

router = APIRouter()

@router.get("/me")
async def get_my_profile(user: dict = Depends(get_current_user)):
    uid = user["uid"]
    try:
        user_profile = get_user_profile(uid)
        return user_profile
    except Exception as exc:
        raise HTTPException(status_code=404, detail="Profile not found")
