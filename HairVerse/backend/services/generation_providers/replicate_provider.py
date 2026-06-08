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
        prompt: str, 
        config: Optional[Dict[str, Any]] = None
    ) -> str:
        if not self.api_token:
            print("[MOCK] REPLICATE_API_TOKEN is not set. Using mock generation fallback.")
            await asyncio.sleep(3) # Simulate generation time
            
            # Return a realistic-looking mock generated image based on the prompt content
            # These are distinctly different hairstyles to show the effect works
            prompt_lower = prompt.lower()
            if "blonde" in prompt_lower:
                return "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=800&auto=format&fit=crop"
            elif "curly" in prompt_lower:
                return "https://images.unsplash.com/photo-1605384318063-42e12816999a?q=80&w=800&auto=format&fit=crop"
            elif "short" in prompt_lower:
                return "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=800&auto=format&fit=crop"
            elif "bob" in prompt_lower:
                return "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=800&auto=format&fit=crop"
            else:
                # Default different hairstyle (pink/purple wavy hair)
                return "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=800&auto=format&fit=crop"

        headers = {
            "Authorization": f"Token {self.api_token}",
            "Content-Type": "application/json"
        }
        
        # Configure input for the Replicate model
        # prompt is already fully constructed by tryon_prompt_builder
        if config and config.get("beardStyle") and config.get("beardStyle") != "None":
            prompt += f", with a {config.get('beardStyle')} beard."
        
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
