from firebase_config import db
from schemas.analysis import AnalysisStatusResponse, CompleteAnalysisResultResponse
from datetime import datetime

class AnalysisService:
    @staticmethod
    def get_analysis_result(uid: str, analysis_id: str) -> CompleteAnalysisResultResponse:
        if db is None:
            return CompleteAnalysisResultResponse(status="error", analysisId=analysis_id, healthObservations=["Firestore not initialized"])
            
        try:
            doc_ref = db.collection("users").document(uid).collection("geminiAnalysis").document(analysis_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return CompleteAnalysisResultResponse(status="not_found", analysisId=analysis_id)
                
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
                
            return CompleteAnalysisResultResponse(
                status=data.get("status", "completed"),
                analysisId=data.get("analysisId", analysis_id),
                faceShape=data.get("faceShape"),
                jawlineType=data.get("jawlineType"),
                foreheadType=data.get("foreheadType"),
                faceSymmetryScore=data.get("faceSymmetryScore"),
                hairLength=data.get("hairLength"),
                hairDensity=data.get("hairDensity"),
                hairVolume=data.get("hairVolume"),
                hairTexture=data.get("hairTexture"),
                hairType=data.get("hairType"),
                hairColor=data.get("hairColor"),
                hairHealthScore=data.get("hairHealthScore"),
                hairlineType=data.get("hairlineType"),
                beardDensity=data.get("beardDensity"),
                beardCompatibility=data.get("beardCompatibility"),
                celebrityMatchSummary=data.get("celebrityMatchSummary"),
                recommendationSummary=data.get("recommendationSummary"),
                confidence=data.get("confidence"),
                healthObservations=data.get("healthObservations", []),
                bestHairstyles=data.get("bestHairstyles", []),
                bestHairColors=data.get("bestHairColors", []),
                bestBeardStyles=data.get("bestBeardStyles", []),
                recommendations=data.get("recommendations", []),
                recommendedStylesDetailed=data.get("recommendedStylesDetailed", []),
                facialFeatureSummary=data.get("facialFeatureSummary"),
                analyzedAt=parse_timestamp(data.get("analyzedAt")),
                analysisVersion=data.get("analysisVersion", 1)
            )
        except Exception as e:
            print(f"[ERROR] Failed to fetch complete analysis result for uid {uid}, analysis_id {analysis_id}: {e}")
            raise e

    @staticmethod
    def get_analysis_status(uid: str, analysis_id: str) -> AnalysisStatusResponse:
        if db is None:
            # For development without firebase connected, return mock pending
            return AnalysisStatusResponse(
                analysisId=analysis_id,
                status="pending",
                progress=0,
                createdAt=datetime.now()
            )
            
        try:
            doc_ref = db.collection("users").document(uid).collection("geminiAnalysis").document(analysis_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                # If it doesn't exist yet, we can assume it's pending initialization
                # In production, maybe raise 404 if invalid
                return AnalysisStatusResponse(
                    analysisId=analysis_id,
                    status="pending",
                    progress=0,
                    createdAt=datetime.now()
                )
                
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

            return AnalysisStatusResponse(
                analysisId=data.get("analysisId", analysis_id),
                status=data.get("status", "pending"),
                progress=data.get("progress", 0),
                createdAt=parse_timestamp(data.get("createdAt")) or datetime.now(),
                completedAt=parse_timestamp(data.get("completedAt")),
                imageId=data.get("imageId"),
                analysisType=data.get("analysisType")
            )
            
        except Exception as e:
            print(f"[ERROR] Failed to fetch analysis status for uid {uid}, analysis_id {analysis_id}: {e}")
            raise e
