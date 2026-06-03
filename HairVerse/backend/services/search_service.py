from typing import List
from firebase_config import db
from schemas.search import SearchResult, SearchResponse

class SearchService:
    @staticmethod
    def global_search(uid: str, query: str) -> SearchResponse:
        if db is None:
            return SearchResponse(results=[], total=0, categories=[])
            
        if not query or query.strip() == "":
            # Return empty if no query provided
            return SearchResponse(results=[], total=0, categories=[])
            
        try:
            # We'll do a basic prefix search on the "hairstyles" collection
            # Note: Firestore prefix search requires matching exactly the case and starting letters
            query_str = query.strip()
            
            hairstyles_ref = db.collection("hairstyles")
            # Query for names starting with the query string
            # \uf8ff is a high surrogate to capture everything after the prefix
            docs = hairstyles_ref.where("name", ">=", query_str)\
                                 .where("name", "<=", query_str + '\uf8ff')\
                                 .limit(20).stream()
            
            results = []
            for doc in docs:
                data = doc.to_dict()
                result = SearchResult(
                    id=doc.id,
                    type="hairstyle",
                    title=data.get("name", "Unknown Hairstyle"),
                    image=data.get("imageUrl"),
                    category=data.get("category", "General"),
                    tags=data.get("tags", []),
                    popularityScore=data.get("popularityScore", 0)
                )
                results.append(result)
                
            # Categories could be dynamically fetched, but we return an empty array or basic suggestions
            # to match the empty state since we expect no data yet.
            suggested_categories = []
                
            return SearchResponse(
                results=results, 
                total=len(results),
                categories=suggested_categories
            )
            
        except Exception as e:
            print(f"[ERROR] Failed to perform global search for uid {uid}: {e}")
            raise e
