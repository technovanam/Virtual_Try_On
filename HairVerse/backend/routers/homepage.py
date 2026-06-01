from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional
from firebase_config import db

router = APIRouter()

class ProfileItem(BaseModel):
    id: str
    name: str
    avatarUrl: str
    selfieBase64: Optional[str] = None
    analysisData: Optional[dict] = None
    isGuest: Optional[bool] = False
    lastUsedTime: Optional[str] = "Active Now"

# Hardcoded initial database/store in memory on backend
MOCK_PROFILES = [
    {
        "id": "sasi",
        "name": "Sasi",
        "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
        "selfieBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "analysisData": {
            "face_shape": "Oval",
            "hair_type": "Straight",
            "hair_density": "Medium",
            "hair_texture": "Smooth",
        },
        "isGuest": False,
        "lastUsedTime": "Active Now"
    },
    {
        "id": "ananya",
        "name": "Ananya",
        "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
        "selfieBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "analysisData": {
            "face_shape": "Heart",
            "hair_type": "Curly",
            "hair_density": "Thick",
            "hair_texture": "Wavy",
        },
        "isGuest": False,
        "lastUsedTime": "4 hours ago"
    },
    {
        "id": "guest",
        "name": "Guest User",
        "avatarUrl": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
        "selfieBase64": None,
        "analysisData": None,
        "isGuest": True,
        "lastUsedTime": "1 day ago"
    }
]

def _profiles_collection(uid: str):
    return db.collection("users").document(uid).collection("profiles")

@router.get("/config")
async def get_homepage_config(username: str = "Sasi", hour: int = 12):
    # Greeting based on current device hour
    if hour < 12:
        greeting = "Good Morning"
        subtitle = "Ready for your next look?"
    elif hour < 17:
        greeting = "Good Afternoon"
        subtitle = "Find your perfect hairstyle today"
    else:
        greeting = "Good Evening"
        subtitle = "Plan your perfect hairstyle tonight"

    return {
        "greeting": f"{greeting}, {username}",
        "greeting_prefix": greeting,
        "username": username,
        "subtitle": subtitle,
        "notification_count": 3
    }

@router.get("/categories")
async def get_categories():
    # Return horizontal category chips dynamically
    return ["Korean", "Fade", "Curly", "Professional", "Beard", "Trending"]

@router.get("/suggestions")
async def get_search_suggestions():
    # Return searchable suggestions dynamically
    return [
        { "name": "Classic Fade", "type": "Hairstyle", "id": "fade_01" },
        { "name": "Korean Textured", "type": "Hairstyle", "id": "korean_02" },
        { "name": "Textured Curly Crop", "type": "Hairstyle", "id": "curly_03" },
        { "name": "Modern Buzz Cut", "type": "Hairstyle", "id": "buzz_04" },
        { "name": "Wolf Cut", "type": "Hairstyle", "id": "curly_03" },
        { "name": "Pompadour style", "type": "Hairstyle", "id": "fade_01" },
        { "name": "Clean Shave", "type": "Beard Style", "query": "Clean Shave" },
        { "name": "Stubble Beard", "type": "Beard Style", "query": "Stubble" },
        { "name": "Short Beard", "type": "Beard Style", "query": "Short Beard" },
        { "name": "Full Beard", "type": "Beard Style", "query": "Full Beard" },
        { "name": "Silver Hair Color", "type": "Hair Color", "query": "Silver" },
        { "name": "Blonde Highlights", "type": "Hair Color", "query": "Blonde" },
        { "name": "Burgundy Dye", "type": "Hair Color", "query": "Burgundy" },
        { "name": "Dark Brown Shade", "type": "Hair Color", "query": "Dark Brown" },
        { "name": "Zayn Malik Celebrity Look", "type": "Celebrity look", "query": "Zayn Malik" },
        { "name": "Gong Yoo Wave style", "type": "Celebrity look", "query": "Gong Yoo" },
        { "name": "Trending Fades", "type": "Trend", "query": "Modern Fades" },
        { "name": "Korean Bangs Trend", "type": "Trend", "query": "Korean Bangs" }
    ]

@router.get("/profiles", response_model=List[ProfileItem])
async def get_profiles(uid: str = "anonymous"):
    if not db:
        return MOCK_PROFILES

    docs = _profiles_collection(uid).stream()
    profiles = []
    for doc in docs:
        data = doc.to_dict() or {}
        if "id" not in data:
            data["id"] = doc.id
        profiles.append(data)
    return profiles

@router.post("/profiles", response_model=ProfileItem)
async def create_profile(profile: ProfileItem, uid: str = "anonymous"):
    if not db:
        for p in MOCK_PROFILES:
            if p["id"] == profile.id:
                return p
        MOCK_PROFILES.append(profile.model_dump())
        return profile

    ref = _profiles_collection(uid).document(profile.id)
    existing = ref.get()
    if existing.exists:
        return existing.to_dict()
    ref.set(profile.model_dump())
    return profile

