import asyncio
import traceback
from datetime import datetime
from typing import Dict, Any, Optional
from firebase_config import db
from .generation_providers import ReplicateProvider

# Provider factory
def get_provider(provider_name: str):
    # In a real system, we'd have a registry or factory
    if provider_name == "replicate":
        return ReplicateProvider()
    return ReplicateProvider() # Default

class GenerationQueue:
    """
    Robust background job processor for Virtual Try-On generation.
    Handles state transitions in Firestore, error handling, and provider delegation.
    """
    
    @staticmethod
    async def process_tryon_job(
        uid: str, 
        tryon_id: str, 
        image_id: str, 
        hairstyle_id: str,
        config: Optional[Dict[str, Any]] = None
    ):
        try:
            print(f"[QUEUE] Starting job {tryon_id} for user {uid}")
            if not db:
                raise Exception("Database not initialized")
            
            tryon_ref = db.collection("users").document(uid).collection("tryons").document(tryon_id)
            
            # 1. Mark as processing
            tryon_ref.update({
                "status": "processing",
                "generationTime": datetime.now()
            })
            
            # Fetch source image URL (Assuming we have a selfie or image storage)
            # For this architecture, we assume the frontend provided imageId 
            # corresponds to a document with the actual URL, or we construct it.
            # We'll fetch the user's selfie url based on imageId
            selfie_ref = db.collection("users").document(uid).collection("selfies").document(image_id)
            selfie_doc = selfie_ref.get()
            
            if not selfie_doc.exists:
                raise Exception(f"Source image {image_id} not found.")
                
            source_image_url = selfie_doc.to_dict().get("url")
            if not source_image_url:
                raise Exception(f"Source image URL is missing.")

            # Fetch hairstyle prompt
            hairstyle_ref = db.collection("hairstyles").document(hairstyle_id)
            hairstyle_doc = hairstyle_ref.get()
            
            if not hairstyle_doc.exists:
                raise Exception(f"Hairstyle {hairstyle_id} not found.")
                
            hairstyle_prompt = hairstyle_doc.to_dict().get("name", "new hairstyle")
            
            # 2. Get provider and generate
            provider_name = config.get("provider", "replicate") if config else "replicate"
            provider = get_provider(provider_name)
            
            result_url = await provider.generate_tryon(source_image_url, hairstyle_prompt, config)
            
            # 3. Mark as completed
            tryon_ref.update({
                "status": "completed",
                "resultImage": result_url,
                "completedAt": datetime.now()
            })
            print(f"[QUEUE] Job {tryon_id} completed successfully.")
            
        except Exception as e:
            error_trace = traceback.format_exc()
            print(f"[QUEUE] Job {tryon_id} failed: {str(e)}\n{error_trace}")
            
            # Update status to failed
            if db:
                try:
                    db.collection("users").document(uid).collection("tryons").document(tryon_id).update({
                        "status": "failed",
                        "error": str(e),
                        "completedAt": datetime.now()
                    })
                except Exception as update_err:
                    print(f"[QUEUE] Failed to update error status: {update_err}")

# Create a singleton instance for easier usage
queue_manager = GenerationQueue()
