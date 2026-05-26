from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional
import datetime

router = APIRouter()

class HairstyleItem(BaseModel):
    id: str
    name: str
    imageUrl: str
    matchScore: str
    maintenance: str
    badge: str
    popularity: float
    category: str
    face_shape_compatibility: List[str]
    hair_type_compatibility: List[str]
    hair_density: List[str]
    hair_length: str
    beard_compatibility: List[str]
    hair_colors: List[str]
    trend_level: str
    tried_count: int
    save_count: int
    created_at: str
    why_matches: Optional[str] = None

# High-fidelity enriched hairstyles database
HAIRSTYLES_DATABASE = [
    {
        "id": "fade_01",
        "name": "Classic Fade",
        "imageUrl": "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&h=500&fit=crop",
        "matchScore": "95%",
        "maintenance": "Medium Maintenance",
        "badge": "Trending",
        "popularity": 4.9,
        "category": "Fade",
        "face_shape_compatibility": ["Oval", "Square", "Diamond"],
        "hair_type_compatibility": ["Straight", "Wavy", "Thick"],
        "hair_density": ["Thick", "Medium"],
        "hair_length": "Short",
        "beard_compatibility": ["Beard", "Stubble"],
        "hair_colors": ["Black", "Brown", "Blonde"],
        "trend_level": "Trending",
        "tried_count": 1420,
        "save_count": 380,
        "created_at": "2026-05-10"
    },
    {
        "id": "korean_02",
        "name": "Korean Textured",
        "imageUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&h=500&fit=crop",
        "matchScore": "92%",
        "maintenance": "Low Maintenance",
        "badge": "New Style",
        "popularity": 4.7,
        "category": "Korean",
        "face_shape_compatibility": ["Oval", "Heart", "Round"],
        "hair_type_compatibility": ["Straight", "Fine"],
        "hair_density": ["Medium", "Thin"],
        "hair_length": "Medium",
        "beard_compatibility": ["Clean Shave"],
        "hair_colors": ["Black", "Brown", "Silver"],
        "trend_level": "Rising",
        "tried_count": 890,
        "save_count": 290,
        "created_at": "2026-05-20"
    },
    {
        "id": "curly_03",
        "name": "Textured Curly Crop",
        "imageUrl": "https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=500&h=500&fit=crop",
        "matchScore": "88%",
        "maintenance": "High Maintenance",
        "badge": "Recommended",
        "popularity": 4.6,
        "category": "Curly",
        "face_shape_compatibility": ["Oval", "Square", "Diamond"],
        "hair_type_compatibility": ["Curly", "Wavy"],
        "hair_density": ["Thick", "Medium"],
        "hair_length": "Short",
        "beard_compatibility": ["Beard", "Stubble", "Clean Shave"],
        "hair_colors": ["Black", "Brown", "Ginger"],
        "trend_level": "Viral",
        "tried_count": 1150,
        "save_count": 420,
        "created_at": "2026-05-14"
    },
    {
        "id": "buzz_04",
        "name": "Modern Buzz",
        "imageUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=500&fit=crop",
        "matchScore": "90%",
        "maintenance": "Low Maintenance",
        "badge": "Popular",
        "popularity": 4.8,
        "category": "Trending",
        "face_shape_compatibility": ["Oval", "Square", "Diamond", "Chiseled"],
        "hair_type_compatibility": ["Straight", "Coarse"],
        "hair_density": ["Thick", "Medium", "Thin"],
        "hair_length": "Short",
        "beard_compatibility": ["Clean Shave", "Stubble"],
        "hair_colors": ["Black", "Blonde", "Silver"],
        "trend_level": "Popular",
        "tried_count": 2100,
        "save_count": 680,
        "created_at": "2026-04-30"
    },
    {
        "id": "slick_05",
        "name": "Futuristic Slick Back",
        "imageUrl": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&h=500&fit=crop",
        "matchScore": "94%",
        "maintenance": "Medium Maintenance",
        "badge": "Trending",
        "popularity": 4.8,
        "category": "Professional",
        "face_shape_compatibility": ["Square", "Oval", "Oblong"],
        "hair_type_compatibility": ["Straight", "Thick"],
        "hair_density": ["Thick", "Medium"],
        "hair_length": "Medium",
        "beard_compatibility": ["Beard", "Stubble"],
        "hair_colors": ["Black", "Brown"],
        "trend_level": "Hot",
        "tried_count": 750,
        "save_count": 310,
        "created_at": "2026-05-02"
    },
    {
        "id": "wolf_06",
        "name": "Shaggy Wolf Cut",
        "imageUrl": "https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?w=500&h=500&fit=crop",
        "matchScore": "86%",
        "maintenance": "High Maintenance",
        "badge": "New Style",
        "popularity": 4.5,
        "category": "Korean",
        "face_shape_compatibility": ["Oval", "Heart", "Diamond"],
        "hair_type_compatibility": ["Wavy", "Straight"],
        "hair_density": ["Medium", "Thin"],
        "hair_length": "Long",
        "beard_compatibility": ["Clean Shave"],
        "hair_colors": ["Black", "Brown", "Blonde", "Silver"],
        "trend_level": "Rising",
        "tried_count": 920,
        "save_count": 390,
        "created_at": "2026-05-18"
    },
    {
        "id": "pompadour_07",
        "name": "Tapered Pompadour",
        "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
        "matchScore": "91%",
        "maintenance": "High Maintenance",
        "badge": "Popular",
        "popularity": 4.7,
        "category": "Professional",
        "face_shape_compatibility": ["Square", "Oval", "Oblong", "Diamond"],
        "hair_type_compatibility": ["Straight", "Wavy", "Thick"],
        "hair_density": ["Thick", "Medium"],
        "hair_length": "Medium",
        "beard_compatibility": ["Clean Shave", "Stubble"],
        "hair_colors": ["Black", "Brown", "Silver"],
        "trend_level": "Hot",
        "tried_count": 640,
        "save_count": 180,
        "created_at": "2026-05-08"
    },
    {
        "id": "quiff_08",
        "name": "Messy Textures Quiff",
        "imageUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&h=500&fit=crop",
        "matchScore": "93%",
        "maintenance": "Medium Maintenance",
        "badge": "Trending",
        "popularity": 4.6,
        "category": "Trending",
        "face_shape_compatibility": ["Round", "Oval", "Heart", "Square"],
        "hair_type_compatibility": ["Wavy", "Straight", "Fine"],
        "hair_density": ["Medium", "Thin"],
        "hair_length": "Short",
        "beard_compatibility": ["Beard", "Stubble"],
        "hair_colors": ["Brown", "Blonde", "Ginger"],
        "trend_level": "Viral",
        "tried_count": 1820,
        "save_count": 520,
        "created_at": "2026-05-12"
    },
    {
        "id": "dread_09",
        "name": "Dreadlocks Top Knot",
        "imageUrl": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&h=500&fit=crop",
        "matchScore": "89%",
        "maintenance": "Medium Maintenance",
        "badge": "Recommended",
        "popularity": 4.5,
        "category": "Curly",
        "face_shape_compatibility": ["Oval", "Square", "Chiseled"],
        "hair_type_compatibility": ["Curly", "Coarse"],
        "hair_density": ["Thick", "Medium"],
        "hair_length": "Long",
        "beard_compatibility": ["Beard", "Stubble"],
        "hair_colors": ["Black", "Brown", "Ginger"],
        "trend_level": "Rising",
        "tried_count": 510,
        "save_count": 230,
        "created_at": "2026-04-15"
    },
    {
        "id": "stubble_10",
        "name": "Executive Beard Trim",
        "imageUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop",
        "matchScore": "94%",
        "maintenance": "Low Maintenance",
        "badge": "Recommended",
        "popularity": 4.9,
        "category": "Beard",
        "face_shape_compatibility": ["Oval", "Square", "Round", "Heart", "Diamond", "Oblong", "Chiseled"],
        "hair_type_compatibility": ["Straight", "Wavy", "Curly", "Coarse"],
        "hair_density": ["Thick", "Medium", "Thin"],
        "hair_length": "Short",
        "beard_compatibility": ["Beard", "Stubble"],
        "hair_colors": ["Black", "Brown", "Silver"],
        "trend_level": "Popular",
        "tried_count": 2500,
        "save_count": 890,
        "created_at": "2026-05-01"
    }
]

