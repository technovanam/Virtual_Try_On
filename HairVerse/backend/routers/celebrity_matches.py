from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth_middleware import get_current_user
from schemas.celebrity_matches import CelebrityMatchesResponse, CelebrityMatchGenerateRequest
from services.celebrity_match_service import CelebrityMatchService

router = APIRouter()

@router.post("/generate", response_model=CelebrityMatchesResponse)
async def generate_celebrity_matches(request: CelebrityMatchGenerateRequest, current_user: dict = Depends(get_current_user)):
    """
    Generate new celebrity matches using the Gemini Vision Engine.
    This uses the user's recent Face/Hair Analysis to find similar celebrities.
    """
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        response = CelebrityMatchService.generate_matches(uid, request.analysisId)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=CelebrityMatchesResponse)
async def get_celebrity_matches(current_user: dict = Depends(get_current_user)):
    """
    Get the most recently generated celebrity matches.
    """
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        response = CelebrityMatchService.get_matches(uid)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
