import os
import httpx
import asyncio
from typing import Optional, Dict, Any
from .base import GenerationProvider

class ReplicateProvider(GenerationProvider):
    """
    Implementation of GenerationProvider using Replicate API (e.g., Flux, SDXL).
    """
    
    def __init__(self):
        self.api_token = os.getenv("REPLICATE_API_TOKEN")
        self.base_url = "https://api.replicate.com/v1"
        # Using a typical Flux or SDXL model ID for image editing/in-painting
        self.model_version = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
        
    async def generate_tryon(
        self, 
        source_image_url: str, 
        hairstyle_prompt: str, 
        config: Optional[Dict[str, Any]] = None
    ) -> str:
        if not self.api_token:
            print("[WARNING] REPLICATE_API_TOKEN is not set. Using mocked generation.")
            await asyncio.sleep(5) # Simulate generation time
            # Return a realistic-looking placeholder if no token is available
            return "https://images.unsplash.com/photo-1605497788044-5a32c707d59f?w=600&h=600&fit=crop"

        headers = {
            "Authorization": f"Token {self.api_token}",
            "Content-Type": "application/json"
        }
        
        # Configure input for the Replicate model
        # Using a generic prompt structure suitable for image-to-image or inpainting
        prompt = f"A photorealistic portrait of a person with {hairstyle_prompt}. High quality, 8k resolution, highly detailed."
        
        payload = {
            "version": self.model_version,
            "input": {
                "image": source_image_url,
                "prompt": prompt,
                "prompt_strength": 0.8,
                "num_inference_steps": config.get("steps", 30) if config else 30,
                "guidance_scale": config.get("guidance_scale", 7.5) if config else 7.5
            }
        }
        
        async with httpx.AsyncClient() as client:
            # 1. Create prediction
            response = await client.post(
                f"{self.base_url}/predictions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            prediction = response.json()
            prediction_id = prediction["id"]
            
            # 2. Poll for completion
            while True:
                poll_response = await client.get(
                    f"{self.base_url}/predictions/{prediction_id}",
                    headers=headers
                )
                poll_response.raise_for_status()
                status_data = poll_response.json()
                status = status_data["status"]
                
                if status == "succeeded":
                    # Replicate usually returns an array of output URLs
                    return status_data["output"][0]
                elif status == "failed":
                    error_msg = status_data.get("error", "Unknown error from Replicate")
                    raise Exception(f"Generation failed: {error_msg}")
                elif status == "canceled":
                    raise Exception("Generation was canceled.")
                
                # Wait before polling again
                await asyncio.sleep(2)
