from firebase_config import db
from schemas.recommendations import RecommendationResponse, RecommendationItem
from datetime import datetime

class RecommendationService:
    @staticmethod
    def get_recommendations(uid: str) -> RecommendationResponse:
        if db is None:
            # If no firebase, return empty per requirements (no fake data)
            return RecommendationResponse(
                recommendations=[],
                total=0,
                generatedAt=datetime.now()
            )
            
        try:
            # Fetch from users/{uid}/recommendations
            docs = db.collection("users").document(uid).collection("recommendations").order_by("suitabilityScore", direction="DESCENDING").stream()
            
            recommendations = []
            
            def parse_timestamp(ts_raw):
                if not ts_raw:
                    return None
                ts = datetime.now()
                if hasattr(ts_raw, 'timestamp'):
                    ts = datetime.fromtimestamp(ts_raw.timestamp())
                elif isinstance(ts_raw, str):
                    try:
                        ts = datetime.fromisoformat(ts_raw.replace('Z', '+00:00'))
                    except ValueError:
                        pass
                return ts

            for doc in docs:
                data = doc.to_dict()
                
                item = RecommendationItem(
                    recommendationId=data.get("recommendationId", doc.id),
                    hairstyleId=data.get("hairstyleId", ""),
                    hairstyleName=data.get("hairstyleName", ""),
                    category=data.get("category", ""),
                    suitabilityScore=data.get("suitabilityScore", 0.0),
                    maintenanceLevel=data.get("maintenanceLevel", "Medium"),
                    recommendationReason=data.get("recommendationReason", ""),
                    generatedAt=parse_timestamp(data.get("generatedAt")) or datetime.now(),
                    imageUrl=data.get("imageUrl")
                )
                recommendations.append(item)
                
            return RecommendationResponse(
                recommendations=recommendations,
                total=len(recommendations),
                generatedAt=datetime.now() if not recommendations else recommendations[0].generatedAt
            )
            
        except Exception as e:
            print(f"[ERROR] Failed to fetch recommendations for uid {uid}: {e}")
            raise e
