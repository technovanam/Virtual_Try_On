from fastapi import APIRouter, Depends, HTTPException
from middleware.auth_middleware import get_current_user
from schemas.settings import SettingsResponse, SettingsUpdate
from services.settings_service import get_user_settings, update_user_settings, reset_user_settings, SettingsServiceError

router = APIRouter()

@router.get("/", response_model=SettingsResponse)
async def get_settings(user: dict = Depends(get_current_user)):
    """Get the authenticated user's settings."""
    try:
        settings = get_user_settings(user["uid"])
        return settings
    except SettingsServiceError as e:
        raise HTTPException(status_code=500, detail=e.message)

@router.patch("/", response_model=SettingsResponse)
async def update_settings(
    updates: SettingsUpdate,
    user: dict = Depends(get_current_user)
):
    """Update the authenticated user's settings."""
    try:
        updates_dict = updates.model_dump(exclude_unset=True)
        if not updates_dict:
            return get_user_settings(user["uid"])
            
        settings = update_user_settings(user["uid"], updates_dict)
        return settings
    except SettingsServiceError as e:
        raise HTTPException(status_code=500, detail=e.message)

@router.post("/reset", response_model=SettingsResponse)
async def reset_settings(user: dict = Depends(get_current_user)):
    """Reset the authenticated user's settings to default."""
    try:
        settings = reset_user_settings(user["uid"])
        return settings
    except SettingsServiceError as e:
        raise HTTPException(status_code=500, detail=e.message)
