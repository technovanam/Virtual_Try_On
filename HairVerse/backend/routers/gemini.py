from fastapi import APIRouter, Depends, HTTPException
from middleware.auth_middleware import get_current_user
from schemas.gemini import GeminiAnalyzeRequest, GeminiAnalysisResponse
from services.gemini_service import GeminiService

router = APIRouter()

@router.post("/analyze", response_model=GeminiAnalysisResponse)
async def analyze_with_gemini(request: GeminiAnalyzeRequest, current_user: dict = Depends(get_current_user)):
    """
    Start the Gemini Vision analysis on the provided image URL.
    Returns structured JSON of face and hair features.
    """
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        response = GeminiService.analyze_image(uid, request.imageUrl)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analysis/{analysisId}", response_model=GeminiAnalysisResponse)
async def get_gemini_analysis(analysisId: str, current_user: dict = Depends(get_current_user)):
    """
    Fetch the results of a previous Gemini analysis.
    """
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        response = GeminiService.get_analysis(uid, analysisId)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
