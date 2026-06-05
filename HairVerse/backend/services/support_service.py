from datetime import datetime
from typing import List
from firebase_config import db
from schemas.support_schemas import FAQItem, TicketRequest, TicketResponse, FeedbackRequest

class SupportServiceError(Exception):
    pass

DEFAULT_FAQS = [
    {
        "category": "Login Issues",
        "question": "I forgot my password. How do I reset it?",
        "answer": "Go to the Settings page, tap 'Account', and select 'Change Password' to receive a reset link."
    },
    {
        "category": "AI Analysis Issues",
        "question": "Why did my hair analysis fail?",
        "answer": "Ensure your photo is well-lit and your hair is clearly visible. Blurry or dark photos may cause the AI to fail."
    },
    {
        "category": "Try-On Issues",
        "question": "The generated hairstyle looks unnatural.",
        "answer": "Try-On results depend heavily on the source image. For best results, use a photo where you are facing forward with your hair pulled back."
    },
    {
        "category": "Export Issues",
        "question": "Why can't I download my image in Ultra HD?",
        "answer": "Ultra HD (4K) exports are currently a HairVerse Pro feature. Standard and HD downloads are available for free."
    },
    {
        "category": "Account Issues",
        "question": "How do I delete my account?",
        "answer": "Navigate to Settings > Privacy & Security to delete your account. This action is permanent."
    }
]

class SupportService:
    @staticmethod
    def _seed_faqs_if_empty():
        if db is None:
            return
            
        try:
            faqs_ref = db.collection("support_faqs")
            # Limit 1 just to check if collection exists and has documents
            docs = faqs_ref.limit(1).stream()
            has_docs = False
            for _ in docs:
                has_docs = True
                break
                
            if not has_docs:
                batch = db.batch()
                for faq in DEFAULT_FAQS:
                    new_ref = faqs_ref.document()
                    batch.set(new_ref, {
                        "id": new_ref.id,
                        "category": faq["category"],
                        "question": faq["question"],
                        "answer": faq["answer"]
                    })
                batch.commit()
                print("[INFO] Seeded default FAQs into Firestore.")
        except Exception as e:
            print(f"[ERROR] Failed to seed FAQs: {e}")

    @staticmethod
    def get_faqs() -> List[FAQItem]:
        if db is None:
            return []
            
        SupportService._seed_faqs_if_empty()
            
        try:
            faqs_ref = db.collection("support_faqs")
            docs = faqs_ref.stream()
            
            faqs = []
            for doc in docs:
                data = doc.to_dict()
                faqs.append(FAQItem(
                    id=data.get("id", doc.id),
                    category=data.get("category", "General"),
                    question=data.get("question", ""),
                    answer=data.get("answer", "")
                ))
            return faqs
        except Exception as e:
            raise SupportServiceError(f"Failed to fetch FAQs: {e}")

    @staticmethod
    def create_ticket(uid: str, request: TicketRequest) -> TicketResponse:
        if db is None:
            raise SupportServiceError("Firestore not initialized.")
            
        try:
            ticket_ref = db.collection("users").document(uid).collection("supportTickets").document()
            now = datetime.now()
            
            ticket_data = {
                "ticketId": ticket_ref.id,
                "category": request.category,
                "title": request.title,
                "description": request.description,
                "screenshotUrl": request.screenshotUrl,
                "status": "open",
                "createdAt": now,
                "updatedAt": now
            }
            
            ticket_ref.set(ticket_data)
            
            return TicketResponse(**ticket_data)
        except Exception as e:
            raise SupportServiceError(f"Failed to create support ticket: {e}")

    @staticmethod
    def get_user_tickets(uid: str) -> List[TicketResponse]:
        if db is None:
            return []
            
        try:
            tickets_ref = db.collection("users").document(uid).collection("supportTickets")
            docs = tickets_ref.order_by("createdAt", direction="DESCENDING").stream()
            
            tickets = []
            for doc in docs:
                data = doc.to_dict()
                tickets.append(TicketResponse(**data))
            return tickets
        except Exception as e:
            raise SupportServiceError(f"Failed to fetch user tickets: {e}")

    @staticmethod
    def submit_feedback(uid: str, request: FeedbackRequest) -> dict:
        if db is None:
            raise SupportServiceError("Firestore not initialized.")
            
        try:
            feedback_ref = db.collection("users").document(uid).collection("feedback").document()
            now = datetime.now()
            
            feedback_data = {
                "feedbackId": feedback_ref.id,
                "type": request.type,
                "message": request.message,
                "rating": request.rating,
                "createdAt": now
            }
            
            feedback_ref.set(feedback_data)
            
            return {"success": True, "feedbackId": feedback_ref.id}
        except Exception as e:
            raise SupportServiceError(f"Failed to submit feedback: {e}")
