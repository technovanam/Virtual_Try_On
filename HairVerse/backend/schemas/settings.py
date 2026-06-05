from pydantic import BaseModel
from typing import Optional

class SettingsUpdate(BaseModel):
    pushNotifications: Optional[bool] = None
    emailNotifications: Optional[bool] = None
    darkMode: Optional[bool] = None
    analyticsConsent: Optional[bool] = None

class SettingsResponse(BaseModel):
    pushNotifications: bool
    emailNotifications: bool
    darkMode: bool
    analyticsConsent: bool
    updatedAt: str
