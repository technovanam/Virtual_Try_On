"""
Authentication routes for HairVerse.

GET /auth/profile            — Fetch user profile
POST /auth/register-profile  — Create Firestore profile after Firebase Auth signup
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from schemas.auth_schemas import (
    RegisterProfileRequest,
    ProfileCompletionRequest,
    ProfileUpdateRequest,
    UserResponse,
    FirebaseUserResponse,
    ErrorResponse,
)
from services.auth_service import (
    create_user_profile,
    get_user_profile,
    AuthServiceError,
    UserAlreadyExists,
    InvalidCredentials,
)
from middleware.auth_middleware import get_current_user

router = APIRouter()

# ── Exception handler ────────────────────────────────────────────────────────

def _handle_auth_error(exc: AuthServiceError) -> HTTPException:
    """Map auth-service exceptions to proper HTTP status codes."""
    status_map = {
        "email_already_in_use": status.HTTP_409_CONFLICT,
        "invalid_credentials": status.HTTP_401_UNAUTHORIZED,
        "token_expired": status.HTTP_401_UNAUTHORIZED,
        "token_invalid": status.HTTP_401_UNAUTHORIZED,
        "service_unavailable": status.HTTP_503_SERVICE_UNAVAILABLE,
        "server_misconfiguration": status.HTTP_500_INTERNAL_SERVER_ERROR,
        "verification_error": status.HTTP_503_SERVICE_UNAVAILABLE,
        "db_read_failed": status.HTTP_503_SERVICE_UNAVAILABLE,
        "db_write_failed": status.HTTP_503_SERVICE_UNAVAILABLE,
        "db_error": status.HTTP_503_SERVICE_UNAVAILABLE,
        "auth_provider_error": status.HTTP_502_BAD_GATEWAY,
        "network_error": status.HTTP_502_BAD_GATEWAY,
        "timeout": status.HTTP_504_GATEWAY_TIMEOUT,
        "auth_create_failed": status.HTTP_502_BAD_GATEWAY,
    }
    http_status = status_map.get(exc.code, status.HTTP_400_BAD_REQUEST)
    return HTTPException(status_code=http_status, detail=exc.message)

# ── Routes ───────────────────────────────────────────────────────────────────

@router.get(
    "/me",
    response_model=FirebaseUserResponse,
    responses={
        401: {"description": "Invalid or expired Firebase ID token"},
        503: {"description": "Auth service not initialized"},
    },
)
async def get_my_identity(user: dict = Depends(get_current_user)):
    """
    Verify a Firebase ID token and return the authenticated user's identity.
    """
    return FirebaseUserResponse(
        uid=user["uid"],
        email=user["email"],
    )

@router.post(
    "/register-profile",
    response_model=UserResponse,
    responses={
        201: {"model": UserResponse, "description": "Profile created from Firebase ID token"},
        401: {"description": "Invalid or expired Firebase ID token"},
        409: {"description": "User profile already exists"},
        503: {"description": "Service unavailable"},
    },
    status_code=status.HTTP_201_CREATED,
)
async def register_profile(request: RegisterProfileRequest, user: dict = Depends(get_current_user)):
    """
    Create a Firestore user profile for an already-authenticated Firebase user.
    """
    uid = user["uid"]
    email = user["email"]

    try:
        user_profile = create_user_profile(
            uid=uid,
            email=email,
            username=request.username,
        )
    except AuthServiceError as exc:
        raise _handle_auth_error(exc)

    return UserResponse(**user_profile)


@router.get(
    "/profile",
    response_model=UserResponse,
    responses={
        200: {"model": UserResponse, "description": "User profile from Firebase ID token"},
        401: {"description": "Invalid or expired Firebase ID token"},
        404: {"description": "User profile not found in Firestore"},
        503: {"description": "Service unavailable"},
    },
)
async def get_profile(user: dict = Depends(get_current_user)):
    """
    Get the authenticated user's profile from Firestore.
    """
    uid = user["uid"]

    try:
        user_profile = get_user_profile(uid)
    except AuthServiceError as exc:
        if exc.code == "profile_not_found":
            # Return a basic response if Firestore doc is missing but user is authenticated
            return UserResponse(uid=uid, email=user["email"])
        raise _handle_auth_error(exc)

    return UserResponse(**user_profile)


@router.put(
    "/profile/complete",
    response_model=UserResponse,
    responses={
        200: {"model": UserResponse},
        401: {"description": "Unauthorized"},
        500: {"description": "Internal server error"},
    },
)
async def complete_profile(request: ProfileCompletionRequest, user: dict = Depends(get_current_user)):
    """
    Save the user's profile preferences and mark the profile as completed.
    """
    uid = user["uid"]
    from firebase_config import db as _db

    if not _db:
        user_profile = get_user_profile(uid)
        user_profile["profile_completed"] = True
        return UserResponse(**user_profile)

    try:
        doc_ref = _db.collection("users").document(uid)
        update_data = {
            "profileCompletion": request.dict(exclude_none=True),
            "profileCompleted": True,
        }
        doc_ref.set(update_data, merge=True)
        
        user_profile = get_user_profile(uid)
        return UserResponse(**user_profile)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {exc}")


@router.put(
    "/onboarding/complete",
    response_model=UserResponse,
    responses={
        200: {"model": UserResponse},
        401: {"description": "Unauthorized"},
        500: {"description": "Internal server error"},
    },
)
async def complete_onboarding(user: dict = Depends(get_current_user)):
    """
    Mark the user's onboarding tour as completed.
    """
    uid = user["uid"]
    from firebase_config import db as _db
    from google.cloud.firestore_v1.transforms import SERVER_TIMESTAMP

    if not _db:
        user_profile = get_user_profile(uid)
        user_profile["onboarding_completed"] = True
        user_profile["onboarding_version"] = 1
        return UserResponse(**user_profile)

    try:
        doc_ref = _db.collection("users").document(uid)
        update_data = {
            "onboardingCompleted": True,
            "onboardingVersion": 1,
            "onboardingCompletedAt": SERVER_TIMESTAMP
        }
        doc_ref.set(update_data, merge=True)
        
        user_profile = get_user_profile(uid)
        return UserResponse(**user_profile)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to update onboarding status: {exc}")


@router.patch(
    "/profile",
    response_model=UserResponse,
    responses={
        200: {"model": UserResponse},
        401: {"description": "Unauthorized"},
        500: {"description": "Internal server error"},
    },
)
async def update_profile(request: ProfileUpdateRequest, user: dict = Depends(get_current_user)):
    """
    Update the user's profile with partial data using Firestore dot notation.
    """
    uid = user["uid"]
    from firebase_config import db as _db

    update_data = {}
    for key, value in request.dict(exclude_unset=True).items():
        update_data[f"profileCompletion.{key}"] = value

    if not _db:
        user_profile = get_user_profile(uid)
        return UserResponse(**user_profile)

    if update_data:
        try:
            doc_ref = _db.collection("users").document(uid)
            doc_ref.update(update_data)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Failed to update profile: {exc}")

    user_profile = get_user_profile(uid)
    return UserResponse(**user_profile)
