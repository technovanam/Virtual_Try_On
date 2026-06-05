from abc import ABC, abstractmethod
from typing import Optional, Dict, Any

class GenerationProvider(ABC):
    """
    Abstract base class for all AI image generation providers (e.g., Replicate, Google Imagen).
    """

    @abstractmethod
    async def generate_tryon(
        self, 
        source_image_url: str, 
        hairstyle_prompt: str, 
        config: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generates a try-on image.
        
        Args:
            source_image_url: URL of the user's selfie.
            hairstyle_prompt: Description or ID of the hairstyle to apply.
            config: Optional configuration for the specific provider.
            
        Returns:
            str: URL of the generated image.
            
        Raises:
            Exception: If generation fails.
        """
        pass
