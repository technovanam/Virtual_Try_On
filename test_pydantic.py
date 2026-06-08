import json
from pydantic import BaseModel
from typing import Dict, Any, Optional, List

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

response = ComprehensiveProfileResponse(
    uid="123",
    email="test@test.com",
    displayName="Test",
    joinedDate="Joined",
    userBadge="Newcomer",
    profileCompletion={},
    completionPercentage=100,
    onboarding_completed=True,
    profile_completed=True,
    stats=ProfileStats(hairstylesTried=0, savedStyles=0, comparisonsCreated=0, recommendationsUsed=0, analysesCompleted=0),
    aiStyleProfile=AIStyleProfile(mostTriedHairstyles=[], favoriteCategories=[], favoriteHairColors=[], preferredMaintenanceLevel="", topRecommendationCategory=""),
    hairInsightsSummary=HairInsightsSummary()
)

print(response.json())
