"""
Authentication service for HairVerse.

Provides:
  - create_user(...)     → uses Firebase Admin SDK to create Auth + Firestore records
  - authenticate_user()  → uses Firebase Identity Toolkit REST API to verify password
  - generate_token()     → produces a signed JWT for the frontend
  - verify_token()       → validates and decodes a JWT
"""

import os
import time
import jwt
import httpx
from datetime import datetime
from firebase_admin import auth as admin_auth
from firebase_config import db, auth_client

# ── Env / Config ─────────────────────────────────────────────────────────────

FIREBASE_WEB_API_KEY = os.getenv("FIREBASE_WEB_API_KEY")
JWT_SECRET = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_SECONDS = 3600  # 1 hour

_IDENTITY_TOOLKIT_URL = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword"


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


class TokenError(AuthServiceError):
    pass


# ── Startup guard ────────────────────────────────────────────────────────────

def _warn_if_missing_config():
    """Print a warning if required env vars are not set. Safe to call at import."""
    missing = []
    if not FIREBASE_WEB_API_KEY:
        missing.append("FIREBASE_WEB_API_KEY")
    if not JWT_SECRET:
        missing.append("JWT_SECRET_KEY")
    if missing:
        print(f"[AUTH SERVICE] Warning — missing env vars: {', '.join(missing)}. "
              f"Login and token operations will fail until these are set.")


_warn_if_missing_config()


def _ensure_initialized():
    """Raise 503-style error if Firebase Admin is not connected."""
    if not auth_client:
        raise AuthServiceError("Auth service not initialized", code="service_unavailable")
    if not db:
        raise AuthServiceError("Database service not initialized", code="service_unavailable")

def _ensure_jwt_secret():
    """Raise a clear error if JWT_SECRET_KEY is not configured."""
    if not JWT_SECRET:
        raise AuthServiceError(
            "JWT_SECRET_KEY environment variable is not set. "
            "Generate a secure random string and add it to the backend .env file.",
            code="server_misconfiguration",
        )


def verify_firebase_id_token(id_token: str) -> dict:
    """
    Verify a Firebase ID token using the Admin SDK.

    Returns a dict with 'uid' and 'email' from the decoded token.
    Raises AuthServiceError if the token is invalid or expired.
    """
    # 🔍 DEBUG: Log the token received (first 50 chars for safety)
    print(f"[DEBUG 🔍 verify_firebase_id_token] Called with id_token[:50]='{id_token[:50]}...' (len={len(id_token)})")
    print(f"[DEBUG 🔍 verify_firebase_id_token] auth_client is None? {auth_client is None}")
    print(f"[DEBUG 🔍 verify_firebase_id_token] db is None? {db is None}")

    # Check if Firebase Admin SDK was initialized before attempting to verify
    if auth_client is None:
        raise AuthServiceError(
            "Auth service not initialized — Firebase Admin SDK not connected. "
            "Add the service account JSON file to HairVerse/backend/ and restart the server.",
            code="service_unavailable",
        )

    try:
        print(f"[DEBUG 🔍 verify_firebase_id_token] Calling admin_auth.verify_id_token()...")
        decoded = admin_auth.verify_id_token(id_token)
        print(f"[DEBUG 🔍 verify_firebase_id_token] SUCCESS - decoded uid={decoded.get('uid')}, email={decoded.get('email')}")
        uid = decoded.get("uid")
        email = decoded.get("email", "")
        if not uid:
            raise AuthServiceError(
                "Token does not contain a valid user ID.",
                code="invalid_token",
            )
        return {"uid": uid, "email": email}
    except admin_auth.ExpiredIdTokenError:
        print(f"[DEBUG 🔍 verify_firebase_id_token] FAILED - ExpiredIdTokenError")
        raise AuthServiceError(
            "Firebase ID token has expired.",
            code="token_expired",
        )
    except (admin_auth.InvalidIdTokenError, ValueError) as exc:
        print(f"[DEBUG 🔍 verify_firebase_id_token] FAILED - InvalidIdTokenError/ValueError: {exc}")
        raise AuthServiceError(
            f"Invalid Firebase ID token: {exc}",
            code="invalid_token",
        )
    except AuthServiceError:
        # Re-raise our own exceptions directly (already handled above)
        raise
    except Exception as exc:
        print(f"[DEBUG 🔍 verify_firebase_id_token] FAILED - Unexpected exception: {type(exc).__name__}: {exc}")
        raise AuthServiceError(
            f"Token verification failed: {exc}",
            code="verification_error",
        )


