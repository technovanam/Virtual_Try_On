from fastapi import APIRouter, Depends, HTTPException, status
from schemas.saved_collections import SavedItemResponse, SavedItemCreate, SavedItem
from services.saved_collections_service import SavedCollectionsService
from middleware.auth_middleware import get_current_user

router = APIRouter()

@router.get("/", response_model=SavedItemResponse)
def get_saved_collections(user: dict = Depends(get_current_user)):
    try:
        return SavedCollectionsService.get_saved_items(user["uid"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{savedId}", response_model=SavedItem)
def get_saved_item(savedId: str, user: dict = Depends(get_current_user)):
    try:
        item = SavedCollectionsService.get_saved_item(user["uid"], savedId)
        if not item:
            raise HTTPException(status_code=404, detail="Saved item not found")
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=SavedItem, status_code=status.HTTP_201_CREATED)
def create_saved_item(item_data: SavedItemCreate, user: dict = Depends(get_current_user)):
    try:
        return SavedCollectionsService.create_saved_item(user["uid"], item_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{savedId}", status_code=status.HTTP_204_NO_CONTENT)
def delete_saved_item(savedId: str, user: dict = Depends(get_current_user)):
    try:
        success = SavedCollectionsService.delete_saved_item(user["uid"], savedId)
        if not success:
            raise HTTPException(status_code=404, detail="Saved item not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
