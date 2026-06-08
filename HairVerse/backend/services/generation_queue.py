import asyncio
import traceback
from datetime import datetime
from typing import Dict, Any, Optional
from firebase_config import db
import os
from .generation_providers import ReplicateProvider, StableDiffusionProvider
from .tryon_prompt_builder import build_tryon_prompt

# Provider factory
def get_provider(provider_name: str):
    # Check what keys are available
    has_sd = bool(os.getenv("STABLE_DIFFUSION_API_KEY"))
    
    if provider_name == "stability" or (has_sd and provider_name != "replicate"):
        return StableDiffusionProvider()
        
    return ReplicateProvider() # Default back to replicate (which has our mock fallback)

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
                
            source_image_url = selfie_doc.to_dict().get("imageUrl")
            if not source_image_url:
                raise Exception(f"Source image URL is missing.")

            # Fetch hairstyle prompt
            hairstyle_ref = db.collection("hairstyles").document(hairstyle_id)
            hairstyle_doc = hairstyle_ref.get()
            
            if not hairstyle_doc.exists:
                # If not in catalog (e.g. AI recommendation), use the ID string as the name itself
                hairstyle_name = hairstyle_id
                hairstyle_desc = ""
            else:
                hairstyle_data = hairstyle_doc.to_dict()
                hairstyle_name = hairstyle_data.get("name", hairstyle_data.get("hairstyleName", "new hairstyle"))
                hairstyle_desc = hairstyle_data.get("description", "")
            
            # Fetch user analysis data
            face_shape, hair_density, hair_texture, hair_color = "", "", "", ""
            
            # Try getting face analysis
            try:
                # Some implementations might save without 'latest' or query the most recent
                face_analysis_ref = db.collection("users").document(uid).collection("faceAnalysis").order_by("timestamp", direction="DESCENDING").limit(1)
                face_docs = face_analysis_ref.get()
                if face_docs:
                    face_shape = face_docs[0].to_dict().get("faceShape", "")
            except Exception:
                pass
                
            # Try getting hair analysis
            try:
                hair_analysis_ref = db.collection("users").document(uid).collection("hairAnalysis").order_by("timestamp", direction="DESCENDING").limit(1)
                hair_docs = hair_analysis_ref.get()
                if hair_docs:
                    hair_data = hair_docs[0].to_dict()
                    hair_density = hair_data.get("density", "")
                    hair_texture = hair_data.get("texture", "")
                    hair_color = hair_data.get("color", "")
            except Exception:
                pass
                
            # Use tryon_prompt_builder
            prompt = build_tryon_prompt(
                face_shape=face_shape,
                hair_density=hair_density,
                hair_texture=hair_texture,
                hair_color=hair_color,
                hairstyle_name=hairstyle_name,
                hairstyle_description=hairstyle_desc
            )
            
            # 2. Get provider and generate
            provider_name = config.get("provider", "replicate") if config else "replicate"
            provider = get_provider(provider_name)
            
            result_url = await provider.generate_tryon(source_image_url, prompt, config)
            
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
