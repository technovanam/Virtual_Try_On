from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth_middleware import get_current_user

router = APIRouter()

@router.get(
    "/",
    response_model=dict,
    responses={
        200: {"description": "Return empty recommendations with pending status"},
        401: {"description": "Invalid or expired Firebase ID token"},
    },
)
async def get_recommendations(user: dict = Depends(get_current_user)):
    """
    Get personalized hairstyle recommendations for the authenticated user.
    Currently returns an empty list while the recommendation engine is under construction.
    """
    # Later: fetch user profile, pass to recommendation service, return actual recommendations.
    return {
        "recommendations": [],
        "status": "pending"
    }
