from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class FAQItem(BaseModel):
    id: str
    category: str
    question: str
    answer: str

class TicketRequest(BaseModel):
    category: str
    title: str
    description: str
    screenshotUrl: Optional[str] = None

class TicketResponse(BaseModel):
    ticketId: str
    category: str
    title: str
    description: str
    status: str # "open", "pending", "resolved"
    createdAt: datetime
    updatedAt: datetime

class FeedbackRequest(BaseModel):
    type: str
    message: str
    rating: int # 1 to 5
