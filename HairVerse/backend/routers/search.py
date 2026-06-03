from fastapi import APIRouter, Depends, HTTPException, Query
from middleware.auth_middleware import get_current_user
from schemas.search import SearchResponse
from services.search_service import SearchService

router = APIRouter()

@router.get("", response_model=SearchResponse)
async def get_search_results(
    q: str = Query("", description="The search query string"),
    current_user: dict = Depends(get_current_user)
):
    """
    Perform a global search across hairstyles, categories, and other entities.
    """
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        response = SearchService.global_search(uid, q)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
