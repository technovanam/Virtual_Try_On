"""
Firebase ID Token verification middleware for FastAPI.

Provides:
  - get_current_user  → FastAPI dependency that verifies Authorization: Bearer <Firebase ID token>
  - Returns dict with uid and email on success
  - Raises 401 Unauthorized on invalid/missing/expired tokens

Usage:
  @router.get("/protected")
  async def protected_route(user: dict = Depends(get_current_user)):
      return {"uid": user["uid"], "email": user["email"]}
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth as admin_auth
from firebase_config import auth_client, db

# FastAPI security scheme — extracts Bearer token from Authorization header
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict:
    """
    Verify a Firebase ID token from the Authorization header.

    Returns a dict with:
      - uid: str  — Firebase User ID
      - email: str — User email (empty string if not available)

    Raises 401 Unauthorized if:
      - Authorization header is missing
      - Token is not a valid Bearer token
      - Token is expired, revoked, or otherwise invalid
      - Firebase Admin SDK is not initialized
    """
    # 1. Check that Firebase Admin SDK is available
    if not auth_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is not initialized.",
        )

    # 2. Extract the Bearer token
    # Let's check raw headers for debugging
    from fastapi import Request
    # Wait, we don't have Request here, it's just HTTPAuthorizationCredentials. 
    # But credentials is not None means HTTPBearer successfully parsed `Bearer <token>`.
    if credentials is None:
        print("AUTH HEADER: Missing or not Bearer format")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header. Use: Authorization: Bearer <firebase_id_token>",
            headers={"WWW-Authenticate": "Bearer"},
        )

    id_token = credentials.credentials
    print(f"AUTH HEADER: Bearer {id_token[:15]}...{id_token[-10:] if id_token else ''}")
    
    if not id_token:
        print("Token is empty.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is empty.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Verify the Firebase ID token using Admin SDK
    try:
        decoded = admin_auth.verify_id_token(id_token)
        print(f"TOKEN VERIFIED: {decoded.get('uid')}")
    except admin_auth.ExpiredIdTokenError as e:
        print(f"ExpiredIdTokenError: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase ID token has expired. Sign in again to get a fresh token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except admin_auth.RevokedIdTokenError as e:
        print(f"RevokedIdTokenError: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase ID token has been revoked. Sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except admin_auth.InvalidIdTokenError as e:
        print(f"InvalidIdTokenError: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase ID token. The token is malformed or forged.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except ValueError as exc:
        print(f"ValueError during token verification: {exc}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification error: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 4. Return verified user identity
    uid = decoded.get("uid")
    email = decoded.get("email", "")

    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token does not contain a valid user ID.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "uid": uid,
        "email": email,
    }


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict | None:
    """
    Best-effort auth for endpoints that allow anonymous access.

    Returns a user dict if a valid Firebase ID token is provided,
    otherwise returns None without raising.
    """
    if credentials is None or not credentials.credentials:
        return None

    if not auth_client:
        return None

    try:
        decoded = admin_auth.verify_id_token(credentials.credentials)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase ID token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    uid = decoded.get("uid")
    email = decoded.get("email", "")
    if not uid:
        return None

    return {
        "uid": uid,
        "email": email,
    }


async def require_admin_role(
    user: dict = Depends(get_current_user),
) -> dict:
    """
    Require that the authenticated user has the admin role.

    Reads the user's Firestore document and checks the `role` field.
    Must be used AFTER `get_current_user` (it chains on the dependency).

    Raises 403 Forbidden if the user is not an admin.
    Raises 503 if Firestore is unavailable.
    """
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is not initialized.",
        )

    uid = user["uid"]

    try:
        doc_snap = db.collection("users").document(uid).get()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to check user role: {exc}",
        )

    if not doc_snap.exists:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User profile not found. Cannot verify admin status.",
        )

    data = doc_snap.to_dict()
    role = data.get("role", "user")

    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    return user
