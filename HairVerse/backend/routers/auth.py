"""
Authentication routes for HairVerse.

POST /auth/register   — Create account (Firebase Auth + Firestore)
POST /auth/login      — Sign in (verify password, return JWT + profile)
POST /auth/verify     — Validate an existing JWT (session restore)
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from schemas.auth_schemas import (
    RegisterRequest,
    RegisterProfileRequest,
    ProfileRequest,
    ProfileCompletionRequest,
    LoginRequest,
    TokenRequest,
    AuthResponse,
    UserResponse,
    FirebaseUserResponse,
    ErrorResponse,
)
from services.auth_service import (
    create_user,
    create_user_profile,
    get_user_profile,
    verify_firebase_id_token,
    authenticate_user,
    generate_token,
    verify_token,
    AuthServiceError,
    UserAlreadyExists,
    InvalidCredentials,
    TokenError,
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
    print(f"[DEBUG  _handle_auth_error] code={exc.code}, status={http_status}, message={exc.message}")
    return HTTPException(status_code=http_status, detail=exc.message)


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=AuthResponse,
    responses={
        201: {"model": AuthResponse},
        409: {"model": ErrorResponse, "description": "Email already in use"},
        503: {"model": ErrorResponse, "description": "Service unavailable"},
    },
    status_code=status.HTTP_201_CREATED,
)
async def register(request: RegisterRequest):
    """
    Create a new user account.

    Steps:
      1. Validate input (handled by Pydantic).
      2. Create Firebase Auth user via Admin SDK.
      3. Write user document to Firestore.
      4. Generate and return a signed JWT + user profile.
    """
    try:
        user_profile = create_user(
            email=request.email,
            password=request.password,
            username=request.username,
        )
    except UserAlreadyExists as exc:
        raise _handle_auth_error(exc)
    except AuthServiceError as exc:
        raise _handle_auth_error(exc)

    # Generate access token
    token = generate_token(uid=user_profile["uid"], email=user_profile["email"])

    return AuthResponse(
        user=UserResponse(**user_profile),
        token=token,
        token_type="bearer",
        expires_in=3600,
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    responses={
        200: {"model": AuthResponse},
        401: {"model": ErrorResponse, "description": "Invalid credentials"},
        503: {"model": ErrorResponse, "description": "Service unavailable"},
    },
)
async def login(request: LoginRequest):
    """
    Authenticate an existing user.

    Steps:
      1. Validate input.
      2. Verify email + password via Firebase Identity Toolkit REST API.
      3. Optionally verify returned ID token via Admin SDK.
      4. Read (or create) Firestore user document.
      5. Generate and return a signed JWT + user profile.
    """
    try:
        user_profile = authenticate_user(
            email=request.email,
            password=request.password,
        )
    except InvalidCredentials as exc:
        raise _handle_auth_error(exc)
    except AuthServiceError as exc:
        raise _handle_auth_error(exc)

    token = generate_token(uid=user_profile["uid"], email=user_profile["email"])

    return AuthResponse(
        user=UserResponse(**user_profile),
        token=token,
        token_type="bearer",
        expires_in=3600,
    )


@router.post(
    "/verify",
    response_model=UserResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Invalid or expired token"},
    },
)
async def verify(token_body: TokenRequest):
    """
    Verify a JWT and return the associated user profile.

    Used by the frontend to restore sessions on app launch.
    """
    raw_token = token_body.token

    try:
        payload = verify_token(raw_token)
    except TokenError as exc:
        raise _handle_auth_error(exc)

    uid = payload.get("uid")
    email = payload.get("email", "")

    # Fetch the latest profile from Firestore
    try:
        from firebase_config import db as _db
        doc_snap = _db.collection("users").document(uid).get()
        if doc_snap.exists:
            data = doc_snap.to_dict()
            return UserResponse(
                uid=uid,
                email=email,
                display_name=data.get("displayName", email),
                subscription_status=data.get("subscriptionStatus", "free"),
                onboarding_completed=data.get("onboardingCompleted", False),
                created_at=data.get("createdAt", ""),
            )
    except Exception:
        pass

    # Fallback: return basic profile from JWT claims
    return UserResponse(
        uid=uid,
        email=email,
        display_name=email,
    )


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

    This is a minimal protected endpoint that demonstrates the auth middleware.
    Protected routes should use:
        async def my_route(user: dict = Depends(get_current_user)):

    Request header:
        Authorization: Bearer <firebase_id_token>
    """
    return FirebaseUserResponse(
        uid=user["uid"],
        email=user["email"],
    )


