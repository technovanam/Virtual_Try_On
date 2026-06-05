from fastapi import APIRouter, Depends, HTTPException
from typing import List
from middleware.auth_middleware import get_current_user
from schemas.exports_schemas import ExportRequest, ExportResponse, ExportRecord
from services.export_service import ExportService, ExportServiceError

router = APIRouter()

@router.post("", response_model=ExportResponse)
async def create_export(request: ExportRequest, current_user: dict = Depends(get_current_user)):
    """Track a new export."""
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        return ExportService.track_export(uid, request)
    except ExportServiceError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=List[ExportRecord])
async def get_exports(current_user: dict = Depends(get_current_user)):
    """Fetch user's export history."""
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        return ExportService.get_export_history(uid)
    except ExportServiceError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
