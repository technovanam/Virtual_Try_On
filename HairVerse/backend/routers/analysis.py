from fastapi import APIRouter, Depends, HTTPException
from middleware.auth_middleware import get_current_user
from schemas.analysis import AnalysisStatusResponse
from schemas.face_analysis import FaceAnalysisStartRequest, FaceAnalysisResponse
from schemas.hair_analysis import HairAnalysisStartRequest, HairAnalysisResponse
from services.analysis_service import AnalysisService
from services.face_analysis_service import FaceAnalysisService
from services.hair_analysis_service import HairAnalysisService

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

@router.post("/face/start", response_model=FaceAnalysisResponse)
async def start_face_analysis(request: FaceAnalysisStartRequest, current_user: dict = Depends(get_current_user)):
    """
    Start the face analysis pipeline.
    """
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        response = FaceAnalysisService.start_analysis(uid, request.imageUrl)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/face/{analysisId}", response_model=FaceAnalysisResponse)
async def get_face_analysis(analysisId: str, current_user: dict = Depends(get_current_user)):
    """
    Fetch the face analysis results.
    """
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        response = FaceAnalysisService.get_analysis(uid, analysisId)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/hair/start", response_model=HairAnalysisResponse)
async def start_hair_analysis(request: HairAnalysisStartRequest, current_user: dict = Depends(get_current_user)):
    """
    Start the hair analysis pipeline.
    """
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        response = HairAnalysisService.start_analysis(uid, request.imageUrl)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/hair/{analysisId}", response_model=HairAnalysisResponse)
async def get_hair_analysis(analysisId: str, current_user: dict = Depends(get_current_user)):
    """
    Fetch the hair analysis results.
    """
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        response = HairAnalysisService.get_analysis(uid, analysisId)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
