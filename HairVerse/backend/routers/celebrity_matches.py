from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth_middleware import get_current_user
from schemas.celebrity_matches import CelebrityMatchesResponse, CelebrityMatch
from firebase_config import db

router = APIRouter()

@router.get(
    "/",
    response_model=CelebrityMatchesResponse,
    responses={
        200: {"description": "Return celebrity matches for the authenticated user"},
        401: {"description": "Invalid or expired Firebase ID token"},
    },
)
async def get_celebrity_matches(user: dict = Depends(get_current_user)):
    """
    Get the celebrity matches personalized for the authenticated user.
    Queries the 'users/{uid}/celebrityMatches' subcollection in Firestore.
    """
    matches = []
    total = 0
    
    uid = user.get("uid")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token"
        )
        
    if db is not None:
        try:
            # Query the user's specific celebrityMatches subcollection
            docs = db.collection("users").document(uid).collection("celebrityMatches").order_by("matchScore", direction="DESCENDING").stream()
            for doc in docs:
                data = doc.to_dict()
                matches.append(
                    CelebrityMatch(
                        celebrityId=data.get("celebrityId", doc.id),
                        celebrityName=data.get("celebrityName", ""),
                        celebrityImage=data.get("celebrityImage", ""),
                        hairstyleName=data.get("hairstyleName", ""),
                        hairstyleImage=data.get("hairstyleImage", ""),
                        matchScore=data.get("matchScore", 0.0),
                        faceShapeMatch=data.get("faceShapeMatch", 0.0),
                        hairMatch=data.get("hairMatch", 0.0),
                        generatedAt=data.get("generatedAt", None)
                    )
                )
            total = len(matches)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching celebrity matches: {str(e)}"
            )

    return CelebrityMatchesResponse(
        matches=matches,
        total=total
    )
