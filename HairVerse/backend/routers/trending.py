from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth_middleware import get_current_user
from schemas.trending import TrendingHairstylesResponse, TrendingHairstyle
from firebase_config import db
from datetime import datetime

router = APIRouter()

@router.get(
    "/",
    response_model=TrendingHairstylesResponse,
    responses={
        200: {"description": "Return trending hairstyles"},
        401: {"description": "Invalid or expired Firebase ID token"},
    },
)
async def get_trending_hairstyles(user: dict = Depends(get_current_user)):
    """
    Get the current trending hairstyles.
    Queries the 'trendingHairstyles' collection in Firestore.
    """
    hairstyles = []
    total = 0
    
    if db is not None:
        try:
            # Query trendingHairstyles collection ordered by trendScore
            docs = db.collection("trendingHairstyles").order_by("trendScore", direction="DESCENDING").limit(20).stream()
            for doc in docs:
                data = doc.to_dict()
                hairstyles.append(
                    TrendingHairstyle(
                        hairstyleId=data.get("hairstyleId", doc.id),
                        hairstyleName=data.get("hairstyleName", ""),
                        category=data.get("category", "General"),
                        previewImage=data.get("previewImage", ""),
                        trendScore=data.get("trendScore", 0.0),
                        popularityScore=data.get("popularityScore", 0.0),
                        saveCount=data.get("saveCount", 0),
                        tryOnCount=data.get("tryOnCount", 0),
                        searchCount=data.get("searchCount", 0),
                        updatedAt=data.get("updatedAt", None)
                    )
                )
            total = len(hairstyles)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching trending hairstyles: {str(e)}"
            )

    return TrendingHairstylesResponse(
        hairstyles=hairstyles,
        total=total,
        updatedAt=datetime.utcnow()
    )
