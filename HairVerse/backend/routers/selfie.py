from fastapi import APIRouter, Depends, UploadFile, File, Form
from middleware.auth_middleware import get_current_user
from schemas.selfie_schemas import SelfieUploadResponse, SelfieListResponse, SelfieRecord
from services.selfie_service import selfie_service

router = APIRouter()

@router.post("/upload", response_model=SelfieUploadResponse)
async def upload_selfie(
    file: UploadFile = File(...),
    source: str = Form("camera"),
    user: dict = Depends(get_current_user)
):
    """
    Upload a selfie to Firebase Storage and create a metadata record in Firestore.
    The file must be an image.
    """
    record = await selfie_service.upload_selfie(user["uid"], file, source)
    return {"data": record}

from typing import Optional

@router.get("/", response_model=SelfieListResponse)
async def get_selfies(
    limit: int = 10,
    cursor: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    """
    Get all selfies for the current user with pagination.
    """
    records, next_cursor = await selfie_service.get_selfies(user["uid"], limit, cursor)
    return {"data": records, "nextCursor": next_cursor}

@router.get("/{imageId}", response_model=SelfieUploadResponse)
async def get_selfie(
    imageId: str,
    user: dict = Depends(get_current_user)
):
    """
    Get a specific selfie by ID.
    """
    record = await selfie_service.get_selfie(user["uid"], imageId)
    return {"data": record}

@router.patch("/{imageId}/active", response_model=SelfieUploadResponse)
async def set_active_selfie(
    imageId: str,
    user: dict = Depends(get_current_user)
):
    """
    Set a specific selfie as active. All other selfies will be deactivated.
    """
    record = await selfie_service.set_active_selfie(user["uid"], imageId)
    return {"data": record}

@router.delete("/{imageId}")
async def delete_selfie(
    imageId: str,
    user: dict = Depends(get_current_user)
):
    """
    Delete a selfie from Firestore and Firebase Storage.
    """
    return await selfie_service.delete_selfie(user["uid"], imageId)
