"""Validate the 1,000-NGO workbook used by Individual-to-NGO matching."""
from pathlib import Path
import pandas as pd

FILE = Path(__file__).resolve().parent / "Final_NGO_Model_Training_Dataset_1000.new.xlsx"
REQUIRED = [
    "ngoId", "darpanId", "ngoName", "ngoType", "registrationNo",
    "districtName", "stateName", "address", "pinCode", "subDstName",
    "sectors", "longitude", "latitude", "lastUpdateOn", "migrated",
]


def main():
    if not FILE.exists():
        raise SystemExit(f"Dataset not found: {FILE}")
    frame = pd.read_excel(FILE, sheet_name="All NGOs")
    print("Rows:", len(frame))
    print("Columns:", len(frame.columns))
    print("Missing required columns:", [column for column in REQUIRED if column not in frame.columns])
    if "ngoId" in frame:
        print("Duplicate NGO IDs:", frame["ngoId"].dropna().duplicated().sum())
    if "ngoName" in frame:
        print("Missing NGO names:", frame["ngoName"].isna().sum())
    print("\nValidation complete.")


if __name__ == "__main__":
    main()
