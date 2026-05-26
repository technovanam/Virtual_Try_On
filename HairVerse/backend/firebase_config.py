import os
import firebase_admin
from firebase_admin import credentials, firestore, auth
from dotenv import load_dotenv

load_dotenv()

db = None
auth_client = None

service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")

if service_account_path and os.path.exists(service_account_path):
    try:
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("Firebase Admin successfully initialized with Service Account")
    except Exception as e:
        print(f"Error initializing Firebase Admin: {e}")
else:
    print("FIREBASE_SERVICE_ACCOUNT_JSON not found. Running in MOCK Mode.")
    # In mock mode, db and auth_client will remain None, and handlers should fall back safely.
