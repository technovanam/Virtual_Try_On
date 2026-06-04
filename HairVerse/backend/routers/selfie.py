from fastapi import APIRouter, Depends, UploadFile, File
from middleware.auth_middleware import get_current_user
from schemas.selfie_schemas import SelfieUploadResponse
from services.selfie_service import selfie_service

router = APIRouter()

@router.post("/upload", response_model=SelfieUploadResponse)
async def upload_selfie(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    """
    Upload a selfie to Firebase Storage and create a metadata record in Firestore.
    The file must be an image.
    """
    return await selfie_service.upload_selfie(user["uid"], file)
