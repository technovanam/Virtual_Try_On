import os
import httpx
import asyncio
import uuid
import base64
from datetime import timedelta
from typing import Optional, Dict, Any
from .base import GenerationProvider
from firebase_config import storage_bucket

class StableDiffusionProvider(GenerationProvider):
    """
    Implementation of GenerationProvider using Stability AI Search and Replace API.
    """
    
    def __init__(self):
        self.api_key = os.getenv("STABLE_DIFFUSION_API_KEY")
        self.base_url = "https://api.stability.ai/v2beta/stable-image/edit/search-and-replace"
        
    async def generate_tryon(
        self, 
        source_image_url: str, 
        prompt: str, 
        config: Optional[Dict[str, Any]] = None
    ) -> str:
        if not self.api_key:
            raise Exception("STABLE_DIFFUSION_API_KEY is not set in environment variables.")

        if config and config.get("beardStyle") and config.get("beardStyle") != "None":
            prompt += f", with a {config.get('beardStyle')} beard."

        # Download the source image
        async with httpx.AsyncClient() as client:
            image_resp = await client.get(source_image_url)
            image_resp.raise_for_status()
            image_bytes = image_resp.content

            # Call Stability AI API
            files = {
                "image": ("image.jpg", image_bytes, "image/jpeg")
            }
            data = {
                "search_prompt": "hair",
                "prompt": prompt,
                "output_format": "webp"
            }
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Accept": "application/json" # Request JSON to get base64
            }
            
            response = await client.post(
                self.base_url,
                headers=headers,
                files=files,
                data=data,
                timeout=60.0
            )
            
            if response.status_code != 200:
                error_msg = response.text
                try:
                    error_json = response.json()
                    if "message" in error_json:
                        error_msg = error_json["message"]
                except:
                    pass
                raise Exception(f"Stability AI Generation failed: {error_msg}")

            result_json = response.json()
            base64_image = result_json.get("image")
            
            if not base64_image:
                raise Exception("Stability AI API did not return an image.")

            # Decode base64
            image_data = base64.b64decode(base64_image)
            
            # Upload to Firebase Storage
            result_id = str(uuid.uuid4())
            file_path = f"tryons/results/{result_id}.webp"
            
            if not storage_bucket:
                raise Exception("Firebase storage bucket is not initialized.")
                
            blob = storage_bucket.blob(file_path)
            blob.upload_from_string(image_data, content_type="image/webp")
            
            # Generate a signed URL for the frontend
            signed_url = blob.generate_signed_url(
                version="v4",
                expiration=timedelta(days=7),
                method="GET"
            )
            
            return signed_url
