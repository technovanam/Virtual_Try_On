from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from middleware.auth_middleware import get_current_user

router = APIRouter()

class ExportRequest(BaseModel):
    image_base64: str
    export_type: str = "Single HD Image"
    format: str = "PNG"
    quality: str = "HD"

@router.post("/generate")
async def generate_export(request: ExportRequest, user: dict = Depends(get_current_user)):
    try:
        # MVP: Return the base64 or a composed URL simulating high quality export
        return {
            "status": "success",
            "export_url": request.image_base64 if "data:image" in request.image_base64 else "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=500",
            "format": request.format,
            "quality": request.quality
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export composition failed: {str(e)}")

@router.get("/{uid}/history")
async def get_export_history(uid: str, user: dict = Depends(get_current_user)):
    # Users can only access their own export history
    if uid != user["uid"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access another user's export history.",
        )
    return [
        {"id": "export_1", "date": "2026-05-26", "quality": "HD", "format": "PNG"}
    ]
