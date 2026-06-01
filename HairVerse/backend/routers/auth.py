from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from firebase_config import auth_client, db

router = APIRouter()

class ProfileUpdate(BaseModel):
    full_name: str
    age: int
    gender: str

class AuthTokenRequest(BaseModel):
    id_token: str

@router.post("/register")
async def register(request: AuthTokenRequest):
    if not auth_client:
        raise HTTPException(status_code=503, detail="Auth service not initialized")
    try:
        decoded = auth_client.verify_id_token(request.id_token)
        if db:
            db.collection("users").document(decoded.get("uid")).set({
                "uid": decoded.get("uid"),
                "email": decoded.get("email"),
                "name": decoded.get("name"),
                "last_login": datetime.utcnow().isoformat() + "Z",
                "created_at": decoded.get("iat")
            }, merge=True)
        return {"uid": decoded.get("uid"), "email": decoded.get("email")}
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

@router.post("/login")
async def login(request: AuthTokenRequest):
    if not auth_client:
        raise HTTPException(status_code=503, detail="Auth service not initialized")
    try:
        decoded = auth_client.verify_id_token(request.id_token)
        if db:
            db.collection("users").document(decoded.get("uid")).set({
                "uid": decoded.get("uid"),
                "email": decoded.get("email"),
                "name": decoded.get("name"),
                "last_login": datetime.utcnow().isoformat() + "Z"
            }, merge=True)
        return {"uid": decoded.get("uid"), "email": decoded.get("email")}
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

@router.post("/profile")
async def update_profile(profile: ProfileUpdate):
    return {"message": "Profile updated", "data": profile.model_dump()}
