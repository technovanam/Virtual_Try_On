"""
Authentication service for HairVerse.

Provides:
  - create_user_profile(...)  → Creates a Firestore document for an authenticated Firebase user
  - get_user_profile(...)     → Reads a Firestore document for an authenticated Firebase user
"""

from datetime import datetime
from firebase_config import db, auth_client

# ── Exceptions ───────────────────────────────────────────────────────────────

class AuthServiceError(Exception):
    """Base exception for auth-service failures."""
    def __init__(self, message: str, code: str | None = None):
        self.message = message
        self.code = code
        super().__init__(message)

class UserAlreadyExists(AuthServiceError):
    pass

class InvalidCredentials(AuthServiceError):
    pass

# ── Startup guard ────────────────────────────────────────────────────────────

def _ensure_initialized():
    """Raise 503-style error if Firebase Admin is not connected."""
    if not auth_client:
        raise AuthServiceError("Auth service not initialized", code="service_unavailable")
    if not db:
        raise AuthServiceError("Database service not initialized", code="service_unavailable")

# ── Public API ───────────────────────────────────────────────────────────────

def create_user_profile(uid: str, email: str, username: str) -> dict:
    """
    Create a Firestore user document for an already-authenticated Firebase user.

    This is used when the frontend creates the Firebase Auth user directly via
    the Client SDK and sends the ID token to the backend for profile creation.

    Checks that the profile doesn't already exist. Returns a dict with user
    profile fields.
    """
    _ensure_initialized()

    now_iso = datetime.utcnow().isoformat() + "Z"

    # Check if profile already exists
    try:
        existing = db.collection("users").document(uid).get()
        if existing.exists:
            raise AuthServiceError(
                "User profile already exists.",
                code="profile_already_exists",
            )
    except AuthServiceError:
        raise
    except Exception as exc:
        raise AuthServiceError(
            f"Failed to check existing profile: {exc}",
            code="db_read_failed",
        )

    # Create Firestore document
    user_data = {
        "uid": uid,
        "email": email,
        "displayName": username,
        "createdAt": now_iso,
        "lastLogin": now_iso,
        "subscriptionStatus": "free",
        "profileCompleted": False,
        "onboardingCompleted": False,
    }

    try:
        db.collection("users").document(uid).set(user_data)
    except Exception as exc:
        raise AuthServiceError(
            f"Failed to create user profile in Firestore: {exc}",
            code="db_write_failed",
        )

    return {
        "uid": uid,
        "email": email,
        "display_name": username,
        "subscription_status": "free",
        "profile_completed": False,
        "onboarding_completed": False,
        "created_at": now_iso,
    }

def get_user_profile(uid: str) -> dict:
    """
    Read a user profile from Firestore for an already-authenticated Firebase user.

    Returns a dict with user profile fields.
    Raises AuthServiceError if the document is missing or the read fails.
    """
    _ensure_initialized()

    try:
        doc_ref = db.collection("users").document(uid)
        doc_snap = doc_ref.get()
    except Exception as exc:
        raise AuthServiceError(
            f"Failed to read user profile from Firestore: {exc}",
            code="db_read_failed",
        )

    if not doc_snap.exists:
        raise AuthServiceError(
            "User profile not found in Firestore.",
            code="profile_not_found",
        )

    data = doc_snap.to_dict()
    
    # Update last login asynchronously
    import threading
    now_iso = datetime.utcnow().isoformat() + "Z"
    def update_last_login():
        try:
            doc_ref.set({"lastLogin": now_iso}, merge=True)
        except:
            pass
    threading.Thread(target=update_last_login, daemon=True).start()

    return {
        "uid": uid,
        "email": data.get("email", ""),
        "display_name": data.get("displayName") or data.get("email") or "User",
        "subscription_status": data.get("subscriptionStatus", "free"),
        "profile_completed": data.get("profileCompleted", False),
        "onboarding_completed": data.get("onboardingCompleted", False),
        "profileCompletion": data.get("profileCompletion", None),
        "onboarding_version": data.get("onboardingVersion", None),
        "onboarding_completed_at": str(data.get("onboardingCompletedAt")) if data.get("onboardingCompletedAt") else None,
        "created_at": data.get("createdAt", ""),
    }

def check_email_exists(email: str) -> bool:
    """
    Check if a user with the given email exists in Firebase Authentication.
    """
    if not auth_client:
        return False
    try:
        auth_client.get_user_by_email(email)
        return True
    except auth_client.UserNotFoundError:
        return False
    except Exception as exc:
        print(f"[check_email_exists] Error checking email: {exc}")
        return False

def create_completed_user_profile(uid: str, email: str, username: str, profile_data: dict) -> dict:
    """
    Create a completed Firestore user document for a newly-registered user.
    """
    _ensure_initialized()

    now_iso = datetime.utcnow().isoformat() + "Z"

    # Check if profile already exists
    try:
        existing = db.collection("users").document(uid).get()
        if existing.exists:
            raise AuthServiceError(
                "User profile already exists.",
                code="profile_already_exists",
            )
    except AuthServiceError:
        raise
    except Exception as exc:
        raise AuthServiceError(
            f"Failed to check existing profile: {exc}",
            code="db_read_failed",
        )

    # Create Firestore document
    user_data = {
        "uid": uid,
        "email": email,
        "displayName": username,
        "createdAt": now_iso,
        "lastLogin": now_iso,
        "subscriptionStatus": "free",
        "profileCompleted": True,
        "onboardingCompleted": False,
        "profileCompletion": profile_data,
    }

    try:
        db.collection("users").document(uid).set(user_data)
    except Exception as exc:
        raise AuthServiceError(
            f"Failed to create completed user profile in Firestore: {exc}",
            code="db_write_failed",
        )

    return {
        "uid": uid,
        "email": email,
        "display_name": username,
        "subscription_status": "free",
        "profile_completed": True,
        "onboarding_completed": False,
        "profileCompletion": profile_data,
        "created_at": now_iso,
    }
