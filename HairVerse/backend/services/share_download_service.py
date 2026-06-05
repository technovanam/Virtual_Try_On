import uuid
from datetime import datetime
from firebase_config import db
from schemas.share_download_schemas import TrackRequest, TrackResponse

class ShareDownloadService:
    @staticmethod
    def track_download(uid: str, request: TrackRequest) -> TrackResponse:
        if db is None:
            raise Exception("Firestore is not initialized.")
            
        download_ref = db.collection("users").document(uid).collection("downloads").document()
        download_id = download_ref.id
        
        now = datetime.now()
        
        data = {
            "downloadId": download_id,
            "resourceType": request.resourceType,
            "resourceId": request.resourceId,
            "downloadedAt": now
        }
        
        download_ref.set(data)
        
        return TrackResponse(
            success=True,
            message="Download tracked successfully",
            trackedId=download_id
        )

    @staticmethod
    def track_share(uid: str, request: TrackRequest) -> TrackResponse:
        if db is None:
            raise Exception("Firestore is not initialized.")
            
        share_ref = db.collection("users").document(uid).collection("shared").document()
        share_id = share_ref.id
        
        now = datetime.now()
        
        data = {
            "shareId": share_id,
            "resourceType": request.resourceType,
            "resourceId": request.resourceId,
            "platform": request.platform or "unknown",
            "sharedAt": now
        }
        
        share_ref.set(data)
        
        return TrackResponse(
            success=True,
            message="Share tracked successfully",
            trackedId=share_id
        )
