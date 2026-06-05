from fastapi import APIRouter, Depends, HTTPException
from schemas.haircare import HairCareResponse, GenerateHairCareRequest
from services.haircare_service import HairCareService
from middleware.auth_middleware import get_current_user

router = APIRouter()

@router.post("/generate", response_model=HairCareResponse)
def generate_haircare_suggestions(
    request: GenerateHairCareRequest = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
        return HairCareService.generate_suggestions(uid)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=HairCareResponse)
def get_haircare_suggestions(current_user: dict = Depends(get_current_user)):
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
        return HairCareService.get_suggestions(uid)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
