from fastapi import APIRouter, Depends, HTTPException
from middleware.auth_middleware import get_current_user
from schemas.compare_schemas import CompareCreateRequest, CompareResponse, CompareListResponse
from services.compare_service import CompareService

router = APIRouter()

@router.get("", response_model=CompareListResponse)
async def get_comparisons(current_user: dict = Depends(get_current_user)):
    """Fetch all comparisons for the user."""
    uid = current_user.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid user authentication")
    return CompareService.get_all(uid)

@router.get("/{comparisonId}", response_model=CompareResponse)
async def get_comparison(comparisonId: str, current_user: dict = Depends(get_current_user)):
    """Fetch a specific comparison by ID."""
    uid = current_user.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid user authentication")
    return CompareService.get_by_id(uid, comparisonId)

@router.post("", response_model=CompareResponse)
async def create_comparison(request: CompareCreateRequest, current_user: dict = Depends(get_current_user)):
    """Create a new comparison and generate AI evaluations."""
    uid = current_user.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid user authentication")
    return CompareService.create_comparison(uid, request)

@router.delete("/{comparisonId}")
async def delete_comparison(comparisonId: str, current_user: dict = Depends(get_current_user)):
    """Delete a comparison."""
    uid = current_user.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid user authentication")
    return CompareService.delete_comparison(uid, comparisonId)
