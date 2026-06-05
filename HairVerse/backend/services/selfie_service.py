import uuid
import mimetypes
import re
from datetime import datetime, timezone, timedelta
from typing import Tuple, Optional
from fastapi import HTTPException, status, UploadFile
from firebase_config import db, storage_bucket
from google.cloud import firestore

class SelfieService:
    @staticmethod
    def _validate_user_id(user_id: str):
        if not re.match(r"^[a-zA-Z0-9_-]+$", user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID format."
            )

    @staticmethod
    async def upload_selfie(user_id: str, file: UploadFile, source: str = "camera") -> dict:
        SelfieService._validate_user_id(user_id)
        if not db or not storage_bucket:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Firebase services are not initialized."
            )

        # Validate file type strictly
        content_type = file.content_type
        allowed_types = ["image/jpeg", "image/png", "image/webp"]
        if content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be a valid image (JPEG, PNG, WEBP)."
            )

        # Read file content and validate size (10MB limit)
        file_content = await file.read()
        MAX_SIZE = 10 * 1024 * 1024
        if len(file_content) > MAX_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File too large. Maximum size is 10MB."
            )
        if len(file_content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File is empty or corrupted."
            )

        # Generate unique ID for the image
        image_id = str(uuid.uuid4())
        
        # Get file extension or default to .jpg
        ext = mimetypes.guess_extension(content_type) or ".jpg"
        file_path = f"users/{user_id}/selfies/{image_id}{ext}"

        try:
            # Upload to Firebase Storage
            blob = storage_bucket.blob(file_path)
            blob.upload_from_string(file_content, content_type=content_type)
            image_url = blob.generate_signed_url(version="v4", expiration=timedelta(days=7), method="GET")

            # Check if this should be the active selfie (if no others exist)
            selfies_ref = db.collection("users").document(user_id).collection("selfies")
            existing_selfies = selfies_ref.limit(1).get()
            is_active = len(existing_selfies) == 0

            # Prepare metadata for Firestore
            now = datetime.now(timezone.utc)
            metadata = {
                "imageId": image_id,
                "imageUrl": image_url,
                "storagePath": file_path,
                "source": source,
                "status": "uploaded",
                "isActive": is_active,
                "uploadedAt": now,
                "updatedAt": now
            }

            # Save metadata to Firestore
            selfies_ref.document(image_id).set(metadata)

            return metadata

        except Exception as e:
            import traceback
            with open("error_log.txt", "w") as f:
                f.write(traceback.format_exc())
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload selfie: {str(e)}"
            )

    @staticmethod
    async def get_selfies(user_id: str, limit: int = 10, cursor: Optional[str] = None) -> Tuple[list[dict], Optional[str]]:
        SelfieService._validate_user_id(user_id)
        try:
            selfies_ref = db.collection("users").document(user_id).collection("selfies")
            query = selfies_ref.order_by("uploadedAt", direction=firestore.Query.DESCENDING).limit(limit)

            if cursor:
                # Get the document to start after
                cursor_doc = selfies_ref.document(cursor).get()
                if cursor_doc.exists:
                    query = query.start_after(cursor_doc)

            docs = query.get()
            results = [doc.to_dict() for doc in docs]
            
            next_cursor = None
            if len(docs) == limit:
                next_cursor = docs[-1].id

            return results, next_cursor
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch selfies: {str(e)}"
            )

    @staticmethod
    async def get_selfie(user_id: str, image_id: str) -> dict:
        SelfieService._validate_user_id(user_id)
        try:
            doc_ref = db.collection("users").document(user_id).collection("selfies").document(image_id)
            doc = doc_ref.get()
            if not doc.exists:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Selfie not found")
            return doc.to_dict()
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch selfie: {str(e)}"
            )

    @staticmethod
    async def set_active_selfie(user_id: str, image_id: str) -> dict:
        SelfieService._validate_user_id(user_id)
        try:
            selfies_ref = db.collection("users").document(user_id).collection("selfies")
            
            # Verify the image exists
            target_doc = selfies_ref.document(image_id).get()
            if not target_doc.exists:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Selfie not found")

            # Batch update to set all to inactive, and target to active
            batch = db.batch()
            docs = selfies_ref.get()
            for doc in docs:
                doc_ref = selfies_ref.document(doc.id)
                if doc.id == image_id:
                    batch.update(doc_ref, {"isActive": True, "updatedAt": datetime.now(timezone.utc)})
                elif doc.to_dict().get("isActive"):
                    batch.update(doc_ref, {"isActive": False, "updatedAt": datetime.now(timezone.utc)})
            
            batch.commit()
            
            updated_doc = selfies_ref.document(image_id).get()
            return updated_doc.to_dict()
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to set active selfie: {str(e)}"
            )

    @staticmethod
    async def delete_selfie(user_id: str, image_id: str) -> dict:
        SelfieService._validate_user_id(user_id)
        try:
            selfies_ref = db.collection("users").document(user_id).collection("selfies")
            doc_ref = selfies_ref.document(image_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Selfie not found")
            
            selfie_data = doc.to_dict()
            storage_path = selfie_data.get("storagePath")
            was_active = selfie_data.get("isActive", False)
            
            # Delete from Storage FIRST to prevent orphan records
            if storage_path:
                try:
                    blob = storage_bucket.blob(storage_path)
                    blob.delete()
                except Exception as e:
                    # If it's a 404 from storage, we can proceed to cleanup firestore
                    if "404" not in str(e):
                        raise HTTPException(
                            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                            detail="Storage deletion failed. Rollback prevented Firestore deletion."
                        )
            
            # Delete from Firestore
            doc_ref.delete()
                    
            # If it was active, set the newest remaining one as active
            if was_active:
                remaining = selfies_ref.order_by("uploadedAt", direction=firestore.Query.DESCENDING).limit(1).get()
                if remaining:
                    new_active_ref = selfies_ref.document(remaining[0].id)
                    new_active_ref.update({"isActive": True, "updatedAt": datetime.now(timezone.utc)})
                    
            return {"message": "Selfie deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete selfie: {str(e)}"
            )

selfie_service = SelfieService()
