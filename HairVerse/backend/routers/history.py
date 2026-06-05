from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth_middleware import get_current_user
from services.history_service import HistoryService

router = APIRouter()

@router.get(
    "/recent",
    response_model=dict,
    responses={
        200: {"description": "Return user history"},
        401: {"description": "Invalid or expired Firebase ID token"},
    },
)
async def get_recent_history(user: dict = Depends(get_current_user)):
    """
    Get recently tried hairstyles, beard styles, and hair colors for the authenticated user.
    """
    try:
        uid = user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        return HistoryService.get_recent_history(uid)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from typing import Optional
from schemas.history_schemas import TimelineResponse, TimelineEvent

@router.get(
    "/timeline",
    response_model=TimelineResponse,
    responses={
        200: {"description": "Return user timeline"},
        401: {"description": "Invalid or expired Firebase ID token"},
    },
)
async def get_timeline(
    cursor: Optional[str] = None,
    filter_type: Optional[str] = None,
    limit: int = 20,
    user: dict = Depends(get_current_user)
):
    try:
        uid = user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        return HistoryService.get_timeline(uid, cursor, filter_type, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get(
    "/timeline/{event_id}",
    response_model=TimelineEvent,
    responses={
        200: {"description": "Return single timeline event"},
        401: {"description": "Invalid or expired Firebase ID token"},
        404: {"description": "Event not found"}
    },
)
async def get_timeline_event(
    event_id: str,
    user: dict = Depends(get_current_user)
):
    try:
        uid = user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        return HistoryService.get_timeline_event(uid, event_id)
    except Exception as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))
