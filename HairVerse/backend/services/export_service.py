from datetime import datetime
from typing import List
from firebase_config import db
from schemas.exports_schemas import ExportRequest, ExportRecord, ExportResponse

class ExportServiceError(Exception):
    pass

class ExportService:
    @staticmethod
    def track_export(uid: str, request: ExportRequest) -> ExportResponse:
        if db is None:
            raise ExportServiceError("Firestore is not initialized.")
            
        try:
            export_ref = db.collection("users").document(uid).collection("exports").document()
            export_id = export_ref.id
            now = datetime.now()
            
            record = ExportRecord(
                exportId=export_id,
                exportType=request.exportType,
                resourceId=request.resourceId,
                imageUrl=request.imageUrl,
                format=request.format,
                quality=request.quality,
                exportedAt=now
            )
            
            export_ref.set(record.dict())
            
            return ExportResponse(
                success=True,
                message="Export tracked successfully",
                exportRecord=record
            )
        except Exception as e:
            raise ExportServiceError(f"Failed to track export: {e}")

    @staticmethod
    def get_export_history(uid: str) -> List[ExportRecord]:
        if db is None:
            return []
            
        try:
            exports_ref = db.collection("users").document(uid).collection("exports")
            docs = exports_ref.order_by("exportedAt", direction="DESCENDING").limit(20).stream()
            
            history = []
            for doc in docs:
                data = doc.to_dict()
                history.append(ExportRecord(**data))
            
            return history
        except Exception as e:
            raise ExportServiceError(f"Failed to fetch export history: {e}")
