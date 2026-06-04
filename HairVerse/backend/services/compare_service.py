from datetime import datetime
from typing import List, Dict, Any
from firebase_config import db

class CompareService:
    @staticmethod
    def create_comparison(uid: str, hairstyle_ids: List[str], selected_images: List[str]) -> dict:
        if db is None:
            raise Exception("Database is not initialized.")
            
        compare_ref = db.collection("users").document(uid).collection("comparisons").document()
        comparison_id = compare_ref.id
        
        now = datetime.now()
        
        data = {
            "comparisonId": comparison_id,
            "hairstyleIds": hairstyle_ids,
            "selectedImages": selected_images,
            "createdAt": now,
            "updatedAt": now
        }
        
        compare_ref.set(data)
        
        return {
            "comparisonId": comparison_id,
            "status": "created"
        }
        
    @staticmethod
    def get_comparison(uid: str, comparison_id: str) -> dict:
        if db is None:
            raise Exception("Database is not initialized.")
            
        compare_ref = db.collection("users").document(uid).collection("comparisons").document(comparison_id)
        doc = compare_ref.get()
        
        if not doc.exists:
            raise Exception("Comparison not found")
            
        data = doc.to_dict()
        hairstyle_ids = data.get("hairstyleIds", [])
        
        hairstyles_details = []
        
        # Fetch each hairstyle's details from the global hairstyles collection
        for hid in hairstyle_ids:
            h_ref = db.collection("hairstyles").document(hid)
            h_doc = h_ref.get()
            if h_doc.exists:
                h_data = h_doc.to_dict()
                # Ensure the ID is attached
                h_data["hairstyleId"] = hid
                hairstyles_details.append(h_data)
                
        # Handle timestamps safely
        created_at = data.get("createdAt")
        if hasattr(created_at, 'timestamp'):
            created_at = datetime.fromtimestamp(created_at.timestamp())
            
        updated_at = data.get("updatedAt")
        if hasattr(updated_at, 'timestamp'):
            updated_at = datetime.fromtimestamp(updated_at.timestamp())

        return {
            "comparisonId": data.get("comparisonId", comparison_id),
            "hairstyles": hairstyles_details,
            "createdAt": created_at,
            "updatedAt": updated_at
        }
