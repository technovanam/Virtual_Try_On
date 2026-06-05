from fastapi import APIRouter, Depends, HTTPException
from middleware.auth_middleware import get_current_user
from schemas.share_download_schemas import TrackRequest, TrackResponse
from services.share_download_service import ShareDownloadService

router = APIRouter()

@router.post("/download", response_model=TrackResponse)
async def track_download(
    request: TrackRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        result = ShareDownloadService.track_download(uid, request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/share", response_model=TrackResponse)
async def track_share(
    request: TrackRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        result = ShareDownloadService.track_share(uid, request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
