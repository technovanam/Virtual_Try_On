import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, recommendations, history, saved_collections, ai_insights, tryon, notifications, search, trending, celebrity_matches, selfie, camera, analysis, hairstyles, compare, profile, settings, recommendation_engine, gemini, haircare, share_download

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
app.include_router(saved_collections.router, prefix="/saved", tags=["saved"])
app.include_router(ai_insights.router, prefix="/ai-insights", tags=["ai-insights"])
app.include_router(tryon.router, prefix="/tryon", tags=["tryon"])
app.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
app.include_router(search.router, prefix="/search", tags=["search"])
app.include_router(trending.router, prefix="/trending-hairstyles", tags=["trending"])
app.include_router(celebrity_matches.router, prefix="/celebrity-matches", tags=["celebrity-matches"])
app.include_router(selfie.router, prefix="/user/selfie", tags=["user", "selfie"])
app.include_router(camera.router, prefix="/camera", tags=["camera"])
app.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
app.include_router(hairstyles.router, prefix="/hairstyles", tags=["hairstyles"])
app.include_router(compare.router, prefix="/compare", tags=["compare"])
app.include_router(profile.router, prefix="/profile", tags=["profile"])
app.include_router(settings.router, prefix="/settings", tags=["settings"])
app.include_router(recommendation_engine.router, prefix="/recommendation", tags=["recommendation-engine"])
app.include_router(gemini.router, prefix="/gemini", tags=["gemini"])
app.include_router(haircare.router, prefix="/haircare", tags=["haircare"])
app.include_router(share_download.router, prefix="/track", tags=["tracking"])

@app.get("/")
def read_root():
    return {"message": "Welcome to HairVerse API"}
