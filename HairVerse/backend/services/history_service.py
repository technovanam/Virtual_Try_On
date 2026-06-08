from typing import List, Optional, Dict, Any
from firebase_config import db
from datetime import datetime, timezone
from schemas.history_schemas import TimelineResponse, TimelineEvent
from google.cloud import firestore

def parse_timestamp(ts_raw) -> datetime:
    if not ts_raw:
        return datetime.now(timezone.utc)
    ts = datetime.now(timezone.utc)
    if hasattr(ts_raw, 'timestamp'):
        ts = datetime.fromtimestamp(ts_raw.timestamp(), tz=timezone.utc)
    elif isinstance(ts_raw, str):
        try:
            ts = datetime.fromisoformat(ts_raw.replace('Z', '+00:00'))
        except ValueError:
            pass
    return ts

class HistoryService:
    @staticmethod
    def get_recent_history(uid: str) -> dict:
        if db is None:
            return {"items": [], "total": 0}
            
        try:
            sessions_ref = db.collection("users").document(uid).collection("tryons")
            docs = sessions_ref.order_by("createdAt", direction="DESCENDING").limit(20).stream()
            
            items = []
            for doc in docs:
                data = doc.to_dict()
                if data.get("status") != "completed":
                    continue
                
                created_at = parse_timestamp(data.get("createdAt"))
                hairstyle_id = data.get("hairstyleId", "unknown")
                
                hairstyle_name = "Unknown Style"
                hairstyle_category = "General"
                
                if hairstyle_id != "unknown":
                    try:
                        hs_doc = db.collection("hairstyles").document(hairstyle_id).get()
                        if hs_doc.exists:
                            hs_data = hs_doc.to_dict()
                            hairstyle_name = hs_data.get("name", "Unknown Style")
                            hairstyle_category = hs_data.get("category", "General")
                    except Exception:
                        pass
                
                items.append({
                    "historyId": data.get("tryOnId", doc.id),
                    "hairstyleId": hairstyle_id,
                    "hairstyleName": hairstyle_name,
                    "hairstyleCategory": hairstyle_category,
                    "tryOnImage": data.get("resultImage") or data.get("uploadedImage"),
                    "createdAt": created_at.isoformat()
                })
                
            return {"items": items, "total": len(items)}
            
        except Exception as e:
            print(f"[ERROR] Failed to fetch History for uid {uid}: {e}")
            raise e

    @staticmethod
    def get_timeline(uid: str, cursor: Optional[str] = None, filter_type: Optional[str] = None, limit: int = 20) -> TimelineResponse:
        if db is None:
            raise Exception("Firestore not initialized")
            
        cursor_dt = None
        if cursor:
            try:
                cursor_dt = datetime.fromisoformat(cursor.replace('Z', '+00:00'))
            except ValueError:
                pass
                
        events: List[TimelineEvent] = []
        
        # Collection configurations
        configs = [
            {"coll": "selfies", "type": "selfie_upload", "date_field": "uploadedAt", "title": "Uploaded Selfie", "desc": "Added a new selfie", "img": "imageUrl", "id": "imageId"},
            {"coll": "geminiAnalysis", "type": "analysis", "date_field": "analyzedAt", "title": "Face & Hair Analysis", "desc": "Completed AI analysis", "img": None, "id": "analysisId"},
            {"coll": "recommendations", "type": "recommendation", "date_field": "createdAt", "title": "Style Recommendations", "desc": "Received AI recommendations", "img": None, "id": "recommendationId"},
            {"coll": "celebrityMatches", "type": "celebrity_match", "date_field": "generatedAt", "title": "Celebrity Match", "desc": "Found your celebrity lookalikes", "img": "imageUrl", "id": "matchId"},
            {"coll": "tryons", "type": "tryon", "date_field": "createdAt", "title": "Virtual Try-On", "desc": "Tried on a new hairstyle", "img": "resultImage", "id": "tryOnId"},
            {"coll": "saved", "type": "saved_style", "date_field": "createdAt", "title": "Saved Style", "desc": "Saved to your collections", "img": "imageUrl", "id": "savedId"},
            {"coll": "comparisons", "type": "comparison", "date_field": "createdAt", "title": "Comparison", "desc": "Compared hairstyles", "img": None, "id": "comparisonId"},
        ]
        
        if filter_type and filter_type.lower() != "all":
            configs = [c for c in configs if c["type"].lower() == filter_type.lower()]
            
        for config in configs:
            query = db.collection("users").document(uid).collection(config["coll"])
            query = query.order_by(config["date_field"], direction=firestore.Query.DESCENDING)
            
            if cursor_dt:
                query = query.where(config["date_field"], "<", cursor_dt)
                
            query = query.limit(limit)
            
            docs = query.stream()
            for doc in docs:
                data = doc.to_dict()
                created_at = parse_timestamp(data.get(config["date_field"]))
                
                img_url = None
                if config["img"]:
                    img_url = data.get(config["img"])
                
                title = config["title"]
                if config["type"] == "saved_style" and data.get("title"):
                    title = f"Saved: {data.get('title')}"
                elif config["type"] == "celebrity_match" and data.get("celebrityName"):
                    title = f"Matched with {data.get('celebrityName')}"
                    
                event_id = f"{config['type']}_{data.get(config['id'], doc.id)}"
                
                events.append(TimelineEvent(
                    eventId=event_id,
                    eventType=config["type"],
                    title=title,
                    description=config["desc"],
                    imageUrl=img_url,
                    referenceId=data.get(config['id'], doc.id),
                    createdAt=created_at
                ))
                
        events.sort(key=lambda x: x.createdAt, reverse=True)
        events = events[:limit]
        
        next_cursor = None
        if len(events) == limit:
            next_cursor = events[-1].createdAt.isoformat()
            
        return TimelineResponse(events=events, nextCursor=next_cursor)

    @staticmethod
    def get_timeline_event(uid: str, event_id: str) -> TimelineEvent:
        if db is None:
            raise Exception("Firestore not initialized")
            
        parts = event_id.split("_", 1)
        if len(parts) != 2:
            raise Exception("Invalid event ID format")
            
        event_type, reference_id = parts[0], parts[1]
        
        configs = [
            {"coll": "selfies", "type": "selfie_upload", "date_field": "uploadedAt", "title": "Uploaded Selfie", "desc": "Added a new selfie", "img": "imageUrl", "id": "imageId"},
            {"coll": "geminiAnalysis", "type": "analysis", "date_field": "analyzedAt", "title": "Face & Hair Analysis", "desc": "Completed AI analysis", "img": None, "id": "analysisId"},
            {"coll": "recommendations", "type": "recommendation", "date_field": "createdAt", "title": "Style Recommendations", "desc": "Received AI recommendations", "img": None, "id": "recommendationId"},
            {"coll": "celebrityMatches", "type": "celebrity_match", "date_field": "generatedAt", "title": "Celebrity Match", "desc": "Found your celebrity lookalikes", "img": "imageUrl", "id": "matchId"},
            {"coll": "tryons", "type": "tryon", "date_field": "createdAt", "title": "Virtual Try-On", "desc": "Tried on a new hairstyle", "img": "resultImage", "id": "tryOnId"},
            {"coll": "saved", "type": "saved_style", "date_field": "createdAt", "title": "Saved Style", "desc": "Saved to your collections", "img": "imageUrl", "id": "savedId"},
            {"coll": "comparisons", "type": "comparison", "date_field": "createdAt", "title": "Comparison", "desc": "Compared hairstyles", "img": None, "id": "comparisonId"},
        ]
        
        config = next((c for c in configs if c["type"] == event_type), None)
        if not config:
            raise Exception("Invalid event type")
            
        doc_ref = db.collection("users").document(uid).collection(config["coll"]).document(reference_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise Exception("Event not found")
            
        data = doc.to_dict()
        created_at = parse_timestamp(data.get(config["date_field"]))
        
        img_url = data.get(config["img"]) if config["img"] else None
        title = config["title"]
        if config["type"] == "saved_style" and data.get("title"):
            title = f"Saved: {data.get('title')}"
        elif config["type"] == "celebrity_match" and data.get("celebrityName"):
            title = f"Matched with {data.get('celebrityName')}"
            
        return TimelineEvent(
            eventId=event_id,
            eventType=config["type"],
            title=title,
            description=config["desc"],
            imageUrl=img_url,
            referenceId=reference_id,
            createdAt=created_at
        )

    @staticmethod
    def delete_timeline_event(uid: str, event_id: str) -> bool:
        if db is None:
            raise Exception("Firestore not initialized")
            
        parts = event_id.split("_", 1)
        if len(parts) != 2:
            return False
            
        event_type, reference_id = parts[0], parts[1]
        
        collections_map = {
            "selfie_upload": "selfies",
            "analysis": "geminiAnalysis",
            "recommendation": "recommendations",
            "celebrity_match": "celebrityMatches",
            "tryon": "tryons",
            "saved_style": "saved",
            "comparison": "comparisons"
        }
        
        coll = collections_map.get(event_type)
        if not coll:
            return False
            
        doc_ref = db.collection("users").document(uid).collection(coll).document(reference_id)
        doc = doc_ref.get()
        if not doc.exists:
            return False
            
        doc_ref.delete()
        return True
