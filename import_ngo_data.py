"""Optional one-time utility to copy the supplied NGO directory into Firestore.

The matching API reads the Excel workbook locally, so this import is not required
for the Individual-to-NGO recommendation workflow.

If you intentionally want to import the directory, install firebase-admin and set
GOOGLE_APPLICATION_CREDENTIALS to a locally stored service-account JSON path.
Never commit that key or include it in a shared ZIP.
"""
from __future__ import annotations

import math
import os
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
EXCEL_FILE = BASE_DIR / "dataset" / "Final_NGO_Model_Training_Dataset_1000.new.xlsx"


def clean_value(value):
    if pd.isna(value):
        return None
    if isinstance(value, pd.Timestamp):
        return value.to_pydatetime()
    if hasattr(value, "item"):
        value = value.item()
    if isinstance(value, float) and not math.isfinite(value):
        return None
    return value


def main():
    key_file = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    if not key_file or not Path(key_file).is_file():
        raise SystemExit(
            "Optional import cancelled: set GOOGLE_APPLICATION_CREDENTIALS to a "
            "local service-account JSON file. This file is not bundled. "
            "The matching API already reads the Excel directory directly."
        )
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
    except ImportError as exc:
        raise SystemExit("Install firebase-admin only if you need this optional import: py -m pip install firebase-admin") from exc

    if not EXCEL_FILE.exists():
        raise FileNotFoundError(f"Excel dataset not found: {EXCEL_FILE}")

    if not firebase_admin._apps:
        firebase_admin.initialize_app(credentials.Certificate(key_file))
    db = firestore.client()
    df = pd.read_excel(EXCEL_FILE, sheet_name="All NGOs")
    collection_ref = db.collection("ngos")
    imported = skipped = 0
    batch = db.batch()
    batch_count = 0

    for _, row in df.iterrows():
        ngo_id = str(row.get("ngoId", "")).strip()
        if not ngo_id or ngo_id.lower() == "nan":
            skipped += 1
            continue
        doc_ref = collection_ref.document(ngo_id)
        if doc_ref.get().exists:
            skipped += 1
            continue
        data = {column: clean_value(value) for column, value in row.items()}
        data["importedAt"] = datetime.now(timezone.utc)
        batch.set(doc_ref, data)
        imported += 1
        batch_count += 1
        if batch_count >= 400:
            batch.commit()
            batch = db.batch()
            batch_count = 0
    if batch_count:
        batch.commit()
    print(f"NGO records in workbook: {len(df)}")
    print(f"New records imported: {imported}")
    print(f"Existing/invalid records skipped: {skipped}")
    print("Firestore collection: ngos")


if __name__ == "__main__":
    main()
