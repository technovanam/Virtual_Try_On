from datetime import datetime
from firebase_config import db

class SettingsServiceError(Exception):
    def __init__(self, message: str, code: str | None = None):
        self.message = message
        self.code = code
        super().__init__(message)

def _get_settings_ref(uid: str):
    return db.collection("users").document(uid).collection("settings").document("preferences")

def get_user_settings(uid: str) -> dict:
    """
    Retrieve user settings from Firestore. If they don't exist, return default settings.
    """
    try:
        doc_ref = _get_settings_ref(uid)
        doc_snap = doc_ref.get()
    except Exception as exc:
        raise SettingsServiceError(
            f"Failed to read settings from Firestore: {exc}",
            code="db_read_failed",
        )

    default_settings = {
        "pushNotifications": True,
        "emailNotifications": True,
        "darkMode": False,
        "analyticsConsent": True,
        "updatedAt": datetime.utcnow().isoformat() + "Z"
    }

    if not doc_snap.exists:
        # Initialize default settings if they don't exist
        try:
            doc_ref.set(default_settings)
        except Exception as exc:
            pass # Fails silently if we can't save default, we still return them
        return default_settings

    data = doc_snap.to_dict()
    
    # Merge with defaults to ensure all fields are present
    merged_settings = {**default_settings, **data}
    return merged_settings

def update_user_settings(uid: str, updates: dict) -> dict:
    """
    Update specific user settings fields in Firestore.
    """
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
    
    # Return full updated settings
    return get_user_settings(uid)
