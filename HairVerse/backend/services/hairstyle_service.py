from fastapi import HTTPException, status
from firebase_config import db

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
    
    # Map the document data to match the HairstyleDetailsResponse schema
    return {
        "hairstyleId": data.get("hairstyleId", hairstyle_id),
        "hairstyleName": data.get("hairstyleName", ""),
        "category": data.get("category", ""),
        "description": data.get("description", ""),
        "maintenanceLevel": data.get("maintenanceLevel", ""),
        "popularityScore": data.get("popularityScore", 0),
        "imageUrl": data.get("imageUrl", ""),
        "tags": data.get("tags", []),
        "createdAt": data.get("createdAt")
    }
