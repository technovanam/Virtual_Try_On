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
            docs = analysis_ref.order_by("analyzedAt", direction="DESCENDING").limit(1).stream()
            
            insights = []
            for doc in docs:
                data = doc.to_dict()
                
                # Handle possible timestamp types
                analyzed_at_raw = data.get("analyzedAt") or data.get("generatedAt")
                analyzed_at = datetime.now()
                if hasattr(analyzed_at_raw, 'timestamp'):
                    analyzed_at = datetime.fromtimestamp(analyzed_at_raw.timestamp())
                elif isinstance(analyzed_at_raw, str):
                    try:
                        analyzed_at = datetime.fromisoformat(analyzed_at_raw.replace('Z', '+00:00'))
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
                    beardDensity=data.get("beardDensity"),
                    confidenceScores=data.get("confidenceScores"),
                    analyzedAt=analyzed_at
                )
                insights.append(insight)
                
            status = "completed" if len(insights) > 0 else "pending"
            return AIInsightsResponse(insights=insights, status=status)
            
        except Exception as e:
            print(f"[ERROR] Failed to fetch AI insights for uid {uid}: {e}")
            raise e
