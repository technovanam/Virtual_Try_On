from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from middleware.auth_middleware import get_current_user
from schemas.search import SearchResponse, TrendingResponse, CategoriesResponse
from services.search_service import SearchService

router = APIRouter()

@router.get("", response_model=SearchResponse)
async def get_search_results(
    q: str = Query("", description="The search query string"),
    category: Optional[str] = Query(None, description="Category filter"),
    gender: Optional[str] = Query(None, description="Gender filter"),
    page: int = Query(1, description="Page number", ge=1),
    limit: int = Query(20, description="Results per page", ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    """
    Perform a global search across hairstyles, categories, and other entities.
    """
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        response = SearchService.global_search(uid, q, category, gender, page, limit)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trending", response_model=TrendingResponse)
async def get_trending_searches(
    current_user: dict = Depends(get_current_user)
):
    """
    Get backend-driven trending searches.
    """
    try:
        return SearchService.get_trending()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/categories", response_model=CategoriesResponse)
async def get_search_categories(
    current_user: dict = Depends(get_current_user)
):
    """
    Get backend-driven search categories.
    """
    try:
        return SearchService.get_categories()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
