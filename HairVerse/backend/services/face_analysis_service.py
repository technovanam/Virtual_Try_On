import uuid
from datetime import datetime
from firebase_config import db
from schemas.face_analysis import FaceAnalysisResponse

class FaceAnalysisService:
    @staticmethod
    def start_analysis(uid: str, image_url: str = None) -> FaceAnalysisResponse:
        analysis_id = str(uuid.uuid4())
        
        # FUTURE OPENCV / MEDIAPIPE INTEGRATION POINTS:
        # Here we would initialize the computer vision pipeline:
        # 1. Download/access the uploaded image
        # 2. Run Face Shape Detection (MediaPipe Face Mesh / OpenCV contours)
        # 3. Run Face Symmetry Analysis (OpenCV feature matching)
        # 4. Run Forehead Analysis (MediaPipe landmarks)
        # 5. Run Jawline Analysis (OpenCV edge detection / MediaPipe)
        # 6. Calculate Face Proportions
        
        # Current MVP: Initialize in Firestore and return status
        data = {
            "analysisId": analysis_id,
            "status": "pending",
            "createdAt": datetime.now(),
            # Future fields ready for AI Engine population:
            # "faceShape": None,
            # "symmetryScore": None,
            # "foreheadType": None,
            # "jawlineType": None,
            # "confidence": None,
            # "analyzedAt": None,
        }
        
        if db is not None:
            # Firestore path: users/{uid}/faceAnalysis/{analysisId}
            doc_ref = db.collection("users").document(uid).collection("faceAnalysis").document(analysis_id)
            doc_ref.set(data)
            
        return FaceAnalysisResponse(
            status="pending",
            analysisId=analysis_id
        )

    @staticmethod
    def get_analysis(uid: str, analysis_id: str) -> FaceAnalysisResponse:
        if db is None:
            return FaceAnalysisResponse(status="pending", analysisId=analysis_id)
            
        doc_ref = db.collection("users").document(uid).collection("faceAnalysis").document(analysis_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return FaceAnalysisResponse(status="not_found", analysisId=analysis_id)
            
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
            
        return FaceAnalysisResponse(
            status=data.get("status", "pending"),
            analysisId=data.get("analysisId", analysis_id),
            faceShape=data.get("faceShape"),
            symmetryScore=data.get("symmetryScore"),
            foreheadType=data.get("foreheadType"),
            jawlineType=data.get("jawlineType"),
            confidence=data.get("confidence"),
            analyzedAt=parse_timestamp(data.get("analyzedAt"))
        )
