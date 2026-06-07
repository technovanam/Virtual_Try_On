import os
import uuid
import json
from datetime import datetime
import google.generativeai as genai
from firebase_config import db
from schemas.recommendations import Recommendation, RecommendationListResponse
from services.auth_service import get_user_profile

api_key = os.getenv("GEMINI_API_KEY")
if api_key and api_key != "your_gemini_api_key_here":
    genai.configure(api_key=api_key)

class RecommendationService:
    @staticmethod
    def generate_recommendations(uid: str, analysis_id: str = None) -> RecommendationListResponse:
        generated_at = datetime.now()
        
        if not api_key or api_key == "your_gemini_api_key_here":
            raise Exception("Gemini API Key not configured")
            
        if db is None:
            raise Exception("Firestore not initialized")
            
        # 1. Fetch User Profile
        try:
            profile_data = get_user_profile(uid)
            profile_completion = profile_data.get("profileCompletion") or {}
        except Exception:
            profile_completion = {}
            
        # 2. Fetch Gemini Analysis
        analysis_data = {}
        if analysis_id:
            analysis_doc = db.collection("users").document(uid).collection("geminiAnalysis").document(analysis_id).get()
            if analysis_doc.exists:
                analysis_data = analysis_doc.to_dict()
        else:
            # Get latest
            analyses = db.collection("users").document(uid).collection("geminiAnalysis").order_by("analyzedAt", direction="DESCENDING").limit(1).stream()
            for doc in analyses:
                analysis_data = doc.to_dict()
                break
                
        if not analysis_data:
            raise Exception("No Gemini Analysis found for the user. Please run analysis first.")
            
        # 3. Fetch Face Analysis
        face_analysis_data = {}
        faces = db.collection("users").document(uid).collection("faceAnalysis").order_by("analyzedAt", direction="DESCENDING").limit(1).stream()
        for doc in faces:
            face_analysis_data = doc.to_dict()
            break
            
        # Convert datetime to string for JSON serialization
        def make_serializable(obj):
            if isinstance(obj, dict):
                return {k: make_serializable(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [make_serializable(v) for v in obj]
            elif hasattr(obj, 'timestamp'): # Handles DatetimeWithNanoseconds
                return datetime.fromtimestamp(obj.timestamp()).isoformat()
            return obj
            
        serializable_profile = make_serializable(profile_completion)
        serializable_analysis = make_serializable(analysis_data)
        serializable_face_analysis = make_serializable(face_analysis_data)
        
        prompt = f"""
        You are an expert AI hairstylist. Based on the user's profile and their facial/hair analysis, generate comprehensive and personalized hairstyle recommendations.
        
        USER PROFILE:
        {json.dumps(serializable_profile, indent=2)}
        
        DETERMINISTIC FACE MORPHOLOGY:
        {json.dumps(serializable_face_analysis, indent=2)}
        
        GEMINI VISUAL INFERENCE & HAIR ANALYSIS:
        {json.dumps(serializable_analysis, indent=2)}
        
        Respond ONLY with a valid JSON object matching the exact structure below. Do not include markdown formatting like ```json.
        Generate a summary, 4-6 recommended hairstyles, 3 hair colors, 3 beard styles (if male, otherwise empty), 3 celebrity matches, and 3 trending matches.
        
        {{
            "summary": "A personalized 2-3 sentence overview of why these styles work for their specific face shape and features.",
            "recommendations": [
                {{
                    "hairstyleName": "string",
                    "category": "string (e.g. Short, Medium, Long, Trendy, Classic)",
                    "suitabilityScore": 95,
                    "maintenanceLevel": "string (e.g. Low, Medium, High)",
                    "recommendationReason": "string explaining why this fits their face shape and hair type",
                    "confidenceScore": 0.95
                }}
            ],
            "hairColors": [
                {{
                    "colorName": "string",
                    "hexCode": "string (e.g. #4A3B32)",
                    "reason": "string"
                }}
            ],
            "beards": [
                {{
                    "beardStyle": "string",
                    "reason": "string",
                    "maintenanceLevel": "string"
                }}
            ],
            "celebrities": [
                {{
                    "celebrityName": "string",
                    "matchScore": 90,
                    "reason": "string"
                }}
            ],
            "trending": [
                {{
                    "styleName": "string",
                    "trendReason": "string"
                }}
            ]
        }}
        """
        
        # 4. Generate content
        model = genai.GenerativeModel('gemini-1.5-flash', generation_config={"response_mime_type": "application/json"})
        response = model.generate_content(prompt)
        
        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
            
        try:
            generated_data = json.loads(raw_text)
            # Add IDs to recommendations
            recs_list = generated_data.get("recommendations", [])
            for rec in recs_list:
                rec["recommendationId"] = str(uuid.uuid4())
            generated_data["recommendations"] = recs_list
        except json.JSONDecodeError:
            raise Exception("Failed to parse Gemini recommendations")
            
        # 5. Save to Firestore
        generated_data["generatedAt"] = generated_at
        
        db.collection("users").document(uid).collection("recommendation_reports").document("latest").set(generated_data)
        
        return RecommendationListResponse(**generated_data)

    @staticmethod
    def get_recommendations(uid: str) -> RecommendationListResponse:
        if db is None:
            raise Exception("Firestore not initialized")
            
        doc = db.collection("users").document(uid).collection("recommendation_reports").document("latest").get()
        if not doc.exists:
            return RecommendationListResponse(summary="", recommendations=[], hairColors=[], beards=[], celebrities=[], trending=[])
            
        data = doc.to_dict()
        data["generatedAt"] = RecommendationService._parse_timestamp(data.get("generatedAt"))
            
        return RecommendationListResponse(**data)
        
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