@router.get("/trending", response_model=List[HairstyleItem])
async def get_trending(category: Optional[str] = None):
    # Returns trending styles dynamically from database
    results = []
    for h in HAIRSTYLES_DATABASE:
        item = {
            **h,
            "matchScore": "95%",
            "why_matches": "Highly popular dynamic trend."
        }
        results.append(item)
    if category:
        return [h for h in results if h["category"].lower() == category.lower()]
    return results[:4]

@router.get("/personalized", response_model=List[HairstyleItem])
async def get_personalized(
    face_shape: str = "Oval",
    hair_texture: str = "Straight"
):
    results = []
    for item in HAIRSTYLES_DATABASE:
        score = 70
        face_match = face_shape.capitalize() in item["face_shape_compatibility"]
        texture_match = hair_texture.capitalize() in item["hair_type_compatibility"]
        
        if face_match:
            score += 18
        else:
            score -= 5
            
        if texture_match:
            score += 8
            
        final_score = min(max(score, 60), 99)
        
        why = f"Matches your {face_shape} face shape perfectly (+18% compatibility boost) and sits beautifully with your {hair_texture} hair texture (+8%)."
        if not face_match:
            why = f"Alternative trend compatible with your {hair_texture} hair. Designed for bold structural contrast."
            
        recommended_item = {
            **item,
            "matchScore": f"{final_score}%",
            "badge": "Recommended" if final_score >= 90 else item["badge"],
            "why_matches": why
        }
        results.append(recommended_item)
        
    results.sort(key=lambda x: int(x["matchScore"].replace("%", "")), reverse=True)
    return results

