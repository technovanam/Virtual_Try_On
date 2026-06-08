import os
import uuid
import json
from datetime import datetime
import google.generativeai as genai
from firebase_config import db
from schemas.celebrity_matches import CelebrityMatchesResponse, CelebrityMatchItem

api_key = os.getenv("GEMINI_API_KEY")
if api_key and api_key != "your_gemini_api_key_here":
    genai.configure(api_key=api_key)

class CelebrityMatchService:
    @staticmethod
    def generate_matches(uid: str, analysis_id: str = None) -> CelebrityMatchesResponse:
        generated_at = datetime.now()
        
        if not api_key or api_key == "your_gemini_api_key_here":
            raise Exception("Gemini API Key not configured")
            
        if db is None:
            raise Exception("Firestore not initialized")
            
        # Fetch Gemini Analysis
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
            
        # Fetch Face Analysis
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
            elif hasattr(obj, 'timestamp'):
                return datetime.fromtimestamp(obj.timestamp()).isoformat()
            return obj
            
        serializable_analysis = make_serializable(analysis_data)
        serializable_face_analysis = make_serializable(face_analysis_data)
        
        # Construct Prompt
        prompt = f"""
        You are an expert celebrity stylist and facial profiling AI. Based on the user's facial and hair analysis, find 3 to 5 celebrities that share similar face shapes, hair characteristics, and facial structures.
        
        DETERMINISTIC FACE MORPHOLOGY:
        {json.dumps(serializable_face_analysis, indent=2)}
        
        GEMINI VISUAL INFERENCE & HAIR ANALYSIS:
        {json.dumps(serializable_analysis, indent=2)}
        
        Respond ONLY with a valid JSON object matching the exact structure below. Do not include markdown formatting like ```json.
        For imageUrl, construct a ui-avatars URL like: https://ui-avatars.com/api/?name=First+Last&background=random
        
        {{
            "matches": [
                {{
                    "celebrityName": "string",
                    "similarityScore": "float between 0 and 1",
                    "faceShapeMatch": "string describing face shape similarities",
                    "hairstyleMatch": "string describing hairstyle similarities",
                    "reasoning": "string explaining the overall match reasoning",
                    "imageUrl": "string containing the generated ui-avatars URL"
                }}
            ]
        }}
        """
        
        # Generate content
        model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})
        response = model.generate_content(prompt)
        
        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
            
        try:
            generated_data = json.loads(raw_text)
        except json.JSONDecodeError:
            raise Exception("Failed to parse Gemini matches")
            
        matches_data = generated_data.get("matches", [])
        
        # Clear existing matches for this user (or we could just append, but replacing is cleaner for a fresh match)
        # To avoid complex batch operations in MVP, we just write them as a single document or multiple documents
        # The prompt specified users/{{uid}}/celebrityMatches collection.
        # Since we want to return a list of matches, it's easier to store them as individual documents in that collection.
        
        # Delete old matches
        old_docs = db.collection("users").document(uid).collection("celebrityMatches").stream()
        for doc in old_docs:
            doc.reference.delete()
        
        saved_matches = []
        for match in matches_data:
            match_id = str(uuid.uuid4())
            db_data = {
                "matchId": match_id,
                "celebrityName": match.get("celebrityName"),
                "similarityScore": match.get("similarityScore", 0.0),
                "faceShapeMatch": match.get("faceShapeMatch", ""),
                "hairstyleMatch": match.get("hairstyleMatch", ""),
                "reasoning": match.get("reasoning", ""),
                "imageUrl": match.get("imageUrl", f"https://ui-avatars.com/api/?name={match.get('celebrityName', 'Unknown')}&background=random"),
                "generatedAt": generated_at
            }
            db.collection("users").document(uid).collection("celebrityMatches").document(match_id).set(db_data)
            saved_matches.append(CelebrityMatchItem(**db_data))
            
        return CelebrityMatchesResponse(
            matches=saved_matches,
            generatedAt=generated_at
        )

    @staticmethod
    def get_matches(uid: str) -> CelebrityMatchesResponse:
        if db is None:
            raise Exception("Firestore not initialized")
            
        # Fetch the current matches
        docs = db.collection("users").document(uid).collection("celebrityMatches").order_by("similarityScore", direction="DESCENDING").stream()
        
        matches = []
        generated_at = None
        
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
            
        for doc in docs:
            data = doc.to_dict()
            if not generated_at:
                generated_at = parse_timestamp(data.get("generatedAt"))
                
            matches.append(
                CelebrityMatchItem(
                    matchId=data.get("matchId", doc.id),
                    celebrityName=data.get("celebrityName", ""),
                    similarityScore=data.get("similarityScore", 0.0),
                    faceShapeMatch=data.get("faceShapeMatch", ""),
                    hairstyleMatch=data.get("hairstyleMatch", ""),
                    reasoning=data.get("reasoning", ""),
                    imageUrl=data.get("imageUrl", "")
                )
            )
            
        return CelebrityMatchesResponse(
            matches=matches,
            generatedAt=generated_at or datetime.now()
        )

    @staticmethod
    def get_match(uid: str, match_id: str) -> CelebrityMatchItem:
        if db is None:
            raise Exception("Firestore not initialized")
            
        doc = db.collection("users").document(uid).collection("celebrityMatches").document(match_id).get()
        if not doc.exists:
            raise Exception("Match not found")
            
        data = doc.to_dict()
        return CelebrityMatchItem(
            matchId=data.get("matchId", doc.id),
            celebrityName=data.get("celebrityName", ""),
            similarityScore=data.get("similarityScore", 0.0),
            faceShapeMatch=data.get("faceShapeMatch", ""),
            hairstyleMatch=data.get("hairstyleMatch", ""),
            reasoning=data.get("reasoning", ""),
            imageUrl=data.get("imageUrl", "")
        )
