import os
import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
from dotenv import load_dotenv

# Load environment variables from the backend .env file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"))

# --- Firebase Admin SDK Initialization ---
db = None
auth_client = None
storage_bucket = None

service_account_filename = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET")

# Build an absolute path to the service account file
service_account_path = os.path.join(BASE_DIR, service_account_filename) if service_account_filename else None

if service_account_path and os.path.exists(service_account_path):
    try:
        cred = credentials.Certificate(service_account_path)
        # Initialize the Firebase Admin app with Storage bucket config
        firebase_admin.initialize_app(cred, {"storageBucket": bucket_name})
        # Firestore
        db = firestore.client()
        print("[FIRESTORE] Connected")
        # Authentication
        auth_client = auth
        print("[AUTH] Connected")
        # Storage
        if bucket_name:
            storage_bucket = storage.bucket()
            print(f"[STORAGE] Connected (bucket: {bucket_name})")
        else:
            print("[STORAGE] Bucket not set – not initialized")
        print("=" * 50)
        print("Firebase Admin SDK fully initialized!")
        print(f"  Project: {cred.project_id}")
        print(f"  Service Account: {cred.service_account_email}")
        print("=" * 50)
    except Exception as e:
        print(f"[ERROR] Error initializing Firebase Admin: {e}")
else:
    print("[WARN] Service account JSON not found – running in mock mode.")
    if service_account_path:
        print(f"    Looked for: {service_account_path}")
    # In mock mode, db, auth_client, and storage_bucket remain None.
    # Handlers should fall back safely.
