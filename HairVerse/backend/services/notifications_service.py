from typing import List
from firebase_config import db
from schemas.notifications import Notification, NotificationResponse
from datetime import datetime

class NotificationsService:
    @staticmethod
    def get_notifications(uid: str) -> NotificationResponse:
        if db is None:
            return NotificationResponse(notifications=[], unreadCount=0)
            
        try:
            notifications_ref = db.collection("users").document(uid).collection("notifications")
            docs = notifications_ref.order_by("createdAt", direction="DESCENDING").limit(20).stream()
            
            notifications = []
            unread_count = 0
            
            for doc in docs:
                data = doc.to_dict()
                
                # Handle possible timestamp types
                def parse_timestamp(ts_raw):
                    ts = datetime.now()
                    if hasattr(ts_raw, 'timestamp'):
                        ts = datetime.fromtimestamp(ts_raw.timestamp())
                    elif isinstance(ts_raw, str):
                        try:
                            ts = datetime.fromisoformat(ts_raw.replace('Z', '+00:00'))
                        except ValueError:
                            pass
                    return ts

                created_at = parse_timestamp(data.get("createdAt"))
                is_read = data.get("isRead", False)
                
                if not is_read:
                    unread_count += 1
                
                notification = Notification(
                    notificationId=data.get("notificationId", doc.id),
                    title=data.get("title", "Notification"),
                    message=data.get("message", ""),
                    type=data.get("type", "info"),
                    isRead=is_read,
                    actionUrl=data.get("actionUrl"),
                    createdAt=created_at,
                    priority=data.get("priority", "normal")
                )
                notifications.append(notification)
                
            return NotificationResponse(notifications=notifications, unreadCount=unread_count)
            
        except Exception as e:
            print(f"[ERROR] Failed to fetch Notifications for uid {uid}: {e}")
            raise e

    @staticmethod
    def mark_as_read(uid: str, notification_id: str) -> bool:
        if db is None:
            return False
            
        try:
            doc_ref = db.collection("users").document(uid).collection("notifications").document(notification_id)
            doc_ref.update({"isRead": True})
            return True
        except Exception as e:
            print(f"[ERROR] Failed to mark notification {notification_id} as read for uid {uid}: {e}")
            raise e

    @staticmethod
    def delete_notification(uid: str, notification_id: str) -> bool:
        if db is None:
            return False
            
        try:
            doc_ref = db.collection("users").document(uid).collection("notifications").document(notification_id)
            doc_ref.delete()
            return True
        except Exception as e:
            print(f"[ERROR] Failed to delete notification {notification_id} for uid {uid}: {e}")
            raise e
