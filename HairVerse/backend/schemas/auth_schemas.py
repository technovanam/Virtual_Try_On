from datetime import datetime
from pydantic import BaseModel, Field, EmailStr


# ── Request Schemas ──────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    """Request body for POST /auth/register."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password (min 6 chars)")
    username: str = Field(..., min_length=1, max_length=100, description="Display name")


class LoginRequest(BaseModel):
    """Request body for POST /auth/login."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=1, description="User password")


class TokenRequest(BaseModel):
    """Request body for POST /auth/verify."""
    token: str = Field(..., description="JWT access token to validate")


class RegisterProfileRequest(BaseModel):
    """Request body for POST /auth/register-profile."""
    id_token: str = Field(..., description="Firebase ID token from Client SDK signup")
    username: str = Field(..., min_length=1, max_length=100, description="Display name")


class ProfileRequest(BaseModel):
    """Request body for POST /auth/profile."""
    id_token: str = Field(..., description="Firebase ID token from Client SDK login")


# ── Response Schemas ─────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    """Public user profile returned in auth responses."""
    uid: str
    email: str
    display_name: str | None = None
    subscription_status: str = "free"
    onboarding_completed: bool = False
    created_at: str | None = None


class AuthResponse(BaseModel):
    """Successful authentication response containing user + access token."""
    user: UserResponse
    token: str
    token_type: str = "bearer"
    expires_in: int = 3600  # seconds


class FirebaseUserResponse(BaseModel):
    """Minimal user identity returned from Firebase ID token verification."""
    uid: str
    email: str


class ErrorResponse(BaseModel):
    """Standard error response."""
    detail: str
    code: str | None = None


# ── Internal / Middleware Schemas ────────────────────────────────────────────

class TokenData(BaseModel):
    """Payload extracted from a verified JWT."""
    uid: str
    email: str
    exp: int
    iat: int