def create_user_profile(uid: str, email: str, username: str) -> dict:
    """
    Create a Firestore user document for an already-authenticated Firebase user.

    This is used when the frontend creates the Firebase Auth user directly via
    the Client SDK and sends the ID token to the backend for profile creation.

    Checks that the profile doesn't already exist. Returns a dict with user
    profile fields (no token).
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
    return {
        "uid": uid,
        "email": data.get("email", ""),
        "display_name": data.get("displayName", data.get("email", uid)),
        "subscription_status": data.get("subscriptionStatus", "free"),
        "profile_completed": data.get("profileCompleted", False),
        "onboarding_completed": data.get("onboardingCompleted", False),
        "created_at": data.get("createdAt", ""),
    }


# ── Public API ───────────────────────────────────────────────────────────────

def create_user(email: str, password: str, username: str) -> dict:
    """
    Create a Firebase Auth user and a matching Firestore document.

    Returns a dict with user profile fields (no token).
    Raises UserAlreadyExists if the email is already in use.
    """
    _ensure_initialized()

    # 1. Create Firebase Auth account
    try:
        user_record = admin_auth.create_user(
            email=email,
            password=password,
            display_name=username,
        )
    except admin_auth.EmailAlreadyExistsError:
        raise UserAlreadyExists(
            "An account with this email already exists.",
            code="email_already_in_use",
        )
    except Exception as exc:
        raise AuthServiceError(
            f"Failed to create user in Firebase Auth: {exc}",
            code="auth_create_failed",
        )

    uid = user_record.uid
    now_iso = datetime.utcnow().isoformat() + "Z"

    # 2. Create Firestore document
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
        # Best-effort: if Firestore write fails, still return the user.
        # A background job or next login can fill the doc.
        print(f"[WARN] Firestore write failed for uid={uid}: {exc}")

    return {
        "uid": uid,
        "email": email,
        "display_name": username,
        "subscription_status": "free",
        "profile_completed": False,
        "onboarding_completed": False,
        "created_at": now_iso,
    }


def authenticate_user(email: str, password: str) -> dict:
    """
    Verify email + password against Firebase Identity Toolkit REST API.

    On success, returns a dict with user profile fields (no token).
    Raises InvalidCredentials on wrong email/password.
    """
    _ensure_initialized()

    if not FIREBASE_WEB_API_KEY:
        raise AuthServiceError(
            "FIREBASE_WEB_API_KEY is not configured. "
            "Add your Firebase Web API key to the backend .env file.",
            code="server_misconfiguration",
        )

    # 1. Call Firebase Identity Toolkit to verify password
    try:
        resp = httpx.post(
            _IDENTITY_TOOLKIT_URL,
            params={"key": FIREBASE_WEB_API_KEY},
            json={
                "email": email,
                "password": password,
                "returnSecureToken": True,
            },
            timeout=10,
        )
        resp.raise_for_status()
        id_data = resp.json()
    except httpx.HTTPStatusError as exc:
        # Parse Firebase REST error
        try:
            err_body = exc.response.json()
            fb_error = err_body.get("error", {}).get("message", "")
        except Exception:
            fb_error = ""
        if "EMAIL_NOT_FOUND" in fb_error or "INVALID_PASSWORD" in fb_error or "INVALID_LOGIN_CREDENTIALS" in fb_error:
            raise InvalidCredentials("Invalid email or password.", code="invalid_credentials")
        raise AuthServiceError(f"Identity Toolkit error: {fb_error}", code="auth_provider_error")
    except httpx.TimeoutException:
        raise AuthServiceError("Authentication service timed out.", code="timeout")
    except httpx.RequestError as exc:
        raise AuthServiceError(f"Network error contacting auth provider: {exc}", code="network_error")

    # 2. (Optional but recommended) Verify the returned ID token via Admin SDK
    returned_id_token = id_data.get("idToken")
    if returned_id_token:
        try:
            decoded = admin_auth.verify_id_token(returned_id_token)
            fb_uid = decoded.get("uid")
        except Exception:
            # Token verification failed — fall back to localId from REST response
            fb_uid = id_data.get("localId")
    else:
        fb_uid = id_data.get("localId")

    uid = fb_uid
    if not uid:
        raise AuthServiceError("Could not resolve user identity.", code="auth_inconsistent")

    # 3. Read (or create) Firestore document
    try:
        doc_ref = db.collection("users").document(uid)
        doc_snap = doc_ref.get()
    except Exception as exc:
        raise AuthServiceError(f"Database error: {exc}", code="db_error")

    now_iso = datetime.utcnow().isoformat() + "Z"

    if doc_snap.exists:
        data = doc_snap.to_dict()
        # Update last login timestamp
        doc_ref.set({"lastLogin": now_iso}, merge=True)
        user_profile = {
            "uid": uid,
            "email": email,
            "display_name": data.get("displayName", email),
            "subscription_status": data.get("subscriptionStatus", "free"),
            "profile_completed": data.get("profileCompleted", False),
            "onboarding_completed": data.get("onboardingCompleted", False),
            "created_at": data.get("createdAt", ""),
        }
    else:
        # Firestore doc missing — create it on the fly
        fallback_data = {
            "uid": uid,
            "email": email,
            "displayName": email,
            "createdAt": now_iso,
            "lastLogin": now_iso,
            "subscriptionStatus": "free",
            "profileCompleted": False,
            "onboardingCompleted": False,
        }
        doc_ref.set(fallback_data)
        user_profile = {
            "uid": uid,
            "email": email,
            "display_name": email,
            "subscription_status": "free",
            "profile_completed": False,
            "onboarding_completed": False,
            "created_at": now_iso,
        }

    return user_profile


# ── JWT Helpers ──────────────────────────────────────────────────────────────

def generate_token(uid: str, email: str) -> str:
    """
    Create a signed JWT access token.

    Requires JWT_SECRET_KEY to be set in the environment.
    """
    _ensure_jwt_secret()
    now = int(time.time())
    payload = {
        "uid": uid,
        "email": email,
        "iat": now,
        "exp": now + JWT_EXPIRY_SECONDS,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> dict:
    """
    Decode and validate a JWT access token.

    Returns the payload dict (uid, email, exp, iat).
    Raises TokenError if invalid or expired.
    """
    _ensure_jwt_secret()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise TokenError("Token has expired.", code="token_expired")
    except jwt.InvalidTokenError as exc:
        raise TokenError(f"Invalid token: {exc}", code="token_invalid")
