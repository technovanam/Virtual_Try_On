from typing import Dict, Any
from firebase_config import db
from schemas.ai_insights import AIInsightsResponse
from datetime import datetime

class AIInsightsService:
    @staticmethod
    def get_user_insights(uid: str) -> AIInsightsResponse:
        if db is None:
            return AIInsightsResponse(
                faceAnalysis={},
                hairAnalysis={},
                geminiAnalysis={},
                combinedInsights={},
                status="pending"
            )
            
        try:
            # Fetch latest Face Analysis
            face_ref = db.collection("users").document(uid).collection("faceAnalysis").order_by("createdAt", direction="DESCENDING").limit(1).get()
            face_data = face_ref[0].to_dict() if face_ref else {}
            
            # Fetch latest Hair Analysis
            hair_ref = db.collection("users").document(uid).collection("hairAnalysis").order_by("analyzedAt", direction="DESCENDING").limit(1).get()
            hair_data = hair_ref[0].to_dict() if hair_ref else {}
            
            # Fetch latest Gemini Analysis
            gemini_ref = db.collection("users").document(uid).collection("geminiAnalysis").order_by("analyzedAt", direction="DESCENDING").limit(1).get()
            gemini_data = gemini_ref[0].to_dict() if gemini_ref else {}
            
            def parse_timestamp(ts_raw):
                if not ts_raw:
                    return None
                if hasattr(ts_raw, 'timestamp'):
                    return ts_raw.timestamp()
                elif isinstance(ts_raw, str):
                    try:
                        return datetime.fromisoformat(ts_raw.replace('Z', '+00:00')).timestamp()
                    except ValueError:
                        pass
                return None
            
            # Convert datetime to timestamp or isoformat to make it JSON serializable if needed
            for d in [face_data, hair_data, gemini_data]:
                for k, v in list(d.items()):
                    if isinstance(v, datetime):
                        d[k] = v.isoformat()
                    elif hasattr(v, 'timestamp'):
                        d[k] = datetime.fromtimestamp(v.timestamp()).isoformat()

            # Combine insights
            combined = {
                "overallHealthScore": hair_data.get("healthScore", 0),
                "hairProfile": f"{hair_data.get('density', '')} {hair_data.get('texture', '')} {hair_data.get('length', '')}".strip(),
                "faceProfile": face_data.get("faceShape", "") or gemini_data.get("faceShape", ""),
                "topRecommendations": gemini_data.get("recommendations", [])
            }
            
            status = "completed" if (face_data or hair_data or gemini_data) else "pending"
            
            return AIInsightsResponse(
                faceAnalysis=face_data,
                hairAnalysis=hair_data,
                geminiAnalysis=gemini_data,
                combinedInsights=combined,
                status=status
            )
            
        except Exception as e:
            print(f"[ERROR] Failed to fetch AI insights for uid {uid}: {e}")
            raise e
