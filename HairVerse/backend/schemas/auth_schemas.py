from datetime import datetime
from pydantic import BaseModel, Field

# ── Request Schemas ──────────────────────────────────────────────────────────

class RegisterProfileRequest(BaseModel):
    """Request body for POST /auth/register-profile."""
    username: str = Field(..., min_length=1, max_length=100, description="Display name")

class ProfileCompletionRequest(BaseModel):
    """Request body for PUT /auth/profile/complete."""
    gender: str = Field(..., description="User gender")
    age: int | str | None = Field(None, description="User age")
    country: str | None = Field(None, description="User country")
    hairLength: str | None = Field(None, description="Preferred hair length")
    hairType: str | None = Field(None, description="Hair type")
    hairColor: str | None = Field(None, description="Hair color")
    hairConcerns: list[str] = Field(default_factory=list, description="List of hair concerns")
    preferredStyles: list[str] = Field(default_factory=list, description="List of preferred style types")
    goals: list[str] = Field(default_factory=list, description="Main goals for using the app")
    beardStatus: str | None = Field(None, description="Beard status")
    beardPreference: str | None = Field(None, description="Beard preference")

class ProfileUpdateRequest(BaseModel):
    """Request body for PATCH /auth/profile."""
    gender: str | None = Field(None, description="User gender")
    age: int | str | None = Field(None, description="User age")
    country: str | None = Field(None, description="User country")
    hairLength: str | None = Field(None, description="Preferred hair length")
    hairType: str | None = Field(None, description="Hair type")
    hairColor: str | None = Field(None, description="Hair color")
    hairConcerns: list[str] | None = Field(None, description="List of hair concerns")
    preferredStyles: list[str] | None = Field(None, description="List of preferred style types")
    goals: list[str] | None = Field(None, description="Main goals for using the app")
    beardStatus: str | None = Field(None, description="Beard status")
    beardPreference: str | None = Field(None, description="Beard preference")

# ── Response Schemas ─────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    """Public user profile returned in auth responses."""
    uid: str
    email: str
    display_name: str | None = None
    subscription_status: str = "free"
    profile_completed: bool = False
    onboarding_completed: bool = False
    onboarding_version: int | None = None
    onboarding_completed_at: str | None = None
    profileCompletion: dict | None = None
    created_at: str | None = None

class FirebaseUserResponse(BaseModel):
    """Minimal user identity returned from Firebase ID token verification."""
    uid: str
    email: str

class ErrorResponse(BaseModel):
    """Standard error response."""
    detail: str
    code: str | None = None
