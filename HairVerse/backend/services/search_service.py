from typing import List, Optional
from firebase_config import db
from schemas.search import SearchResult, SearchResponse, TrendingResponse, CategoriesResponse
import math

class SearchService:
    @staticmethod
    def global_search(uid: str, query: str, category: Optional[str] = None, gender: Optional[str] = None, page: int = 1, limit: int = 20) -> SearchResponse:
        if db is None:
            return SearchResponse(results=[], total=0, page=page, limit=limit, totalPages=0, categories=[])
            
        try:
            hairstyles_ref = db.collection("hairstyles")
            query_ref = hairstyles_ref
            
            # Apply equality filters first (Firestore requirement)
            if category:
                query_ref = query_ref.where("category", "==", category)
            if gender:
                query_ref = query_ref.where("gender", "==", gender)
                
            # Then apply range filters or orderings
            query_str = query.strip() if query else ""
            if query_str:
                query_ref = query_ref.where("hairstyleName", ">=", query_str)\
                                     .where("hairstyleName", "<=", query_str + '\uf8ff')
            else:
                # If no query, order by popularityScore descending
                query_ref = query_ref.order_by("popularityScore", direction="DESCENDING")

            # Note: For simple implementation without cursor, we fetch all and paginate in memory
            # For production with millions of docs, cursor pagination must be implemented
            # Let's fetch a reasonable maximum and paginate in memory to allow combined filtering properly
            docs = query_ref.limit(200).stream()
            
            all_results = []
            for doc in docs:
                data = doc.to_dict()
                result = SearchResult(
                    id=doc.id,
                    type="hairstyle",
                    title=data.get("hairstyleName", data.get("name", "Unknown Hairstyle")),
                    image=data.get("imageUrl"),
                    category=data.get("category", "General"),
                    tags=data.get("tags", []),
                    popularityScore=data.get("popularityScore", 0)
                )
                all_results.append(result)
                
            total = len(all_results)
            total_pages = math.ceil(total / limit) if limit > 0 else 1
            
            start_idx = (page - 1) * limit
            end_idx = start_idx + limit
            paginated_results = all_results[start_idx:end_idx]
            
            suggested_categories = SearchService.get_categories().categories
                
            return SearchResponse(
                results=paginated_results, 
                total=total,
                page=page,
                limit=limit,
                totalPages=total_pages,
                categories=suggested_categories
            )
            
        except Exception as e:
            print(f"[ERROR] Failed to perform global search for uid {uid}: {e}")
            raise e

    @staticmethod
    def get_trending() -> TrendingResponse:
        # In a real app, this would query a "trending_searches" collection or analytics
        # Returning backend-driven static list for now as per requirements
        trends = ["Korean Perm", "Low Fade", "Buzz Cut", "Wolf Cut", "French Crop", "Balayage", "Mullet"]
        return TrendingResponse(trends=trends)

    @staticmethod
    def get_categories() -> CategoriesResponse:
        # Categories driven by backend
        categories = ["Korean", "Fade", "Buzz Cut", "Curly", "Professional", "Beard", "Hair Colors", "Short", "Long"]
        return CategoriesResponse(categories=categories)
