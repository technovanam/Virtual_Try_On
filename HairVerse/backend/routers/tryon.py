from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ai_rendering import render_tryon_composition
import base64
from typing import Optional, List

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

@router.get("/colors")
async def get_hair_colors():
    return [
        {"id": "black", "name": "Black", "hex": "#09090C", "gradient": ["#000000", "#1E1E24"], "popularity": 94, "skinCompatibility": "All Skin Tones", "trending": False, "recommended": True},
        {"id": "dark_brown", "name": "Dark Brown", "hex": "#3C2F2F", "gradient": ["#2B1E1E", "#4E3629"], "popularity": 88, "skinCompatibility": "Warm & Neutral", "trending": False, "recommended": True},
        {"id": "light_brown", "name": "Light Brown", "hex": "#8B5A2B", "gradient": ["#6A431D", "#A06B30"], "popularity": 82, "skinCompatibility": "Cool & Warm", "trending": True, "recommended": False},
        {"id": "blonde", "name": "Blonde", "hex": "#D4AF37", "gradient": ["#BFA054", "#F4DF4B"], "popularity": 79, "skinCompatibility": "Cool & Fair", "trending": True, "recommended": False},
        {"id": "burgundy", "name": "Burgundy", "hex": "#800020", "gradient": ["#4A0010", "#90002A"], "popularity": 85, "skinCompatibility": "Dark & Fair", "trending": True, "recommended": True},
        {"id": "silver", "name": "Silver", "hex": "#C0C0C0", "gradient": ["#9A9A9A", "#E0E0E0"], "popularity": 91, "skinCompatibility": "Cool & Neutral", "trending": True, "recommended": True}
    ]

@router.get("/beards")
async def get_beard_styles():
    return [
        {"id": "clean_shave", "name": "Clean Shave", "compatibility": 95, "bestMatch": true, "thumbnail": "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=100&h=100&fit=crop"},
        {"id": "stubble", "name": "Stubble", "compatibility": 88, "bestMatch": false, "thumbnail": "https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=100&h=100&fit=crop"},
        {"id": "short_beard", "name": "Short Beard", "compatibility": 82, "bestMatch": false, "thumbnail": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"},
        {"id": "full_beard", "name": "Full Beard", "compatibility": 75, "bestMatch": false, "thumbnail": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop"},
        {"id": "fade_beard", "name": "Fade Beard", "compatibility": 90, "bestMatch": true, "thumbnail": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"}
    ]

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

