from typing import List
from firebase_config import db
from schemas.ai_insights import AIInsight, AIInsightsResponse
from datetime import datetime

class AIInsightsService:
    @staticmethod
    def get_user_insights(uid: str) -> AIInsightsResponse:
        if db is None:
            return AIInsightsResponse(insights=[], status="pending")
            
        try:
            analysis_ref = db.collection("users").document(uid).collection("analysis")
            docs = analysis_ref.order_by("generatedAt", direction="DESCENDING").stream()
            
            insights = []
            for doc in docs:
                data = doc.to_dict()
                
                # Handle possible timestamp types
                generated_at_raw = data.get("generatedAt")
                generated_at = datetime.now()
                if hasattr(generated_at_raw, 'timestamp'):
                    generated_at = datetime.fromtimestamp(generated_at_raw.timestamp())
                elif isinstance(generated_at_raw, str):
                    try:
                        generated_at = datetime.fromisoformat(generated_at_raw.replace('Z', '+00:00'))
                    except ValueError:
                        pass
                
                insight = AIInsight(
                    analysisId=data.get("analysisId", doc.id),
                    faceShape=data.get("faceShape"),
                    hairDensity=data.get("hairDensity"),
                    hairThickness=data.get("hairThickness"),
                    hairLength=data.get("hairLength"),
                    hairHealth=data.get("hairHealth"),
                    hairTexture=data.get("hairTexture"),
                    hairColor=data.get("hairColor"),
                    confidenceScore=data.get("confidenceScore"),
                    generatedAt=generated_at
                )
                insights.append(insight)
                
            status = "completed" if len(insights) > 0 else "pending"
            return AIInsightsResponse(insights=insights, status=status)
            
        except Exception as e:
            print(f"[ERROR] Failed to fetch AI insights for uid {uid}: {e}")
            raise e
