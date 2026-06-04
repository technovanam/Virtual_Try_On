from fastapi import HTTPException, status
from firebase_config import db
from google.cloud.firestore_v1.base_query import FieldFilter, BaseCompositeFilter
from typing import Optional

async def get_hairstyle_details(hairstyle_id: str) -> dict:
    """
    Fetches details of a specific hairstyle from Firestore.
    """
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is not initialized.",
        )

    try:
        doc_snap = db.collection("hairstyles").document(hairstyle_id).get()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to fetch hairstyle details: {exc}",
        )

    if not doc_snap.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hairstyle not found.",
        )

    data = doc_snap.to_dict()
    
    # Ensure id is attached
    data["hairstyleId"] = hairstyle_id
    
    # Optional fields default handling is managed by pydantic model, but let's ensure base keys exist if missing
    return data

async def get_hairstyles_paginated(
    limit: int = 10,
    cursor: Optional[str] = None,
    category: Optional[str] = None,
    gender: Optional[str] = None,
    sort_by: str = "createdAt",
    sort_desc: bool = True
) -> dict:
    """
    Fetches paginated list of active hairstyles based on filters.
    """
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is not initialized.",
        )

    try:
        query = db.collection("hairstyles").where(filter=FieldFilter("isActive", "==", True))

        if category:
            query = query.where(filter=FieldFilter("category", "==", category))
        
        if gender:
            query = query.where(filter=FieldFilter("gender", "==", gender))

        direction = "DESCENDING" if sort_desc else "ASCENDING"
        query = query.order_by(sort_by, direction=direction)

        if cursor:
            # Fetch the cursor document to start after
            cursor_snap = db.collection("hairstyles").document(cursor).get()
            if cursor_snap.exists:
                query = query.start_after(cursor_snap)

        # Apply limit (+1 to check for next page)
        docs = query.limit(limit + 1).stream()
        
        hairstyles = []
        for doc in docs:
            data = doc.to_dict()
            data["hairstyleId"] = doc.id
            hairstyles.append(data)

        next_cursor = None
        if len(hairstyles) > limit:
            next_cursor = hairstyles[limit - 1]["hairstyleId"]
            hairstyles = hairstyles[:limit]

        return {
            "hairstyles": hairstyles,
            "nextCursor": next_cursor
        }

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch hairstyles: {exc}",
        )

async def get_categories() -> list:
    """
    Fetches available categories (currently simply scans active and extracts unique).
    For true production with millions, maintain a stats document.
    """
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is not initialized.",
        )

    try:
        # Assuming categories are limited. Using a composite query to get distinct isn't natively supported,
        # so we fetch all active if we don't have a stats doc, but to optimize, you'd use a dedicated 'categories' collection.
        # Given constraints, we will query and extract. Alternatively, we just return a static known list,
        # but the prompt says 'No static data'. If there's an aggregation available, use it.
        # For Firestore, we can just query for categories from a dedicated collection or aggregate.
        # We will query hairstyles and collect unique categories using a select.
        docs = db.collection("hairstyles").where(filter=FieldFilter("isActive", "==", True)).select(["category"]).stream()
        categories = set()
        for doc in docs:
            cat = doc.to_dict().get("category")
            if cat:
                categories.add(cat)
        
        return sorted(list(categories))

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch categories: {exc}",
        )

async def get_trending_hairstyles(limit: int = 20) -> list:
    """
    Fetches trending hairstyles ordered by trendingScore.
    """
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is not initialized.",
        )

    try:
        query = db.collection("hairstyles")\
            .where(filter=FieldFilter("isActive", "==", True))\
            .order_by("trendingScore", direction="DESCENDING")\
            .limit(limit)

        docs = query.stream()
        
        hairstyles = []
        for doc in docs:
            data = doc.to_dict()
            data["hairstyleId"] = doc.id
            hairstyles.append(data)

        return hairstyles

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch trending hairstyles: {exc}",
        )