@router.put("/profiles/{id}", response_model=ProfileItem)
async def update_profile(id: str, profile: ProfileItem, uid: str = "anonymous"):
    if not db:
        for i, p in enumerate(MOCK_PROFILES):
            if p["id"] == id:
                MOCK_PROFILES[i] = profile.model_dump()
                return MOCK_PROFILES[i]
        MOCK_PROFILES.append(profile.model_dump())
        return profile

    ref = _profiles_collection(uid).document(id)
    ref.set(profile.model_dump())
    return profile

@router.get("/trends")
async def get_search_trends():
    return [
        {
            "id": "trend_01",
            "name": "Silver Curly Crop",
            "trendScore": 98,
            "popularity": "12.4k",
            "category": "Curly",
            "strength": "EXTREME",
            "badge": "Viral",
            "compatible_face_shapes": ["Oval", "Square", "Round"],
            "compatible_hair_types": ["Curly", "Wavy"]
        },
        {
            "id": "trend_02",
            "name": "Korean Volume Wave",
            "trendScore": 96,
            "popularity": "9.8k",
            "category": "Korean",
            "strength": "STRONG",
            "badge": "Trending",
            "compatible_face_shapes": ["Oval", "Heart", "Round"],
            "compatible_hair_types": ["Straight", "Wavy"]
        },
        {
            "id": "trend_03",
            "name": "Mid Drop Fade",
            "trendScore": 94,
            "popularity": "8.2k",
            "category": "Fade",
            "strength": "HIGH",
            "badge": "New",
            "compatible_face_shapes": ["Oval", "Square", "Diamond"],
            "compatible_hair_types": ["Straight", "Thick", "Fine"]
        },
        {
            "id": "trend_04",
            "name": "Office Slick Pompadour",
            "trendScore": 91,
            "popularity": "6.5k",
            "category": "Office",
            "strength": "HIGH",
            "badge": "Popular",
            "compatible_face_shapes": ["Square", "Oval", "Oblong"],
            "compatible_hair_types": ["Straight", "Thick"]
        },
        {
            "id": "trend_05",
            "name": "Short Beard Trim",
            "trendScore": 89,
            "popularity": "5.7k",
            "category": "Beard",
            "strength": "OPTIMAL",
            "badge": "Popular",
            "compatible_face_shapes": ["Oval", "Square", "Heart"],
            "compatible_hair_types": ["Coarse", "Thick"]
        },
        {
            "id": "trend_06",
            "name": "Zayn Malik Blonde Fade",
            "trendScore": 95,
            "popularity": "11.1k",
            "category": "Celebrity",
            "strength": "EXTREME",
            "badge": "Viral",
            "compatible_face_shapes": ["Oval", "Square", "Chiseled"],
            "compatible_hair_types": ["Straight", "Thick"]
        }
    ]

@router.get("/categories-detailed")
async def get_categories_detailed():
    return [
        {
            "id": "korean",
            "title": "Korean Textured",
            "icon": "sparkles",
            "bannerUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&h=250&fit=crop",
            "stylesCount": 12,
            "trendLevel": "Rising",
            "matchScore": 95,
            "isRecommended": True,
            "subcategories": ["Soft Wavy Bangs", "Textured Shag", "Korean Mullet", "Two-Block Cut"]
        },
        {
            "id": "fade",
            "title": "Fade & Crops",
            "icon": "cut",
            "bannerUrl": "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&h=250&fit=crop",
            "stylesCount": 15,
            "trendLevel": "Hot",
            "matchScore": 92,
            "isRecommended": False,
            "subcategories": ["High Skin Fade", "Mid Drop Fade", "French Crop", "Taper Fade"]
        },
        {
            "id": "curly",
            "title": "Curly & Wavy",
            "icon": "git-branch",
            "bannerUrl": "https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=500&h=250&fit=crop",
            "stylesCount": 8,
            "trendLevel": "Rising",
            "matchScore": 88,
            "isRecommended": True,
            "subcategories": ["Textured Curly Crop", "Messy Waves", "Curly Shag", "Tight Ringlets"]
        },
        {
            "id": "beard",
            "title": "Beard & Stubble",
            "icon": "body",
            "bannerUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=250&fit=crop",
            "stylesCount": 10,
            "trendLevel": "High",
            "matchScore": 90,
            "isRecommended": False,
            "subcategories": ["Stubble Trim", "Short Boxed Beard", "Full Beard Groom", "Anchor Beard"]
        },
        {
            "id": "professional",
            "title": "Professional Looks",
            "icon": "business",
            "bannerUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=250&fit=crop",
            "stylesCount": 14,
            "trendLevel": "Hot",
            "matchScore": 94,
            "isRecommended": False,
            "subcategories": ["Futuristic Slick Back", "Classic Executive Part", "Modern Pompadour", "Ivy League"]
        }
    ]

@router.get("/popular-regional")
async def get_popular_regional(region: str = "Global"):
    return [
        {
            "id": "fade_01",
            "name": "Classic Fade",
            "popularity": "98%",
            "regionRank": 1,
            "imageUrl": "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=150&h=150&fit=crop"
        },
        {
            "id": "korean_02",
            "name": "Korean Textured",
            "popularity": "95%",
            "regionRank": 2,
            "imageUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop"
        },
        {
            "id": "curly_03",
            "name": "Textured Curly Crop",
            "popularity": "91%",
            "regionRank": 3,
            "imageUrl": "https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=150&h=150&fit=crop"
        }
    ]
