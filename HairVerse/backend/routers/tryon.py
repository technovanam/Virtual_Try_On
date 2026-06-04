from fastapi import APIRouter, Depends, HTTPException
from middleware.auth_middleware import get_current_user
from schemas.tryon_sessions import TryOnSessionResponse
from services.tryon_service import TryOnService

from schemas.tryon_schemas import TryOnStartRequest, TryOnStartResponse, TryOnStatusResponse

router = APIRouter()

@router.post("/start", response_model=TryOnStartResponse)
async def start_tryon_session(
    request: TryOnStartRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        result = TryOnService.start_tryon(uid, request.imageId, request.hairstyleId)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/continue", response_model=TryOnSessionResponse)
async def get_continue_sessions(current_user: dict = Depends(get_current_user)):
    """
    Fetch unfinished try-on sessions for the authenticated user.
    """
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        sessions = TryOnService.get_continue_sessions(uid)
        return sessions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{tryOnId}", response_model=TryOnStatusResponse)
async def get_tryon_status(
    tryOnId: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        result = TryOnService.get_tryon_status(uid, tryOnId)
        return result
    except Exception as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))
