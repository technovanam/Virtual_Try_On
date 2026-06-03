from fastapi import APIRouter, Depends, HTTPException
from middleware.auth_middleware import get_current_user
from schemas.tryon_sessions import TryOnSessionResponse
from services.tryon_service import TryOnService

router = APIRouter()

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
