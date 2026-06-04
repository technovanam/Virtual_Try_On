from typing import List
from firebase_config import db
from datetime import datetime

class HistoryService:
    @staticmethod
    def get_recent_history(uid: str) -> dict:
        if db is None:
            return {"items": [], "total": 0}
            
        try:
            sessions_ref = db.collection("users").document(uid).collection("tryonSessions")
            docs = sessions_ref.order_by("updatedAt", direction="DESCENDING").limit(20).stream()
            
            items = []
            for doc in docs:
                data = doc.to_dict()
                if data.get("status") != "completed":
                    continue
                
                # Handle possible timestamp types
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

                created_at = parse_timestamp(data.get("createdAt"))
                selected_hairstyle = data.get("selectedHairstyle", {})
                if not isinstance(selected_hairstyle, dict):
                    selected_hairstyle = {}
                
                items.append({
                    "historyId": data.get("sessionId", doc.id),
                    "hairstyleId": selected_hairstyle.get("id", "unknown"),
                    "hairstyleName": selected_hairstyle.get("name", "Unknown Style"),
                    "hairstyleCategory": selected_hairstyle.get("category", "General"),
                    "tryOnImage": data.get("resultImage") or data.get("uploadedImage"),
                    "createdAt": created_at.isoformat()
                })
                
            return {"items": items, "total": len(items)}
            
        except Exception as e:
            print(f"[ERROR] Failed to fetch History for uid {uid}: {e}")
            raise e
