import uuid
import mimetypes
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, status, UploadFile
from firebase_config import db, storage_bucket

class SelfieService:
    @staticmethod
    async def upload_selfie(user_id: str, file: UploadFile) -> dict:
        if not db or not storage_bucket:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Firebase services are not initialized."
            )

        # Validate file
        content_type = file.content_type
        if not content_type or not content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image."
            )

        # Generate unique ID for the image
        image_id = str(uuid.uuid4())
        
        # Get file extension or default to .jpg
        ext = mimetypes.guess_extension(content_type) or ".jpg"
        file_path = f"users/{user_id}/selfies/{image_id}{ext}"

        # Read file content
        file_content = await file.read()

        try:
            # Upload to Firebase Storage
            blob = storage_bucket.blob(file_path)
            blob.upload_from_string(file_content, content_type=content_type)
            image_url = blob.generate_signed_url(version="v4", expiration=timedelta(days=7), method="GET")

            # Prepare metadata for Firestore
            uploaded_at = datetime.now(timezone.utc)
            metadata = {
                "imageId": image_id,
                "imageUrl": image_url,
                "uploadedAt": uploaded_at,
                "status": "uploaded",
                "analysisStatus": "pending",
                "processingStatus": "pending"
            }

            # Save metadata to Firestore
            db.collection("users").document(user_id).collection("selfies").document(image_id).set(metadata)

            return {
                "imageId": image_id,
                "imageUrl": image_url,
                "uploadedAt": uploaded_at
            }

        except Exception as e:
            import traceback
            with open("error_log.txt", "w") as f:
                f.write(traceback.format_exc())
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload selfie: {str(e)}"
            )

selfie_service = SelfieService()
