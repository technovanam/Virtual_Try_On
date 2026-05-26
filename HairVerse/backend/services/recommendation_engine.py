import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

def generate_ai_recommendations(face_shape: str, hair_type: str, density: str) -> dict:
    """
    Calls OpenRouter AI to generate hyper-personalized styling insights and haircare descriptions.
    """
    api_key = os.getenv("OPENROUTER_API_KEY")
    
    if not api_key:
        print("OpenRouter API Key not set. Using local mock generator.")
        return {
            "insight": f"Your {face_shape} face shape matches classic texturing like Fades beautifully. Heavy Pomades are not recommended.",
            "care_tips": "Wash 3 times a week with lightweight volume shampoo."
        }

    try:
        # OpenAI SDK pointed at OpenRouter
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key
        )
        
        prompt = f"Write a compact 2-sentence hairstyle recommendation and 1 specific haircare tip for someone with an {face_shape} face shape, {hair_type} hair, and {density} hair density. Keep it highly professional."
        
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "https://hairverse-intelligence.com",
                "X-OpenRouter-Title": "HairVerse"
            },
            model="google/gemini-2.5-flash",  # Fast and cost-effective model on OpenRouter
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        result_text = completion.choices[0].message.content
        
        # Split recommendations and tips dynamically
        parts = result_text.split("\n")
        insight = parts[0] if len(parts) > 0 else f"Suited for texture cuts due to {face_shape} contours."
        care_tips = parts[1] if len(parts) > 1 else "Avoid heavy waxes."
        
        return {
            "insight": insight.replace("Hairstyle recommendation:", "").strip(),
            "care_tips": care_tips.replace("Haircare tip:", "").strip()
        }
        
    except Exception as e:
        print(f"OpenRouter integration error, using fallback: {e}")
        return {
            "insight": f"An {face_shape} shape with {hair_type} cuticles naturally highlights volume when paired with clean cropped fades.",
            "care_tips": "Apply matte styling powder on dry locks to preserve cuticle health."
        }
