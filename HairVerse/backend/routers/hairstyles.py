from fastapi import APIRouter, Depends, Query
from typing import Optional, List
from middleware.auth_middleware import get_current_user
from schemas.hairstyles import HairstyleDetailsResponse, PaginatedHairstylesResponse, Hairstyle
from services.hairstyle_service import (
    get_hairstyle_details,
    get_hairstyles_paginated,
    get_categories,
    get_trending_hairstyles
)

router = APIRouter()

@router.get("/", response_model=PaginatedHairstylesResponse)
async def get_hairstyles(
    limit: int = Query(10, ge=1, le=50),
    cursor: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    sort_by: str = Query("createdAt"),
    sort_desc: bool = Query(True),
    user: dict = Depends(get_current_user)
):
    """
    Get a paginated list of active hairstyles.
    Requires authentication.
    """
    return await get_hairstyles_paginated(
        limit=limit,
        cursor=cursor,
        category=category,
        gender=gender,
        sort_by=sort_by,
        sort_desc=sort_desc
    )

@router.get("/categories", response_model=List[str])
async def get_all_categories(
    user: dict = Depends(get_current_user)
):
    """
    Get all available hairstyle categories.
    Requires authentication.
    """
    return await get_categories()

@router.get("/trending", response_model=List[Hairstyle])
async def get_trending(
    limit: int = Query(20, ge=1, le=50),
    user: dict = Depends(get_current_user)
):
    """
    Get top trending hairstyles.
    Requires authentication.
    """
    return await get_trending_hairstyles(limit=limit)

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
