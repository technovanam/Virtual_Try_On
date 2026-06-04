from fastapi import APIRouter, Depends, HTTPException, status
from schemas.auth_schemas import UserResponse, ProfileUpdateRequest
from services.auth_service import get_user_profile, AuthServiceError
from middleware.auth_middleware import get_current_user

router = APIRouter()

@router.get("/", response_model=UserResponse)
async def get_profile(user: dict = Depends(get_current_user)):
    """Get the authenticated user's profile from Firestore."""
    uid = user["uid"]
    try:
        user_profile = get_user_profile(uid)
    except AuthServiceError as exc:
        if exc.code == "profile_not_found":
            return UserResponse(uid=uid, email=user["email"])
        raise HTTPException(status_code=500, detail=exc.message)

    return UserResponse(**user_profile)

@router.patch("/", response_model=UserResponse)
async def update_profile(request: ProfileUpdateRequest, user: dict = Depends(get_current_user)):
    """Update the user's profile with partial data using Firestore dot notation."""
    uid = user["uid"]
    from firebase_config import db as _db

    update_data = {}
    for key, value in request.dict(exclude_unset=True).items():
        update_data[f"profileCompletion.{key}"] = value

    if not _db:
        user_profile = get_user_profile(uid)
        return UserResponse(**user_profile)

    if update_data:
        try:
            doc_ref = _db.collection("users").document(uid)
            doc_ref.update(update_data)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Failed to update profile: {exc}")

    user_profile = get_user_profile(uid)
    return UserResponse(**user_profile)
