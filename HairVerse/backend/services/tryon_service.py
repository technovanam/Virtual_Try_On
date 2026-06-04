from typing import List
from firebase_config import db
from schemas.tryon_sessions import TryOnSession, TryOnSessionResponse
from datetime import datetime

class TryOnService:
    @staticmethod
    def get_continue_sessions(uid: str) -> TryOnSessionResponse:
        if db is None:
            return TryOnSessionResponse(sessions=[], total=0)
            
        try:
            sessions_ref = db.collection("users").document(uid).collection("tryonSessions")
            docs = sessions_ref.order_by("updatedAt", direction="DESCENDING").limit(20).stream()
            
            sessions = []
            for doc in docs:
                data = doc.to_dict()
                if data.get("status") == "completed":
                    continue
                
                # Handle possible timestamp types
                def parse_timestamp(ts_raw):
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
                updated_at = parse_timestamp(data.get("updatedAt"))
                
                session = TryOnSession(
                    sessionId=data.get("sessionId", doc.id),
                    uploadedImage=data.get("uploadedImage"),
                    selectedHairstyle=data.get("selectedHairstyle"),
                    selectedColor=data.get("selectedColor"),
                    comparisonIds=data.get("comparisonIds", []),
                    analysisId=data.get("analysisId"),
                    progress=data.get("progress", 0),
                    status=data.get("status", "started"),
                    createdAt=created_at,
                    updatedAt=updated_at
                )
                sessions.append(session)
                
            return TryOnSessionResponse(sessions=sessions, total=len(sessions))
            
        except Exception as e:
            print(f"[ERROR] Failed to fetch TryOn sessions for uid {uid}: {e}")
            raise e

    @staticmethod
    def start_tryon(uid: str, image_id: str, hairstyle_id: str) -> dict:
        if db is None:
            raise Exception("Database is not initialized.")
        
        tryon_ref = db.collection("users").document(uid).collection("tryons").document()
        tryon_id = tryon_ref.id
        
        now = datetime.now()
        
        data = {
            "tryOnId": tryon_id,
            "imageId": image_id,
            "hairstyleId": hairstyle_id,
            "status": "pending",
            "resultImage": None,
            "createdAt": now,
            "completedAt": None
        }
        
        tryon_ref.set(data)
        
        return {
            "tryOnId": tryon_id,
            "status": "pending"
        }
        
    @staticmethod
    def get_tryon_status(uid: str, tryon_id: str) -> dict:
        if db is None:
            raise Exception("Database is not initialized.")
            
        tryon_ref = db.collection("users").document(uid).collection("tryons").document(tryon_id)
        doc = tryon_ref.get()
        
        if not doc.exists:
            raise Exception("TryOn session not found")
            
        data = doc.to_dict()
        
        return {
            "tryOnId": data.get("tryOnId", tryon_id),
            "status": data.get("status", "pending"),
            "resultImage": data.get("resultImage")
        }
