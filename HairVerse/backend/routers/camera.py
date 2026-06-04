from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from middleware.auth_middleware import get_current_user
from firebase_config import db, storage_bucket
from typing import Dict
from datetime import datetime, timezone
import uuid
import mimetypes

router = APIRouter()

@router.post("/capture")
async def capture_camera_image(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
) -> Dict:
    """
    Upload a live camera capture to Firebase Storage and create a metadata record in Firestore.
    """
    uid = user.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if not db or not storage_bucket:
        raise HTTPException(status_code=500, detail="Firebase not initialized")

    try:
        content = await file.read()
        
        # Generate unique IDs and timestamps
        image_id = str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc)
        uploaded_at_iso = timestamp.isoformat()
        
        # Determine extension and content type
        content_type = file.content_type or "image/jpeg"
        ext = mimetypes.guess_extension(content_type) or ".jpg"
        
        # Storage path: users/{uid}/camera/capturedImage_{timestamp}
        # Based on user instruction: users/{uid}/camera/capturedImage...
        storage_path = f"users/{uid}/camera/capturedImage_{int(timestamp.timestamp())}{ext}"
        
        # Upload to Firebase Storage
        blob = storage_bucket.blob(storage_path)
        blob.upload_from_string(content, content_type=content_type)
        blob.make_public()
        image_url = blob.public_url

        # Firestore metadata
        capture_data = {
            "imageId": image_id,
            "imageUrl": image_url,
            "uploadedAt": uploaded_at_iso,
            "captureSource": "live_camera",
            "analysisStatus": "pending",
            "processingStatus": "pending"
        }
        
        # Save to users/{uid}/cameraCaptures collection
        db.collection("users").document(uid).collection("cameraCaptures").document(image_id).set(capture_data)
        
        return {
            "imageId": image_id,
            "imageUrl": image_url,
            "uploadedAt": uploaded_at_iso,
            "status": "ready_for_analysis"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process camera capture: {str(e)}")
