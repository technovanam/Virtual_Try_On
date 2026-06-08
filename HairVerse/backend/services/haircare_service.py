import os
import json
import uuid
from datetime import datetime, timezone
import google.generativeai as genai
from firebase_config import db
from schemas.haircare import HairCareResponse, HairCareSuggestion
from dotenv import load_dotenv
from fastapi import HTTPException

# Ensure environment variables are loaded
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"))

api_key = os.getenv("GEMINI_API_KEY")
if api_key and api_key != "your_gemini_api_key_here":
    genai.configure(api_key=api_key)

class HairCareService:
    @staticmethod
    def _fetch_latest_data(uid: str):
        if db is None:
            raise HTTPException(status_code=500, detail="Firebase DB not initialized")

        # Fetch profile
        profile_doc = db.collection("users").document(uid).collection("profile").document("data").get()
        profile_data = profile_doc.to_dict() if profile_doc.exists else {}

        # Fetch latest hair analysis
        analysis_ref = db.collection("users").document(uid).collection("hairAnalysis").order_by(
            "analyzedAt", direction="DESCENDING"
        ).limit(1).get()
        analysis_data = analysis_ref[0].to_dict() if analysis_ref else {}

        # Fetch latest gemini analysis
        gemini_ref = db.collection("users").document(uid).collection("geminiAnalysis").order_by(
            "analyzedAt", direction="DESCENDING"
        ).limit(1).get()
        gemini_data = gemini_ref[0].to_dict() if gemini_ref else {}

        return profile_data, analysis_data, gemini_data

    @staticmethod
    def generate_suggestions(uid: str) -> HairCareResponse:
        if not api_key or api_key == "your_gemini_api_key_here":
            raise HTTPException(status_code=500, detail="Gemini API Key not configured")

        profile_data, analysis_data, gemini_data = HairCareService._fetch_latest_data(uid)

        # Build context for Gemini
        context = {
            "profile": {
                "hairGoals": profile_data.get("hairGoals", []),
                "hairConcerns": profile_data.get("hairConcerns", []),
                "gender": profile_data.get("gender"),
                "lifestyle": profile_data.get("lifestyle"),
                "budget": profile_data.get("budget")
            },
            "hairAnalysis": {
                "density": analysis_data.get("density"),
                "thickness": analysis_data.get("thickness"),
                "length": analysis_data.get("length"),
                "texture": analysis_data.get("texture"),
                "healthScore": analysis_data.get("healthScore"),
                "hairlineType": analysis_data.get("hairlineType")
            },
            "geminiAnalysis": {
                "faceShape": gemini_data.get("faceShape"),
                "healthObservations": gemini_data.get("healthObservations", [])
            }
        }

        # Configure Gemini Model
        model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})
        
        # Convert datetime to string for JSON serialization
        def make_serializable(obj):
            if isinstance(obj, dict):
                return {k: make_serializable(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [make_serializable(v) for v in obj]
            elif hasattr(obj, 'timestamp'):
                return datetime.fromtimestamp(obj.timestamp()).isoformat()
            return obj
            
        serializable_context = make_serializable(context)
        
        prompt = f"""
        You are an expert AI hair care professional. Based on the user's data provided below, generate a highly personalized, actionable hair care and growth plan.
        Do NOT provide generic tips (e.g. "drink water", "use conditioner"). Every single suggestion must directly relate to their specific profile, analysis, or goals.

        User Context:
        {json.dumps(serializable_context, indent=2)}

        Categories must include (but are not limited to): 
        - Hair Growth
        - Hair Fall Control
        - Hair Health
        - Hair Care Routine
        - Styling Advice
        - Nutrition Tips

        Respond ONLY with a valid JSON array of objects representing each suggestion.
        Format for each object:
        {{
            "title": "string (Specific, catchy title)",
            "description": "string (Detailed, personalized actionable advice. Max 3 sentences)",
            "category": "string (One of the categories above)",
            "priority": "string (High, Medium, Low)",
            "confidence": "number between 0 and 1"
        }}
        """

        try:
            response = model.generate_content(prompt)
            raw_text = response.text.strip()
            
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
                
            suggestions_data = json.loads(raw_text)
            
            now = datetime.now(timezone.utc)
            formatted_suggestions = []
            
            # Save suggestions to Firestore and structure response
            batch = db.batch()
            collection_ref = db.collection("users").document(uid).collection("haircareSuggestions")
            
            # Clear old suggestions (optional, but good for "refreshing" entirely)
            old_docs = collection_ref.get()
            for doc in old_docs:
                batch.delete(doc.reference)
            
            for item in suggestions_data:
                suggestion_id = str(uuid.uuid4())
                s_data = {
                    "suggestionId": suggestion_id,
                    "title": item.get("title", "Suggestion"),
                    "description": item.get("description", ""),
                    "category": item.get("category", "General"),
                    "priority": item.get("priority", "Medium"),
                    "confidence": float(item.get("confidence", 0.8)),
                    "generatedAt": now
                }
                
                doc_ref = collection_ref.document(suggestion_id)
                batch.set(doc_ref, s_data)
                
                formatted_suggestions.append(HairCareSuggestion(**s_data))
                
            batch.commit()
            
            return HairCareResponse(
                status="success",
                suggestions=formatted_suggestions,
                generatedAt=now
            )
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate suggestions: {str(e)}")

    @staticmethod
    def get_suggestions(uid: str) -> HairCareResponse:
        if db is None:
            raise HTTPException(status_code=500, detail="Firebase DB not initialized")
            
        collection_ref = db.collection("users").document(uid).collection("haircareSuggestions")
        docs = collection_ref.order_by("priority").get()
        
        if not docs:
            return HairCareResponse(status="empty", suggestions=[], generatedAt=datetime.now(timezone.utc))
            
        suggestions = []
        latest_time = None
        
        for doc in docs:
            data = doc.to_dict()
            gen_at = data.get("generatedAt")
            if not latest_time or (gen_at and gen_at > latest_time):
                latest_time = gen_at
                
            suggestions.append(
                HairCareSuggestion(
                    suggestionId=data.get("suggestionId"),
                    title=data.get("title"),
                    description=data.get("description"),
                    category=data.get("category"),
                    priority=data.get("priority"),
                    confidence=data.get("confidence"),
                    generatedAt=gen_at or datetime.now(timezone.utc)
                )
            )
            
        return HairCareResponse(
            status="success",
            suggestions=suggestions,
            generatedAt=latest_time or datetime.now(timezone.utc)
        )
