from fastapi import APIRouter, Depends, HTTPException, status
from schemas.auth_schemas import ProfileUpdateRequest
from schemas.profile_schemas import ComprehensiveProfileResponse
from services.profile_service import ProfileService
from services.auth_service import get_user_profile
from middleware.auth_middleware import get_current_user

router = APIRouter()

@router.get("/", response_model=ComprehensiveProfileResponse)
async def get_profile(user: dict = Depends(get_current_user)):
    """Get the authenticated user's comprehensive profile dashboard data."""
    uid = user["uid"]
    try:
        return ProfileService.get_comprehensive_profile(uid)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.patch("/", response_model=ComprehensiveProfileResponse)
async def update_profile(request: ProfileUpdateRequest, user: dict = Depends(get_current_user)):
    """Update the user's profile and return the new comprehensive profile."""
    uid = user["uid"]
    from firebase_config import db as _db

    update_data = {}
    for key, value in request.dict(exclude_unset=True).items():
        update_data[f"profileCompletion.{key}"] = value

    if not _db:
        return ProfileService.get_comprehensive_profile(uid)

    if update_data:
        try:
            doc_ref = _db.collection("users").document(uid)
            doc_ref.update(update_data)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Failed to update profile: {exc}")

    return ProfileService.get_comprehensive_profile(uid)
