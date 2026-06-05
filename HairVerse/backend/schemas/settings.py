from pydantic import BaseModel
from typing import Optional

class AccessibilityOptions(BaseModel):
    largerText: bool = False
    highContrast: bool = False
    reducedMotion: bool = False

class SettingsUpdate(BaseModel):
    # Personalization
    language: Optional[str] = None
    theme: Optional[str] = None
    
    # Notifications
    notificationsEnabled: Optional[bool] = None
    trendNotifications: Optional[bool] = None
    recommendationNotifications: Optional[bool] = None
    haircareNotifications: Optional[bool] = None
    
    # Privacy & Security
    autoDeleteSelfies: Optional[bool] = None
    biometricEnabled: Optional[bool] = None
    
    # AI Recommendations (From previous settings potentially, mapping to trends etc)
    personalizedRecommendations: Optional[bool] = None
    celebritySuggestions: Optional[bool] = None
    
    # Accessibility
    accessibilityOptions: Optional[AccessibilityOptions] = None
    
    # Legacy Support
    pushNotifications: Optional[bool] = None
    emailNotifications: Optional[bool] = None
    darkMode: Optional[bool] = None
    analyticsConsent: Optional[bool] = None

class SettingsResponse(BaseModel):
    language: str
    theme: str
    
    notificationsEnabled: bool
    trendNotifications: bool
    recommendationNotifications: bool
    haircareNotifications: bool
    
    autoDeleteSelfies: bool
    biometricEnabled: bool
    
    personalizedRecommendations: bool
    celebritySuggestions: bool
    
    accessibilityOptions: AccessibilityOptions
    
    # Legacy Support
    pushNotifications: bool
    emailNotifications: bool
    darkMode: bool
    analyticsConsent: bool
    
    updatedAt: str
