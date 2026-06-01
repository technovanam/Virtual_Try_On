import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, analysis, recommendations, tryon, export, notifications, admin, homepage, profile, hairstyles, saved

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
app.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
app.include_router(tryon.router, prefix="/tryon", tags=["tryon"])
app.include_router(export.router, prefix="/export", tags=["export"])
app.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(homepage.router, prefix="/homepage", tags=["homepage"])
app.include_router(profile.router, prefix="/profile", tags=["profile"])
app.include_router(hairstyles.router, prefix="/hairstyles", tags=["hairstyles"])
app.include_router(saved.router, prefix="/saved", tags=["saved"])

@app.get("/")
def read_root():
    return {"message": "Welcome to HairVerse API"}
