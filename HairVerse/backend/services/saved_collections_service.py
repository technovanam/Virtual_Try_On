from typing import List, Dict, Any, Optional
from firebase_config import db
from schemas.saved_collections import SavedItem, SavedItemResponse, SavedItemCreate, SavedItemUpdate
from datetime import datetime, timezone

class SavedCollectionsService:
    @staticmethod
    def _parse_timestamp(ts_raw):
        if not ts_raw:
            return datetime.now()
        ts = datetime.now()
        if hasattr(ts_raw, 'timestamp'):
            ts = datetime.fromtimestamp(ts_raw.timestamp())
        elif isinstance(ts_raw, str):
            try:
                ts = datetime.fromisoformat(ts_raw.replace('Z', '+00:00'))
            except ValueError:
                pass
        return ts

    @staticmethod
    def create_saved_item(uid: str, item_data: SavedItemCreate) -> SavedItem:
        if db is None:
            raise Exception("Database is not initialized.")
            
        saved_ref = db.collection("users").document(uid).collection("saved").document()
        saved_id = saved_ref.id
        
        now = datetime.now(timezone.utc)
        data = {
            "savedId": saved_id,
            "itemType": item_data.itemType,
            "referenceId": item_data.referenceId,
            "title": item_data.title,
            "imageUrl": item_data.imageUrl,
            "category": item_data.category or "Favorites",
            "matchScore": item_data.matchScore or 0,
            "viewCount": 0,
            "createdAt": now,
            "updatedAt": now
        }
        
        saved_ref.set(data)
        
        return SavedItem(**data)

    @staticmethod
    def get_saved_items(uid: str) -> SavedItemResponse:
        if db is None:
            return SavedItemResponse(items=[], total=0)
            
        try:
            saved_ref = db.collection("users").document(uid).collection("saved")
            docs = saved_ref.order_by("createdAt", direction="DESCENDING").limit(200).stream()
            
            items = []
            for doc in docs:
                data = doc.to_dict()
                
                item = SavedItem(
                    savedId=data.get("savedId", doc.id),
                    itemType=data.get("itemType", "hairstyle"),
                    referenceId=data.get("referenceId", ""),
                    title=data.get("title", "Untitled"),
                    imageUrl=data.get("imageUrl", ""),
                    category=data.get("category", "Favorites"),
                    matchScore=data.get("matchScore", 0),
                    viewCount=data.get("viewCount", 0),
                    createdAt=SavedCollectionsService._parse_timestamp(data.get("createdAt")),
                    updatedAt=SavedCollectionsService._parse_timestamp(data.get("updatedAt"))
                )
                items.append(item)
                
            return SavedItemResponse(items=items, total=len(items))
            
        except Exception as e:
            print(f"[ERROR] Failed to fetch saved items for uid {uid}: {e}")
            raise e

    @staticmethod
    def get_saved_item(uid: str, saved_id: str) -> Optional[SavedItem]:
        if db is None:
            raise Exception("Database is not initialized.")
            
        doc_ref = db.collection("users").document(uid).collection("saved").document(saved_id)
        doc = doc_ref.get()
        if not doc.exists:
            return None
            
        # Increment view count automatically on fetch
        data = doc.to_dict()
        new_views = data.get("viewCount", 0) + 1
        doc_ref.update({"viewCount": new_views})
        data["viewCount"] = new_views
            
        return SavedItem(
            savedId=data.get("savedId", doc.id),
            itemType=data.get("itemType", "hairstyle"),
            referenceId=data.get("referenceId", ""),
            title=data.get("title", "Untitled"),
            imageUrl=data.get("imageUrl", ""),
            category=data.get("category", "Favorites"),
            matchScore=data.get("matchScore", 0),
            viewCount=data.get("viewCount", 0),
            createdAt=SavedCollectionsService._parse_timestamp(data.get("createdAt")),
            updatedAt=SavedCollectionsService._parse_timestamp(data.get("updatedAt"))
        )

    @staticmethod
    def update_saved_item(uid: str, saved_id: str, update_data: SavedItemUpdate) -> Optional[SavedItem]:
        if db is None:
            raise Exception("Database is not initialized.")
            
        doc_ref = db.collection("users").document(uid).collection("saved").document(saved_id)
        doc = doc_ref.get()
        if not doc.exists:
            return None
            
        updates = {}
        if update_data.category is not None:
            updates["category"] = update_data.category
        if update_data.title is not None:
            updates["title"] = update_data.title
            
        if updates:
            updates["updatedAt"] = datetime.now(timezone.utc)
            doc_ref.update(updates)
            
        return SavedCollectionsService.get_saved_item(uid, saved_id)

    @staticmethod
    def delete_saved_item(uid: str, saved_id: str) -> bool:
        if db is None:
            raise Exception("Database is not initialized.")
            
        doc_ref = db.collection("users").document(uid).collection("saved").document(saved_id)
        doc = doc_ref.get()
        if not doc.exists:
            return False
            
        doc_ref.delete()
        return True
