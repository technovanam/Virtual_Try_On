from fastapi import APIRouter, Depends, HTTPException
from schemas.saved_collections import SavedCollectionResponse
from services.saved_collections_service import SavedCollectionsService
from middleware.auth_middleware import get_current_user

router = APIRouter()

@router.get("/", response_model=SavedCollectionResponse)
def get_saved_collections(user: dict = Depends(get_current_user)):
    try:
        return SavedCollectionsService.get_saved_collections(user["uid"])
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch saved collections")
