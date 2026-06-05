import os
import uuid
import json
import requests
import tempfile
from datetime import datetime, timezone
from typing import List, Dict, Any
from firebase_config import db
from schemas.compare_schemas import CompareCreateRequest, Comparison, CompareResponse, CompareListResponse
import google.generativeai as genai
from fastapi import HTTPException
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"))

api_key = os.getenv("GEMINI_API_KEY")
if api_key and api_key != "your_gemini_api_key_here":
    genai.configure(api_key=api_key)

class CompareService:
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
    def get_all(uid: str) -> CompareListResponse:
        if db is None:
            return CompareListResponse(comparisons=[])
            
        try:
            compare_ref = db.collection("users").document(uid).collection("comparisons")
            docs = compare_ref.order_by("createdAt", direction="DESCENDING").limit(20).stream()
            
            comparisons = []
            for doc in docs:
                data = doc.to_dict()
                data['createdAt'] = CompareService._parse_timestamp(data.get('createdAt'))
                data['updatedAt'] = CompareService._parse_timestamp(data.get('updatedAt'))
                comparisons.append(Comparison(**data))
                
            return CompareListResponse(comparisons=comparisons)
        except Exception as e:
            print(f"[ERROR] get_all comparisons: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def get_by_id(uid: str, comparison_id: str) -> CompareResponse:
        if db is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
            
        doc_ref = db.collection("users").document(uid).collection("comparisons").document(comparison_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Comparison not found")
            
        data = doc.to_dict()
        data['createdAt'] = CompareService._parse_timestamp(data.get('createdAt'))
        data['updatedAt'] = CompareService._parse_timestamp(data.get('updatedAt'))
        
        return CompareResponse(status="success", comparison=Comparison(**data))

    @staticmethod
    def delete_comparison(uid: str, comparison_id: str) -> dict:
        if db is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
            
        doc_ref = db.collection("users").document(uid).collection("comparisons").document(comparison_id)
        if not doc_ref.get().exists:
            raise HTTPException(status_code=404, detail="Comparison not found")
            
        doc_ref.delete()
        return {"status": "deleted"}

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
    def create_comparison(uid: str, request: CompareCreateRequest) -> CompareResponse:
        if db is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
            
        if not api_key or api_key == "your_gemini_api_key_here":
            raise HTTPException(status_code=500, detail="Gemini API Key not configured")

        try:
            comparison_id = str(uuid.uuid4())
            now = datetime.now(timezone.utc)
            
            # Download and upload images to Gemini
            gemini_files = []
            tmp_paths = []
            item_mapping = {}
            
            for idx, item in enumerate(request.items):
                path = CompareService._download_image(item.imageUrl)
                tmp_paths.append(path)
                g_file = genai.upload_file(path=path)
                gemini_files.append(g_file)
                # Map the order to the item ID
                item_mapping[f"Image {idx+1}"] = item.id

            model = genai.GenerativeModel('gemini-1.5-pro', generation_config={"response_mime_type": "application/json"})
            
            prompt = f"""
            Analyze the following {len(request.items)} images. The user is doing a {request.comparisonType}.
            You must evaluate the suitability of these styles on the user.
            
            Image Mapping:
            """
            for key, val in item_mapping.items():
                prompt += f"- {key}: Represents item {val}\n"
                
            prompt += """
            Return ONLY a valid JSON object matching exactly:
            {
                "bestStyleId": "string (the exact item ID of the best style)",
                "recommendationReason": "string (Why this is the winner)",
                "scores": [
                    {
                        "itemId": "string (exact item ID)",
                        "score": 85,
                        "pros": ["string", "string"],
                        "cons": ["string"]
                    }
                ]
            }
            Make sure to return an entry in "scores" for EVERY item.
            """
            
            # Combine files and prompt
            contents = gemini_files + [prompt]
            response = model.generate_content(contents)
            
            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
                
            ai_panel_data = json.loads(raw_text)
            
            # Cleanup
            for p in tmp_paths:
                os.remove(p)
            for gf in gemini_files:
                gf.delete()
                
            # Prepare DB document
            items_dicts = [i.model_dump() for i in request.items]
            
            data = {
                "comparisonId": comparison_id,
                "comparisonType": request.comparisonType,
                "comparedItems": items_dicts,
                "aiPanel": ai_panel_data,
                "selectedWinner": None,
                "createdAt": now,
                "updatedAt": now
            }
            
            db.collection("users").document(uid).collection("comparisons").document(comparison_id).set(data)
            
            comparison = Comparison(**data)
            return CompareResponse(status="success", comparison=comparison)
            
        except Exception as e:
            print(f"[ERROR] Failed to create comparison: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create comparison: {str(e)}")
