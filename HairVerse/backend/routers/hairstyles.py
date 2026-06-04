from fastapi import APIRouter, Depends
from middleware.auth_middleware import get_current_user
from schemas.hairstyles import HairstyleDetailsResponse
from services.hairstyle_service import get_hairstyle_details

router = APIRouter()

@router.get("/{hairstyle_id}", response_model=HairstyleDetailsResponse)
async def get_hairstyle(
    hairstyle_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Get dynamic details for a specific hairstyle.
    Requires authentication.
    """
    details = await get_hairstyle_details(hairstyle_id)
    return details
