from typing import List, Dict, Any, Optional
from firebase_config import db
from schemas.saved_collections import SavedItem, SavedItemResponse, SavedItemCreate
from datetime import datetime

class SavedCollectionsService:
    @staticmethod
    def create_saved_item(uid: str, item_data: SavedItemCreate) -> SavedItem:
        if db is None:
            raise Exception("Database is not initialized.")
            
        saved_ref = db.collection("users").document(uid).collection("saved").document()
        saved_id = saved_ref.id
        
        now = datetime.now()
        data = {
            "savedId": saved_id,
            "itemType": item_data.itemType,
            "referenceId": item_data.referenceId,
            "title": item_data.title,
            "imageUrl": item_data.imageUrl,
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
            docs = saved_ref.order_by("createdAt", direction="DESCENDING").limit(100).stream()
            
            items = []
            for doc in docs:
                data = doc.to_dict()
                
                # Timestamp parsing
                def parse_timestamp(ts_raw):
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
                
                item = SavedItem(
                    savedId=data.get("savedId", doc.id),
                    itemType=data.get("itemType", "hairstyle"),
                    referenceId=data.get("referenceId", ""),
                    title=data.get("title", "Untitled"),
                    imageUrl=data.get("imageUrl", ""),
                    createdAt=parse_timestamp(data.get("createdAt")),
                    updatedAt=parse_timestamp(data.get("updatedAt"))
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
            
        data = doc.to_dict()
        def parse_timestamp(ts_raw):
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
            
        return SavedItem(
            savedId=data.get("savedId", doc.id),
            itemType=data.get("itemType", "hairstyle"),
            referenceId=data.get("referenceId", ""),
            title=data.get("title", "Untitled"),
            imageUrl=data.get("imageUrl", ""),
            createdAt=parse_timestamp(data.get("createdAt")),
            updatedAt=parse_timestamp(data.get("updatedAt"))
        )

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
