from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ProfileStats(BaseModel):
    hairstylesTried: int
    savedStyles: int
    comparisonsCreated: int
    recommendationsUsed: int
    analysesCompleted: int

class AIStyleProfile(BaseModel):
    mostTriedHairstyles: List[str]
    favoriteCategories: List[str]
    favoriteHairColors: List[str]
    preferredMaintenanceLevel: str
    topRecommendationCategory: str

class HairInsightsSummary(BaseModel):
    healthScore: Optional[int] = None
    hairDensity: Optional[str] = None
    hairTexture: Optional[str] = None
    growthSuggestions: List[str] = []

class ComprehensiveProfileResponse(BaseModel):
    uid: str
    email: str
    displayName: Optional[str] = None
    joinedDate: Optional[str] = None
    userBadge: str
    
    # Existing data
    profileCompletion: Dict[str, Any]
    completionPercentage: int
    onboarding_completed: bool = False
    profile_completed: bool = False
    
    # New aggregated data
    stats: ProfileStats
    aiStyleProfile: AIStyleProfile
    hairInsightsSummary: HairInsightsSummary
