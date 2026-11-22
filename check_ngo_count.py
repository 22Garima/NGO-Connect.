"""Optional Firestore NGO count checker; not needed by the matching API."""
from __future__ import annotations

import os
from pathlib import Path


def main():
    key_file = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    if not key_file or not Path(key_file).is_file():
        raise SystemExit("Set GOOGLE_APPLICATION_CREDENTIALS to a local service-account JSON file. No key is bundled in this project.")
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
    except ImportError as exc:
        raise SystemExit("Install firebase-admin with: py -m pip install firebase-admin") from exc
    if not firebase_admin._apps:
        firebase_admin.initialize_app(credentials.Certificate(key_file))
    db = firestore.client()
    docs = list(db.collection("ngos").stream())
    print("Total NGOs stored in Firestore:", len(docs))
    if docs:
        print("Sample NGO:", docs[0].to_dict())


if __name__ == "__main__":
    main()
