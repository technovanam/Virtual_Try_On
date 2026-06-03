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
            docs = sessions_ref.order_by("updatedAt", direction="DESCENDING").stream()
            
            sessions = []
            for doc in docs:
                data = doc.to_dict()
                
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
