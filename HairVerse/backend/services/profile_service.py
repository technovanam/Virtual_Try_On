from collections import Counter
from datetime import datetime
from firebase_config import db
from schemas.profile_schemas import ComprehensiveProfileResponse, ProfileStats, AIStyleProfile, HairInsightsSummary
from services.auth_service import get_user_profile

class ProfileService:
    @staticmethod
    def get_comprehensive_profile(uid: str) -> ComprehensiveProfileResponse:
        if db is None:
            raise Exception("Database not initialized")
            
        # 1. Base Auth Profile
        base_profile = get_user_profile(uid)
        
        # 2. Aggregations from Collections
        user_ref = db.collection("users").document(uid)
        
        # Try-Ons
        tryons_docs = list(user_ref.collection("tryons").stream())
        tryons_count = len(tryons_docs)
        
        hair_colors = []
        hairstyles = []
        for doc in tryons_docs:
            data = doc.to_dict()
            if data.get("colorName"):
                hair_colors.append(data.get("colorName"))
            if data.get("hairstyleId"):
                hairstyles.append(data.get("hairstyleId"))
                
        # Saved Collections
        saved_docs = list(user_ref.collection("saved").stream())
        saved_count = len(saved_docs)
        
        categories = []
        for doc in saved_docs:
            data = doc.to_dict()
            if data.get("category") and data.get("category") != "Favorites":
                categories.append(data.get("category"))
                
        # Comparisons
        comparisons_docs = list(user_ref.collection("comparisons").stream())
        comparisons_count = len(comparisons_docs)
        
        # Recommendations
        recommendations_docs = list(user_ref.collection("recommendation_reports").stream())
        recommendations_count = len(recommendations_docs)
        
        # Analyses
        analyses_docs = list(user_ref.collection("analysis").stream())
        analyses_count = len(analyses_docs)
        
        # Hair Insights
        insights_docs = list(user_ref.collection("hairInsights").order_by("analyzedAt", direction="DESCENDING").limit(1).stream())
        insights_summary = HairInsightsSummary()
        if insights_docs:
            latest_insight = insights_docs[0].to_dict()
            insights_summary = HairInsightsSummary(
                healthScore=latest_insight.get("healthScore"),
                hairDensity=latest_insight.get("density"),
                hairTexture=latest_insight.get("texture"),
                growthSuggestions=latest_insight.get("recommendations", [])[:3]
            )

        # Calculate AI Style Profile
        fav_colors = [item for item, _ in Counter(hair_colors).most_common(3)] if hair_colors else ["Natural"]
        fav_categories = [item for item, _ in Counter(categories).most_common(3)] if categories else ["Casual"]
        most_tried = [item for item, _ in Counter(hairstyles).most_common(3)] if hairstyles else []
        
        # Determine Badge
        badge = "Newcomer"
        if tryons_count > 10:
            badge = "Style Explorer"
        if saved_count > 20:
            badge = "Trendsetter"
            
        stats = ProfileStats(
            hairstylesTried=tryons_count,
            savedStyles=saved_count,
            comparisonsCreated=comparisons_count,
            recommendationsUsed=recommendations_count,
            analysesCompleted=analyses_count
        )
        
        ai_profile = AIStyleProfile(
            mostTriedHairstyles=most_tried,
            favoriteCategories=fav_categories,
            favoriteHairColors=fav_colors,
            preferredMaintenanceLevel="Low to Medium", # Derived from activity ideally
            topRecommendationCategory="Trending Styles"
        )
        
        # Calculate Profile Completion
        profile_data = base_profile.get("profileCompletion", {}) or {}
        total_fields = 9
        filled_fields = 0
        for key in ["gender", "age", "country", "hairLength", "hairType", "hairColor"]:
            if profile_data.get(key): filled_fields += 1
        for key in ["hairConcerns", "preferredStyles", "goals"]:
            if profile_data.get(key) and len(profile_data.get(key)) > 0: filled_fields += 1
            
        if profile_data.get("gender") != "Female":
            total_fields += 2
            if profile_data.get("beardStatus"): filled_fields += 1
            if profile_data.get("beardPreference"): filled_fields += 1
            
        calculated_percentage = int((filled_fields / total_fields) * 100) if total_fields > 0 else 0

        return ComprehensiveProfileResponse(
            uid=base_profile.get("uid"),
            email=base_profile.get("email"),
            displayName=base_profile.get("display_name"),
            joinedDate="Joined Recently", # Assuming timestamp not historically stored in auth profile
            userBadge=badge,
            profileCompletion=profile_data,
            completionPercentage=calculated_percentage,
            onboarding_completed=base_profile.get("onboarding_completed", False),
            profile_completed=base_profile.get("profile_completed", False),
            stats=stats,
            aiStyleProfile=ai_profile,
            hairInsightsSummary=insights_summary
        )
