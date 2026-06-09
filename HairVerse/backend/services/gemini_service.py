import os
import uuid
import json
import requests
import tempfile
from datetime import datetime
import google.generativeai as genai
from firebase_config import db
from schemas.gemini import GeminiAnalysisResponse
from dotenv import load_dotenv

# Ensure environment variables are loaded
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"))

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key and api_key != "your_gemini_api_key_here":
    genai.configure(api_key=api_key)

class GeminiService:
    @staticmethod
    def _download_image(image_url: str) -> str:
        """Downloads the image from URL to a temporary file and returns its path."""
        response = requests.get(image_url, stream=True)
        response.raise_for_status()
        
        # Create a temporary file
        fd, path = tempfile.mkstemp(suffix=".jpg")
        with os.fdopen(fd, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return path

    @staticmethod
    def analyze_image(uid: str, image_url: str) -> GeminiAnalysisResponse:
        analysis_id = str(uuid.uuid4())
        analyzed_at = datetime.now()
        
        # Default response in case of failure or missing API key
        if not api_key or api_key == "your_gemini_api_key_here":
            return GeminiAnalysisResponse(
                status="error",
                analysisId=analysis_id,
                healthObservations=["Gemini API Key not configured"]
            )
            
        try:
            # 1. Download image locally
            tmp_image_path = GeminiService._download_image(image_url)
            
            # 2. Upload image to Gemini
            sample_file = genai.upload_file(path=tmp_image_path)
            
            # 3. Configure Gemini Model
            # Use gemini-2.5-flash for faster image analysis, ensuring JSON output
            model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})
            
            # 4. Prompt for analysis
            prompt = """
            Analyze the provided user selfie. Extract and estimate the following attributes related to their face and hair.
            Respond ONLY with a valid JSON object matching the exact structure below. Do not include any markdown formatting like ```json.
            {
                "faceShape": "string (e.g. Oval, Round, Square, Heart, Diamond)",
                "jawlineType": "string (e.g. Strong, Soft, Angular, Rounded)",
                "foreheadType": "string (e.g. Broad, Narrow, High, Average)",
                "faceSymmetryScore": "number between 0 and 100",
                "hairLength": "string (e.g. Short, Medium, Long, Buzz Cut, Bald)",
                "hairTexture": "string (e.g. Straight, Wavy, Curly, Coily)",
                "hairType": "string (e.g. Type 1A, Type 2B, Type 4C)",
                "hairDensity": "string (e.g. Fine, Medium, Thick)",
                "hairVolume": "string (e.g. Flat, Average, Voluminous)",
                "hairColor": "string (e.g. Black, Brown, Blonde, Red, Gray)",
                "hairHealthScore": "number between 0 and 100",
                "hairlineType": "string (e.g. Straight, Receding, Widow's Peak, Uneven)",
                "beardDensity": "string (e.g. Clean Shaven, Stubble, Sparse, Thick)",
                "beardCompatibility": "string (e.g. High, Medium, Low based on face shape)",
                "celebrityMatchSummary": "string summarizing top 2-3 celebrity lookalikes and why",
                "recommendationSummary": "string summarizing 2-3 hairstyle recommendations based on face shape and hair type",
                "confidence": "number between 0 and 1 representing confidence in analysis",
                "healthObservations": ["string array of observations about hair health"],
                "bestHairstyles": ["string array of recommended hairstyles"],
                "bestHairColors": ["string array of recommended hair colors"],
                "bestBeardStyles": ["string array of recommended beard styles"],
                "recommendations": ["string array of specific hairstyle names recommended"],
                "recommendedStylesDetailed": [
                    {
                        "styleName": "string",
                        "matchPercentage": "number between 0 and 100",
                        "reason": "string",
                        "maintenanceLevel": "string (e.g. Low, Medium, High)"
                    }
                ],
                "facialFeatureSummary": "string summarizing key facial features"
            }
            """
            
            # 5. Generate content
            response = model.generate_content([sample_file, prompt])
            
            # 6. Parse JSON result
            raw_text = response.text.strip()
            # In case the model still outputs markdown despite prompt instructions
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
                
            analysis_data = json.loads(raw_text)
            
            # Clean up temp file
            os.remove(tmp_image_path)
            # Delete file from Gemini
            sample_file.delete()
            
            # Prepare Firestore data
            db_data = {
                "analysisId": analysis_id,
                "status": "completed",
                "faceShape": analysis_data.get("faceShape"),
                "jawlineType": analysis_data.get("jawlineType"),
                "foreheadType": analysis_data.get("foreheadType"),
                "faceSymmetryScore": analysis_data.get("faceSymmetryScore"),
                "hairLength": analysis_data.get("hairLength"),
                "hairTexture": analysis_data.get("hairTexture"),
                "hairType": analysis_data.get("hairType"),
                "hairDensity": analysis_data.get("hairDensity"),
                "hairVolume": analysis_data.get("hairVolume"),
                "hairColor": analysis_data.get("hairColor"),
                "hairHealthScore": analysis_data.get("hairHealthScore"),
                "hairlineType": analysis_data.get("hairlineType"),
                "beardDensity": analysis_data.get("beardDensity"),
                "beardCompatibility": analysis_data.get("beardCompatibility"),
                "celebrityMatchSummary": analysis_data.get("celebrityMatchSummary"),
                "recommendationSummary": analysis_data.get("recommendationSummary"),
                "confidence": analysis_data.get("confidence"),
                "healthObservations": analysis_data.get("healthObservations", []),
                "bestHairstyles": analysis_data.get("bestHairstyles", []),
                "bestHairColors": analysis_data.get("bestHairColors", []),
                "bestBeardStyles": analysis_data.get("bestBeardStyles", []),
                "recommendations": analysis_data.get("recommendations", []),
                "recommendedStylesDetailed": analysis_data.get("recommendedStylesDetailed", []),
                "facialFeatureSummary": analysis_data.get("facialFeatureSummary"),
                "analyzedAt": analyzed_at,
                "analysisVersion": 2
            }
            
            # 7. Save to Firestore under 'geminiAnalysis' directly
            if db is not None:
                doc_ref = db.collection("users").document(uid).collection("geminiAnalysis").document(analysis_id)
                doc_ref.set(db_data)
                
            return GeminiAnalysisResponse(**db_data)

        except Exception as e:
            # Handle failure cases
            error_msg = str(e)
            if "429" in error_msg or "credits are depleted" in error_msg.lower() or "quota" in error_msg.lower():
                error_msg = "The AI service is currently unavailable due to high demand or billing limits. Please try again later."
            
            error_data = {
                "status": "error",
                "analysisId": analysis_id,
                "healthObservations": [f"Analysis failed: {error_msg}"],
                "analyzedAt": analyzed_at
            }
            if db is not None:
                doc_ref = db.collection("users").document(uid).collection("geminiAnalysis").document(analysis_id)
                doc_ref.set(error_data)
                
            return GeminiAnalysisResponse(**error_data)

    @staticmethod
    def get_analysis(uid: str, analysis_id: str) -> GeminiAnalysisResponse:
        if db is None:
            return GeminiAnalysisResponse(status="error", analysisId=analysis_id, healthObservations=["Firestore not initialized"])
            
        doc_ref = db.collection("users").document(uid).collection("geminiAnalysis").document(analysis_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return GeminiAnalysisResponse(status="not_found", analysisId=analysis_id)
            
        data = doc.to_dict()
        
        def parse_timestamp(ts_raw):
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
            
        return GeminiAnalysisResponse(
            status=data.get("status", "pending"),
            analysisId=data.get("analysisId", analysis_id),
            faceShape=data.get("faceShape"),
            hairLength=data.get("hairLength"),
            hairTexture=data.get("hairTexture"),
            hairType=data.get("hairType"),
            hairDensity=data.get("hairDensity"),
            hairVolume=data.get("hairVolume"),
            hairColor=data.get("hairColor"),
            confidence=data.get("confidence"),
            healthObservations=data.get("healthObservations", []),
            bestHairstyles=data.get("bestHairstyles", []),
            bestHairColors=data.get("bestHairColors", []),
            bestBeardStyles=data.get("bestBeardStyles", []),
            recommendations=data.get("recommendations", []),
            recommendedStylesDetailed=data.get("recommendedStylesDetailed", []),
            facialFeatureSummary=data.get("facialFeatureSummary"),
            analyzedAt=parse_timestamp(data.get("analyzedAt")),
            analysisVersion=data.get("analysisVersion", 1)
        )
