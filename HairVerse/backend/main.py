import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, recommendations, history, saved_collections, ai_insights, tryon, notifications, search

app = FastAPI(title="HairVerse API", description="AI-powered hairstyle virtual try-on API")

raw_origins = os.getenv("CORS_ALLOW_ORIGINS", "*")
allowed_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
allow_credentials = "*" not in allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["*"],
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
app.include_router(history.router, prefix="/history", tags=["history"])
app.include_router(saved_collections.router, prefix="/saved-collections", tags=["saved-collections"])
app.include_router(ai_insights.router, prefix="/ai-insights", tags=["ai-insights"])
app.include_router(tryon.router, prefix="/tryon", tags=["tryon"])
app.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
app.include_router(search.router, prefix="/search", tags=["search"])

@app.get("/")
def read_root():
    return {"message": "Welcome to HairVerse API"}
