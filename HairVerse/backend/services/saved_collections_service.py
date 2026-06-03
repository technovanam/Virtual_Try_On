from typing import List, Dict, Any
from firebase_config import db
from schemas.saved_collections import CollectionItem, SavedCollectionResponse
from datetime import datetime

class SavedCollectionsService:
    @staticmethod
    def get_saved_collections(uid: str) -> SavedCollectionResponse:
        if db is None:
            # Fallback if firestore not initialized, but as per instructions no mock data
            return SavedCollectionResponse(collections=[], total=0)
            
        try:
            collections_ref = db.collection("users").document(uid).collection("savedCollections")
            # Order by savedAt descending
            docs = collections_ref.order_by("savedAt", direction="DESCENDING").stream()
            
            collections = []
            for doc in docs:
                data = doc.to_dict()
                
                # Handle possible missing fields or different timestamp types
                saved_at_raw = data.get("savedAt")
                saved_at = datetime.now()
                if hasattr(saved_at_raw, 'timestamp'):
                    saved_at = datetime.fromtimestamp(saved_at_raw.timestamp())
                elif isinstance(saved_at_raw, str):
                    try:
                        saved_at = datetime.fromisoformat(saved_at_raw.replace('Z', '+00:00'))
                    except ValueError:
                        pass
                
                item = CollectionItem(
                    collectionId=data.get("collectionId", doc.id),
                    collectionName=data.get("collectionName", "Untitled Collection"),
                    hairstyleId=data.get("hairstyleId", ""),
                    hairstyleName=data.get("hairstyleName", "Unknown Style"),
                    hairstyleImage=data.get("hairstyleImage", ""),
                    category=data.get("category", "General"),
                    savedAt=saved_at,
                    notes=data.get("notes"),
                    tags=data.get("tags", [])
                )
                collections.append(item)
                
            return SavedCollectionResponse(collections=collections, total=len(collections))
            
        except Exception as e:
            print(f"[ERROR] Failed to fetch saved collections for uid {uid}: {e}")
            raise e
