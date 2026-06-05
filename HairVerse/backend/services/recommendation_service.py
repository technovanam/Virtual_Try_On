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
            
        # 3. Construct Prompt
        prompt = f"""
        You are an expert AI hairstylist. Based on the user's profile and their facial/hair analysis, generate personalized hairstyle recommendations.
        
        USER PROFILE:
        {json.dumps(profile_completion, indent=2)}
        
        USER FACE & HAIR ANALYSIS:
        {json.dumps(analysis_data, indent=2)}
        
        Respond ONLY with a valid JSON object matching the exact structure below. Do not include markdown formatting like ```json.
        Generate exactly 4-6 recommended hairstyles.
        
        {{
            "recommendations": [
                {{
                    "hairstyleName": "string",
                    "category": "string (e.g. Short, Medium, Long, Trendy, Classic)",
                    "suitabilityScore": 95,
                    "maintenanceLevel": "string (e.g. Low, Medium, High)",
                    "recommendationReason": "string explaining why this fits their face shape and hair type",
                    "confidenceScore": 0.95
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
            recs_list = generated_data.get("recommendations", [])
        except json.JSONDecodeError:
            raise Exception("Failed to parse Gemini recommendations")
            
        # Delete existing recommendations to replace with new ones
        existing_docs = db.collection("users").document(uid).collection("recommendations").stream()
        for doc in existing_docs:
            doc.reference.delete()

        # 5. Save to Firestore
        recommendations = []
        for rec in recs_list:
            rec_id = str(uuid.uuid4())
            db_data = {
                "recommendationId": rec_id,
                "hairstyleName": rec.get("hairstyleName", ""),
                "category": rec.get("category", ""),
                "suitabilityScore": int(rec.get("suitabilityScore", 0)),
                "maintenanceLevel": rec.get("maintenanceLevel", ""),
                "recommendationReason": rec.get("recommendationReason", ""),
                "confidenceScore": float(rec.get("confidenceScore", 0.0)),
                "generatedAt": generated_at
            }
            db.collection("users").document(uid).collection("recommendations").document(rec_id).set(db_data)
            recommendations.append(db_data)
            
        return RecommendationListResponse(recommendations=recommendations)

    @staticmethod
    def get_recommendations(uid: str) -> RecommendationListResponse:
        if db is None:
            raise Exception("Firestore not initialized")
            
        # Fetch all current recommendations
        docs = db.collection("users").document(uid).collection("recommendations").order_by("suitabilityScore", direction="DESCENDING").stream()
        
        recommendations = []
        for doc in docs:
            rec_data = doc.to_dict()
            rec_data["generatedAt"] = RecommendationService._parse_timestamp(rec_data.get("generatedAt"))
            recommendations.append(rec_data)
            
        return RecommendationListResponse(recommendations=recommendations)
        
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