@router.get("/hairstyles")
async def get_hairstyles(
    query: Optional[str] = None,
    face_shape: Optional[str] = None,
    hair_texture: Optional[str] = None,
    hair_density: Optional[str] = None,
    hair_length: Optional[str] = None,
    maintenance_level: Optional[str] = None,
    beard_compatibility: Optional[str] = None,
    hair_color: Optional[str] = None,
    trend_level: Optional[str] = None,
    sort_by: str = "highest_match",
    page: int = 1,
    limit: int = 4,
    active_face_shape: str = "Oval",
    active_hair_texture: str = "Straight"
):
    # 1. Dynamic Score calculation & Personalized "Why this Matches You"
    scored_list = []
    for h in HAIRSTYLES_DATABASE:
        score = 70
        face_match = active_face_shape.capitalize() in h["face_shape_compatibility"]
        texture_match = active_hair_texture.capitalize() in h["hair_type_compatibility"]
        
        if face_match:
            score += 18
            face_reason = f"Fits your {active_face_shape} face structure"
        else:
            score -= 4
            face_reason = f"Accents your {active_face_shape} face line"
            
        if texture_match:
            score += 8
            texture_reason = f"matches your {active_hair_texture} hair flow"
        else:
            texture_reason = f"suits a refined style adjustment"
            
        final_score = min(max(score, 60), 99)
        why = f"{face_reason} (+18% Match) and {texture_reason} (+8%)."
        
        item = {
            **h,
            "matchScore": f"{final_score}%",
            "why_matches": why
        }
        scored_list.append(item)

    # 2. Filtering
    filtered = scored_list
    if query:
        q = query.lower().strip()
        filtered = [
            x for x in filtered 
            if q in x["name"].lower() 
            or q in x["category"].lower()
            or any(q in s.lower() for s in x["face_shape_compatibility"])
            or any(q in t.lower() for t in x["hair_type_compatibility"])
        ]
        
    if face_shape:
        filtered = [x for x in filtered if face_shape.capitalize() in x["face_shape_compatibility"]]
        
    if hair_texture:
        filtered = [x for x in filtered if hair_texture.capitalize() in x["hair_type_compatibility"]]
        
    if hair_density:
        filtered = [x for x in filtered if hair_density.capitalize() in x["hair_density"]]
        
    if hair_length:
        filtered = [x for x in filtered if x["hair_length"].lower() == hair_length.lower()]
        
    if maintenance_level:
        # Map values like "Low" to "Low Maintenance"
        m_map = {
            "low": "low maintenance",
            "medium": "medium maintenance",
            "high": "high maintenance"
        }
        target = m_map.get(maintenance_level.lower(), maintenance_level.lower())
        filtered = [x for x in filtered if target in x["maintenance"].lower()]
        
    if beard_compatibility:
        filtered = [x for x in filtered if beard_compatibility.capitalize() in x["beard_compatibility"]]
        
    if hair_color:
        filtered = [x for x in filtered if hair_color.capitalize() in x["hair_colors"]]
        
    if trend_level:
        filtered = [x for x in filtered if x["trend_level"].lower() == trend_level.lower()]

    # 3. Sorting
    # Options: highest_match, trending, most_tried, newest, most_saved
    if sort_by == "highest_match":
        filtered.sort(key=lambda x: int(x["matchScore"].replace("%", "")), reverse=True)
    elif sort_by == "trending":
        filtered.sort(key=lambda x: x["popularity"], reverse=True)
    elif sort_by == "most_tried":
        filtered.sort(key=lambda x: x["tried_count"], reverse=True)
    elif sort_by == "newest":
        filtered.sort(key=lambda x: x["created_at"], reverse=True)
    elif sort_by == "most_saved":
        filtered.sort(key=lambda x: x["save_count"], reverse=True)

    # 4. Generate Similar Styles (styles in the same category or with matching shape compatibility that aren't in results)
    similar_pool = [x for x in scored_list if x not in filtered]
    if not similar_pool:
        # Fallback to general database items not in the first 2 filtered elements
        similar_pool = [x for x in scored_list if x not in filtered[:2]]
    # Pick top 3 for Similar Styles
    similar_styles = similar_pool[:3]

    # 5. Users Also Tried (popular items sorted by tried_count)
    also_tried_pool = sorted(scored_list, key=lambda x: x["tried_count"], reverse=True)
    # Filter out elements currently in filtered list to avoid exact duplicates where possible
    also_tried = [x for x in also_tried_pool if x not in filtered[:3]][:3]
    if len(also_tried) < 3:
        also_tried = also_tried_pool[:3]

    # 6. Pagination Slicing
    total = len(filtered)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_results = filtered[start_idx:end_idx]
    has_more = end_idx < total

    return {
        "results": paginated_results,
        "similar_styles": similar_styles,
        "users_also_tried": also_tried,
        "total": total,
        "page": page,
        "limit": limit,
        "has_more": has_more
    }

@router.get("/hairstyles/{id}")
async def get_hairstyle(id: str):
    for item in HAIRSTYLES_DATABASE:
        if item["id"] == id:
            return item
    return {"id": id, "name": "Generic Hairstyle"}
