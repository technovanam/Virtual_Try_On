import os
import uuid
import json
import requests
import tempfile
from datetime import datetime, timezone
import google.generativeai as genai
from fastapi import HTTPException
from firebase_config import db
from schemas.hair_insights import HairInsightsResponse, HairInsightsHistoryResponse, HairInsights
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"))

api_key = os.getenv("GEMINI_API_KEY")
if api_key and api_key != "your_gemini_api_key_here":
    genai.configure(api_key=api_key)

class HairInsightsService:
    @staticmethod
    def _parse_timestamp(ts_raw):
        if not ts_raw:
            return None
        ts = datetime.now()
        if hasattr(ts_raw, 'timestamp'):
            ts = datetime.fromtimestamp(ts_raw.timestamp())
        elif isinstance(ts_raw, str):
            try:
                ts = datetime.fromisoformat(ts_raw.replace('Z', '+00:00'))
            except ValueError:
                pass
        return ts

    @staticmethod
    def get_insights(uid: str) -> HairInsightsResponse:
        if db is None:
            return HairInsightsResponse(status="error")
            
        try:
            insights_ref = db.collection("users").document(uid).collection("hairInsights")
            docs = insights_ref.order_by("analyzedAt", direction="DESCENDING").limit(1).get()
            
            if not docs:
                return HairInsightsResponse(status="empty")
                
            data = docs[0].to_dict()
            data['analyzedAt'] = HairInsightsService._parse_timestamp(data.get('analyzedAt'))
            
            insight = HairInsights(**data)
            return HairInsightsResponse(status="success", insights=insight)
            
        except Exception as e:
            print(f"[ERROR] Failed to fetch hair insights for uid {uid}: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def get_history(uid: str) -> HairInsightsHistoryResponse:
        if db is None:
            return HairInsightsHistoryResponse(history=[])
            
        try:
            insights_ref = db.collection("users").document(uid).collection("hairInsights")
            docs = insights_ref.order_by("analyzedAt", direction="DESCENDING").limit(10).stream()
            
            history = []
            for doc in docs:
                data = doc.to_dict()
                data['analyzedAt'] = HairInsightsService._parse_timestamp(data.get('analyzedAt'))
                history.append(HairInsights(**data))
                
            return HairInsightsHistoryResponse(history=history)
            
        except Exception as e:
            print(f"[ERROR] Failed to fetch hair insights history for uid {uid}: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def _download_image(image_url: str) -> str:
        response = requests.get(image_url, stream=True)
        response.raise_for_status()
        fd, path = tempfile.mkstemp(suffix=".jpg")
        with os.fdopen(fd, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return path

    @staticmethod
    def generate_insights(uid: str) -> HairInsightsResponse:
        if db is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
            
        if not api_key or api_key == "your_gemini_api_key_here":
            raise HTTPException(status_code=500, detail="Gemini API Key not configured")

        try:
            # Fetch active selfie
            selfies_ref = db.collection("users").document(uid).collection("selfies")
            active_selfies = selfies_ref.where("isActive", "==", True).limit(1).get()
            
            if not active_selfies:
                raise HTTPException(status_code=404, detail="No active selfie found. Please upload a selfie first.")
                
            image_url = active_selfies[0].to_dict().get("imageUrl")
            if not image_url:
                raise HTTPException(status_code=400, detail="Active selfie missing image URL")

            tmp_image_path = HairInsightsService._download_image(image_url)
            sample_file = genai.upload_file(path=tmp_image_path)
            
            model = genai.GenerativeModel('gemini-1.5-flash', generation_config={"response_mime_type": "application/json"})
            
            prompt = """
            Analyze the provided user selfie to extract deep, detailed hair intelligence.
            You must respond ONLY with a valid JSON object matching the exact structure below. Do not include markdown formatting like ```json.
            
            Estimate realistic values based on visual evidence. Do NOT hardcode.
            
            {
                "hairType": "string (e.g. 1A, 2B, 3C, 4A)",
                "texture": "string (e.g. Fine, Medium, Coarse)",
                "density": "string (e.g. Low, Medium, High)",
                "healthScore": "integer between 1 and 100 representing overall hair health",
                "shineLevel": "string (e.g. Low, Medium, High)",
                "volumeLevel": "string (e.g. Flat, Moderate, Voluminous)",
                "grayHairPercentage": "integer between 0 and 100",
                "healthAnalysis": {
                    "dryness": "integer between 1 and 100 (100 is very dry)",
                    "frizz": "integer between 1 and 100 (100 is very frizzy)",
                    "damage": "integer between 1 and 100 (100 is highly damaged)",
                    "breakage": "integer between 1 and 100 (100 is severe breakage)",
                    "strength": "integer between 1 and 100 (100 is very strong)"
                },
                "hairlineAnalysis": {
                    "hairlineType": "string (e.g. Straight, Receding, Widow's Peak, Uneven)",
                    "foreheadType": "string (e.g. Broad, Narrow, High, Average)",
                    "growthPattern": "string (e.g. Uniform, Patchy, Thinning at crown)"
                },
                "recommendations": [
                    "string (actionable tip 1, e.g., 'Use sulfate-free shampoo')",
                    "string (actionable tip 2)",
                    "string (actionable tip 3)"
                ],
                "productSuggestions": [
                    {
                        "type": "Shampoo",
                        "name": "string (e.g. Hydrating Argan Oil Shampoo)",
                        "reason": "string (e.g. To combat high dryness levels)"
                    },
                    {
                        "type": "Conditioner",
                        "name": "string",
                        "reason": "string"
                    },
                    {
                        "type": "Serum",
                        "name": "string",
                        "reason": "string"
                    }
                ]
            }
            """
            
            response = model.generate_content([sample_file, prompt])
            
            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
                
            analysis_data = json.loads(raw_text)
            
            os.remove(tmp_image_path)
            sample_file.delete()
            
            insight_id = str(uuid.uuid4())
            now = datetime.now(timezone.utc)
            
            analysis_data["insightId"] = insight_id
            analysis_data["analyzedAt"] = now
            
            db.collection("users").document(uid).collection("hairInsights").document(insight_id).set(analysis_data)
            
            insight = HairInsights(**analysis_data)
            return HairInsightsResponse(status="success", insights=insight)
            
        except Exception as e:
            print(f"[ERROR] Failed to generate hair insights: {e}")
            raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")
