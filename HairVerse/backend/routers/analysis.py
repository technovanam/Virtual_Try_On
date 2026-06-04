from fastapi import APIRouter, Depends, HTTPException
from middleware.auth_middleware import get_current_user
from schemas.analysis import AnalysisStatusResponse
from services.analysis_service import AnalysisService

router = APIRouter()

@router.get("/status/{analysisId}", response_model=AnalysisStatusResponse)
async def get_analysis_status(analysisId: str, current_user: dict = Depends(get_current_user)):
    """
    Fetch the processing status of an AI analysis.
    """
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        status = AnalysisService.get_analysis_status(uid, analysisId)
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