@router.post(
    "/register-profile",
    response_model=AuthResponse,
    responses={
        201: {"model": AuthResponse, "description": "Profile created from Firebase ID token"},
        401: {"description": "Invalid or expired Firebase ID token"},
        409: {"description": "User profile already exists"},
        503: {"description": "Service unavailable"},
    },
    status_code=status.HTTP_201_CREATED,
)
async def register_profile(request: RegisterProfileRequest):
    """
    Create a Firestore user profile for an already-authenticated Firebase user.

    This endpoint is called after the frontend creates a Firebase Auth user via
    the Client SDK (createUserWithEmailAndPassword). The frontend sends the
    newly-obtained Firebase ID token, and the backend:
      1. Verifies the ID token via Admin SDK.
      2. Creates the users/{uid} document in Firestore.
      3. Returns a custom JWT + user profile for subsequent API calls.
    """
    # 1. Verify the Firebase ID token
    try:
        token_data = verify_firebase_id_token(request.id_token)
    except AuthServiceError as exc:
        raise _handle_auth_error(exc)

    uid = token_data["uid"]
    email = token_data["email"]

    # 2. Create Firestore user document (also checks for duplicates)
    try:
        user_profile = create_user_profile(
            uid=uid,
            email=email,
            username=request.username,
        )
    except AuthServiceError as exc:
        raise _handle_auth_error(exc)

    # 3. Generate JWT and return
    token = generate_token(uid=uid, email=email)

    return AuthResponse(
        user=UserResponse(**user_profile),
        token=token,
        token_type="bearer",
        expires_in=3600,
    )


@router.post(
    "/profile",
    response_model=UserResponse,
    responses={
        200: {"model": UserResponse, "description": "User profile from Firebase ID token"},
        401: {"description": "Invalid or expired Firebase ID token"},
        404: {"description": "User profile not found in Firestore"},
        503: {"description": "Service unavailable"},
    },
)
async def get_profile(request: ProfileRequest, http_request: Request):
    """
    Get the authenticated user's profile from Firestore.

    Called after the frontend signs in via Firebase Client SDK
    (signInWithEmailAndPassword). The frontend sends the Firebase ID token,
    and the backend:
      1. Verifies the ID token via Admin SDK.
      2. Reads the users/{uid} document from Firestore.
      3. Returns the user profile.
    """
    #  DEBUG: Log request details
    print(f"[DEBUG  /auth/profile] Request received")
    print(f"[DEBUG  /auth/profile] id_token present: {bool(request.id_token)}")
    print(f"[DEBUG  /auth/profile] id_token[:50]='{request.id_token[:50]}...' (len={len(request.id_token)})")
    print(f"[DEBUG  /auth/profile] Authorization header present: {bool(http_request.headers.get('authorization'))}")
    print(f"[DEBUG  /auth/profile] Content-Type header: {http_request.headers.get('content-type', 'not sent')}")
    print(f"[DEBUG  /auth/profile] All request headers keys: {list(http_request.headers.keys())}")

    # 1. Verify the Firebase ID token
    try:
        token_data = verify_firebase_id_token(request.id_token)
        print(f"[DEBUG  /auth/profile] Token verified - uid={token_data['uid']}")
    except AuthServiceError as exc:
        print(f"[DEBUG  /auth/profile] EXCEPTION in verify_firebase_id_token")
        print(f"[DEBUG  /auth/profile]   exc.code={exc.code}")
        print(f"[DEBUG  /auth/profile]   exc.message={exc.message}")
        raise _handle_auth_error(exc)
    except Exception as exc:
        # Catch any truly unexpected exception
        import traceback
        print(f"[DEBUG  /auth/profile] UNEXPECTED EXCEPTION: {type(exc).__name__}: {exc}")
        print(f"[DEBUG  /auth/profile] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}")

    uid = token_data["uid"]

    # 2. Read user profile from Firestore
    try:
        print(f"[DEBUG  /auth/profile] Calling get_user_profile(uid='{uid}')")
        user_profile = get_user_profile(uid)
        print(f"[DEBUG  /auth/profile] Profile fetched: display_name={user_profile.get('display_name')}")
    except AuthServiceError as exc:
        print(f"[DEBUG  /auth/profile] EXCEPTION in get_user_profile")
        print(f"[DEBUG  /auth/profile]   exc.code={exc.code}")
        print(f"[DEBUG  /auth/profile]   exc.message={exc.message}")
        if exc.code == "profile_not_found":
            return UserResponse(uid="", email="")
        raise _handle_auth_error(exc)

    print(f"[DEBUG  /auth/profile] SUCCESS - returning UserResponse for uid={uid}")
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
            "gender": request.gender,
            "hairLength": request.hairLength,
            "beardPreference": request.beardPreference,
            "preferredStyles": request.preferredStyles,
            "mainGoal": request.mainGoal,
            "preferredHairColor": request.preferredHairColor,
            "profileCompleted": True,
        }
        doc_ref.set(update_data, merge=True)
        
        # Return updated profile
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

    if not _db:
        user_profile = get_user_profile(uid)
        user_profile["onboarding_completed"] = True
        return UserResponse(**user_profile)

    try:
        doc_ref = _db.collection("users").document(uid)
        doc_ref.set({"onboardingCompleted": True}, merge=True)
        
        # Return updated profile
        user_profile = get_user_profile(uid)
        return UserResponse(**user_profile)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to update onboarding status: {exc}")
