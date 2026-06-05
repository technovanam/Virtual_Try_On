from fastapi import APIRouter, Depends, HTTPException
from typing import List
from middleware.auth_middleware import get_current_user
from schemas.support_schemas import FAQItem, TicketRequest, TicketResponse, FeedbackRequest
from services.support_service import SupportService, SupportServiceError

router = APIRouter()

@router.get("/faqs", response_model=List[FAQItem])
async def get_faqs(current_user: dict = Depends(get_current_user)):
    """Fetch global FAQs."""
    try:
        # Note: uid is extracted to verify auth, but FAQs are global
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        return SupportService.get_faqs()
    except SupportServiceError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tickets", response_model=TicketResponse)
async def create_ticket(request: TicketRequest, current_user: dict = Depends(get_current_user)):
    """Submit a new support ticket."""
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        return SupportService.create_ticket(uid, request)
    except SupportServiceError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tickets", response_model=List[TicketResponse])
async def get_tickets(current_user: dict = Depends(get_current_user)):
    """Fetch user's support ticket history."""
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        return SupportService.get_user_tickets(uid)
    except SupportServiceError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/feedback")
async def submit_feedback(request: FeedbackRequest, current_user: dict = Depends(get_current_user)):
    """Submit user feedback."""
    try:
        uid = current_user.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid user authentication")
            
        return SupportService.submit_feedback(uid, request)
    except SupportServiceError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
