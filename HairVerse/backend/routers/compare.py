from fastapi import APIRouter, Depends, HTTPException
from middleware.auth_middleware import get_current_user
from schemas.compare_schemas import CompareCreateRequest, CompareCreateResponse, CompareGetResponse
from services.compare_service import CompareService

router = APIRouter()

@router.post("/create", response_model=CompareCreateResponse)
async def create_comparison(
    request: CompareCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        result = CompareService.create_comparison(uid, request.hairstyleIds, request.selectedImages)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{comparisonId}", response_model=CompareGetResponse)
async def get_comparison(
    comparisonId: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        result = CompareService.get_comparison(uid, comparisonId)
        return result
    except Exception as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tryon/{tryOnId}")
async def get_tryon_comparison(
    tryOnId: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        result = CompareService.get_tryon_comparison(uid, tryOnId)
        return result
    except Exception as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))
