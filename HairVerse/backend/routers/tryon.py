from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ai_rendering import render_tryon_composition
import base64

router = APIRouter()

class TryOnRequest(BaseModel):
    image_base64: str = None  # User's uploaded selfie in base64
    hairstyle_id: str
    hair_color: str = "Black"
    beard_style: str = "Clean Shave"

@router.post("/generate")
async def generate_tryon(request: TryOnRequest):
    try:
        # If no image is provided, we create a default gray canvas to draw on
        if not request.image_base64:
            # Simple gray base64 representation
            image_bytes = b""
        else:
            # Strip base64 headers if present
            header_indicator = "base64,"
            if header_indicator in request.image_base64:
                base64_data = request.image_base64.split(header_indicator)[1]
            else:
                base64_data = request.image_base64
            image_bytes = base64.b64decode(base64_data)
            
        rendered_url_or_base64 = render_tryon_composition(
            image_bytes=image_bytes,
            hairstyle_id=request.hairstyle_id,
            hair_color=request.hair_color,
            beard_style=request.beard_style
        )
        
        return {
            "status": "success",
            "rendered_image_url": rendered_url_or_base64
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rendering failed: {str(e)}")

@router.post("/compare")
async def generate_comparison(request: dict):
    return {"status": "success", "comparison_url": "https://example.com/mock_compare.png"}

@router.get("/history")
async def get_tryon_history(uid: Optional[str] = None):
    return [
        {
            "id": "curly_03",
            "name": "Textured Curly Crop",
            "color": "Silver",
            "beard": "Stubble Beard",
            "time": "2 hours ago",
            "imageUrl": "https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=200&h=200&fit=crop"
        },
        {
            "id": "fade_01",
            "name": "Classic Fade",
            "color": "Dark Brown",
            "beard": "Clean Shave",
            "time": "1 day ago",
            "imageUrl": "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=200&h=200&fit=crop"
        }
    ]
