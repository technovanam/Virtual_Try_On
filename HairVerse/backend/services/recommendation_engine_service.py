import uuid
from datetime import datetime
from firebase_config import db
from schemas.recommendation_engine import RecommendationEngineResponse, RecommendationGenerateRequest

class RecommendationEngineService:
    @staticmethod
    def generate(uid: str, request: RecommendationGenerateRequest) -> RecommendationEngineResponse:
        recommendation_id = str(uuid.uuid4())
        
        # FUTURE OPENCV / MEDIAPIPE INTEGRATION POINTS:
        # The recommendation flow will ingest CV outputs from previous pipelines:
        # 1. Face Shape (MediaPipe face mesh analysis)
        # 2. Hair Texture/Density (OpenCV hair segmentation & edge frequency analysis)
        # 3. Apply style rules: match ingested traits against hairstyle database parameters
        # 4. Score suitability based on algorithmic rules & golden ratio calculations
        
        data = {
            "recommendationId": recommendation_id,
            "status": "pending",
            "createdAt": datetime.now(),
            # Future fields ready for population once pipeline completes:
            # "hairstyleId": None,
            # "suitabilityScore": None,
            # "reasons": None,
            # "generatedAt": None
        }
        
        if db is not None:
            # Firestore path: users/{uid}/recommendations/{recommendationId}
            doc_ref = db.collection("users").document(uid).collection("recommendations").document(recommendation_id)
            doc_ref.set(data)
            
        return RecommendationEngineResponse(
            status="pending",
            recommendationId=recommendation_id
        )

    @staticmethod
    def get_recommendation(uid: str, recommendation_id: str) -> RecommendationEngineResponse:
        if db is None:
            return RecommendationEngineResponse(status="pending", recommendationId=recommendation_id)
            
        doc_ref = db.collection("users").document(uid).collection("recommendations").document(recommendation_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return RecommendationEngineResponse(status="not_found", recommendationId=recommendation_id)
            
        data = doc.to_dict()
        
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
            
        return RecommendationEngineResponse(
            status=data.get("status", "pending"),
            recommendationId=data.get("recommendationId", recommendation_id),
            hairstyleId=data.get("hairstyleId"),
            suitabilityScore=data.get("suitabilityScore"),
            reasons=data.get("reasons"),
            generatedAt=parse_timestamp(data.get("generatedAt") or data.get("createdAt"))
        )
