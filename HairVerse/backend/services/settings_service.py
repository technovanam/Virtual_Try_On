from datetime import datetime
from firebase_config import db

class SettingsServiceError(Exception):
    def __init__(self, message: str, code: str | None = None):
        self.message = message
        self.code = code
        super().__init__(message)

def _get_settings_ref(uid: str):
    return db.collection("users").document(uid).collection("settings").document("preferences")

def _get_default_settings():
    return {
        "language": "English",
        "theme": "System",
        "notificationsEnabled": True,
        "trendNotifications": True,
        "recommendationNotifications": True,
        "haircareNotifications": True,
        "autoDeleteSelfies": False,
        "biometricEnabled": False,
        "personalizedRecommendations": True,
        "celebritySuggestions": True,
        "accessibilityOptions": {
            "largerText": False,
            "highContrast": False,
            "reducedMotion": False
        },
        "pushNotifications": True,
        "emailNotifications": True,
        "darkMode": False,
        "analyticsConsent": True,
        "updatedAt": datetime.utcnow().isoformat() + "Z"
    }

def get_user_settings(uid: str) -> dict:
    try:
        doc_ref = _get_settings_ref(uid)
        doc_snap = doc_ref.get()
    except Exception as exc:
        raise SettingsServiceError(
            f"Failed to read settings from Firestore: {exc}",
            code="db_read_failed",
        )

    default_settings = _get_default_settings()

    if not doc_snap.exists:
        try:
            doc_ref.set(default_settings)
        except Exception:
            pass 
        return default_settings

    data = doc_snap.to_dict()
    
    # Merge nested dictionaries carefully
    merged_settings = {**default_settings, **data}
    if "accessibilityOptions" in data and isinstance(data["accessibilityOptions"], dict):
        merged_settings["accessibilityOptions"] = {
            **default_settings["accessibilityOptions"],
            **data["accessibilityOptions"]
        }
        
    return merged_settings

def update_user_settings(uid: str, updates: dict) -> dict:
    now_iso = datetime.utcnow().isoformat() + "Z"
    updates["updatedAt"] = now_iso
    
    try:
        doc_ref = _get_settings_ref(uid)
        doc_ref.set(updates, merge=True)
    except Exception as exc:
        raise SettingsServiceError(
            f"Failed to update settings in Firestore: {exc}",
            code="db_write_failed",
        )
    
    return get_user_settings(uid)

def reset_user_settings(uid: str) -> dict:
    default_settings = _get_default_settings()
    try:
        doc_ref = _get_settings_ref(uid)
        doc_ref.set(default_settings)
    except Exception as exc:
        raise SettingsServiceError(
            f"Failed to reset settings in Firestore: {exc}",
            code="db_write_failed",
        )
    
    return default_settings
