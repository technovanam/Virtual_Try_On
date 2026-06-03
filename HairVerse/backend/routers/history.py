from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth_middleware import get_current_user

router = APIRouter()

@router.get(
    "/recent",
    response_model=dict,
    responses={
        200: {"description": "Return empty history with total 0"},
        401: {"description": "Invalid or expired Firebase ID token"},
    },
)
async def get_recent_history(user: dict = Depends(get_current_user)):
    """
    Get recently tried hairstyles, beard styles, and hair colors for the authenticated user.
    Currently returns an empty list while the try-on engine is under construction.
    """
    # Later: query Firestore users/{uid}/history where status == 'completed' order by createdAt desc
    return {
        "items": [],
        "total": 0
    }
