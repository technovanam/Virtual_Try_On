import os
import firebase_admin
from firebase_admin import credentials, firestore, auth

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
service_account_filename = "firebase-service-account.json"
service_account_path = os.path.join(BASE_DIR, service_account_filename)

if not os.path.exists(service_account_path):
    print(f"Error: {service_account_path} not found.")
    exit(1)

print(f"Using service account: {service_account_path}")
cred = credentials.Certificate(service_account_path)
firebase_admin.initialize_app(cred)

db = firestore.client()

def delete_collection(coll_ref, batch_size=100):
    docs = list(coll_ref.limit(batch_size).stream())
    deleted = 0

    for doc in docs:
        # Delete subcollections first
        subcollections = list(doc.reference.collections())
        for subcoll in subcollections:
            delete_collection(subcoll, batch_size)
        
        doc.reference.delete()
        print(f"Deleted doc: {doc.id} from collection: {coll_ref.id}")
        deleted += 1

    if deleted >= batch_size:
        return delete_collection(coll_ref, batch_size)

print("--- Clearing Firestore Collections ---")
collections = list(db.collections())
if not collections:
    print("No Firestore collections found.")
else:
    for col in collections:
        print(f"Clearing collection: {col.id}")
        delete_collection(col)

print("\n--- Clearing Firebase Auth Users ---")
users_deleted = 0
page = auth.list_users()
while page:
    uids = [user.uid for user in page.users]
    if uids:
        # Batch delete users
        result = auth.delete_users(uids)
        for uid in uids:
            print(f"Deleted Auth User: {uid}")
            users_deleted += 1
        print(f"Batch delete status: successes={len(result.errors) == 0}, errors={len(result.errors)}")
    page = page.get_next_page()

print(f"\nDone! Successfully cleared Firestore and deleted {users_deleted} auth users.")
