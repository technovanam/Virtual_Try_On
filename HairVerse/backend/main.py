from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, analysis, recommendations, tryon, export, notifications, admin, homepage

app = FastAPI(title="HairVerse API", description="AI-powered hairstyle virtual try-on API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
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

@app.get("/")
def read_root():
    return {"message": "Welcome to HairVerse API"}
