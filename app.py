"""NGOConnect matching API.

Content-based recommendations using TF-IDF and cosine similarity,
combined with explainable category, location, quantity and availability signals.
This is not a supervised classifier and does not claim calibrated probabilities.
"""
from __future__ import annotations

import math
import os
import re
from functools import lru_cache
from pathlib import Path
from typing import Any

import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset" / "Final_NGO_Model_Training_Dataset_1000.new.xlsx"
DATASET_SHEET = "All NGOs"

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024
# Local development origins. Configure a restricted origin list before deployment.
CORS(app, resources={r"/api/*": {"origins": [
    "http://127.0.0.1:5500", "http://localhost:5500",
    "http://127.0.0.1:5501", "http://localhost:5501",
    "http://127.0.0.1:5000", "http://localhost:5000",
]}})


# Help categories from individual.html mapped to the closest official NGO directory sectors.
HELP_SECTOR_MAP: dict[str, list[str]] = {
    "food": [
        "Food Processing", "Nutrition", "Agriculture", "Disaster Management",
        "Rural Development & Poverty Alleviation", "Drinking Water",
    ],
    "medical help": [
        "Health & Family Welfare", "HIV/AIDS", "Differently Abled",
        "Nutrition", "Aged/Elderly",
    ],
    "medical": [
        "Health & Family Welfare", "HIV/AIDS", "Differently Abled",
        "Nutrition", "Aged/Elderly",
    ],
    "health": [
        "Health & Family Welfare", "HIV/AIDS", "Differently Abled",
        "Nutrition", "Aged/Elderly",
    ],
    "education": [
        "Education & Literacy", "Children", "Youth Affairs",
        "Skill Development", "Vocational Training",
    ],
    "shelter": [
        "Housing", "Disaster Management", "Rural Development & Poverty Alleviation",
        "Urban Development & Poverty Alleviation", "Aged/Elderly",
    ],
    "financial help": [
        "Micro Finance (SHGs)", "Rural Development & Poverty Alleviation",
        "Labour & Employment", "Micro Small & Medium Enterprises",
        "Women's Development & Empowerment",
    ],
    "financial assistance": [
        "Micro Finance (SHGs)", "Rural Development & Poverty Alleviation",
        "Labour & Employment", "Micro Small & Medium Enterprises",
        "Women's Development & Empowerment",
    ],
    "clothes": [
        "Disaster Management", "Rural Development & Poverty Alleviation",
        "Urban Development & Poverty Alleviation", "Children",
        "Women's Development & Empowerment",
    ],
}

HELP_EXPANSIONS: dict[str, str] = {
    "food": "food packets meals ration nutrition food processing agriculture relief",
    "medical help": "medical healthcare health treatment hospital medicine patient disability nutrition",
    "medical": "medical healthcare health treatment hospital medicine patient disability nutrition",
    "health": "medical healthcare health treatment hospital medicine patient disability nutrition",
    "education": "school learning literacy students children education skills vocational training",
    "shelter": "housing accommodation home homeless disaster relief rehabilitation shelter",
    "financial help": "financial assistance livelihood micro finance poverty employment self help groups",
    "financial assistance": "financial assistance livelihood micro finance poverty employment self help groups",
    "clothes": "clothing garments apparel distribution disaster relief children women",
    "other": "community welfare social support assistance development",
}

# Common city/district aliases used in the supplied dataset.
LOCATION_STATE_ALIASES = {
    "noida": "uttar pradesh",
    "greater noida": "uttar pradesh",
    "gb nagar": "uttar pradesh",
    "g b nagar": "uttar pradesh",
    "gurgaon": "haryana",
    "gurugram": "haryana",
    "chandigarh": "chandigarh",
}

LOCATION_ALIASES = {
    "noida": "gautam buddha nagar",
    "greater noida": "gautam buddha nagar",
    "gb nagar": "gautam buddha nagar",
    "g b nagar": "gautam buddha nagar",
    "new delhi": "delhi",
    "central delhi": "delhi",
    "south delhi": "delhi",
    "north delhi": "delhi",
    "east delhi": "delhi",
    "west delhi": "delhi",
    "delhi ncr": "delhi",
    "gurgaon": "gurugram",
    "bangalore": "bengaluru",
    "bombay": "mumbai",
    "madras": "chennai",
    "calcutta": "kolkata",
}


def clean(value: Any) -> str:
    """Convert values safely to plain text, avoiding NaN/None in API output."""
    if value is None:
        return ""
    try:
        if pd.isna(value):
            return ""
    except (TypeError, ValueError):
        pass
    if isinstance(value, float) and not math.isfinite(value):
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


def norm(value: Any) -> str:
    text = clean(value).casefold()
    text = re.sub(r"[^a-z0-9& ]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def canonical_location(value: Any) -> str:
    text = norm(value)
    if not text:
        return ""
    return LOCATION_ALIASES.get(text, text)


def location_score(request_location: Any, candidate_location: Any, candidate_state: Any = "") -> float:
    """Return text-based location relevance (not a measured geographic distance).

    Handles entries such as "Noida, Uttar Pradesh" against the NGO directory's
    district/state fields, including common city-to-district aliases.
    """
    raw_parts = [part for part in re.split(r"[,/|]+", clean(request_location)) if part.strip()]
    left_values = {canonical_location(part) for part in raw_parts}
    left_values.add(canonical_location(request_location))
    left_values.discard("")
    inferred_states = {
        LOCATION_STATE_ALIASES.get(norm(part), "")
        for part in raw_parts
    }
    inferred_states.discard("")
    inferred_states.add(LOCATION_STATE_ALIASES.get(norm(request_location), ""))
    inferred_states.discard("")

    right_values = {canonical_location(candidate_location), canonical_location(candidate_state)}
    right_values.discard("")
    if not left_values or not right_values:
        return 0.0

    best = 0.0
    if canonical_location(candidate_state) in inferred_states:
        best = 0.72
    for left in left_values:
        for right in right_values:
            if left == right:
                best = max(best, 1.0)
                continue
            if left in right or right in left:
                best = max(best, 0.9)
                continue
            lt, rt = set(left.split()), set(right.split())
            if lt and rt:
                overlap = len(lt & rt) / max(1, len(lt | rt))
                if overlap:
                    best = max(best, min(0.85, 0.45 + overlap * 0.4))
    return best


def canonical_resource(value: Any) -> str:
    text = norm(value)
    aliases = {
        "food packets": "food", "food supplies": "food", "ration": "food",
        "clothing": "clothes", "garments": "clothes",
        "medicine": "medicines", "medical supplies": "medicines",
        "volunteer": "volunteers",
    }
    return aliases.get(text, text)


def _individual_request_text(user: dict[str, Any]) -> str:
    help_type = clean(user.get("helpType"))
    expansion = HELP_EXPANSIONS.get(norm(help_type), "")
    return " ".join(filter(None, [
        help_type,
        expansion,
        clean(user.get("additionalInfo")),
        clean(user.get("location")),
        clean(user.get("urgency")),
    ]))


def _ngo_profile_text(candidate: dict[str, Any]) -> str:
    return " ".join(filter(None, [
        clean(candidate.get("ngoName")),
        clean(candidate.get("ngoType")),
        clean(candidate.get("sectors")),
        clean(candidate.get("address")),
        clean(candidate.get("districtName")),
        clean(candidate.get("subDstName")),
        clean(candidate.get("stateName")),
    ]))


def _sector_score(help_type: Any, sectors: Any) -> float:
    key = norm(help_type)
    sector_text = norm(sectors)
    if not key or not sector_text:
        return 0.0
    related = HELP_SECTOR_MAP.get(key, [])
    if not related:
        return 0.0
    found = [sector for sector in related if norm(sector) in sector_text]
    if not found:
        return 0.0
    # A clear sector hit gets full category relevance. A profile listing many
    # unrelated sectors is still relevant, but the text score helps rank specificity.
    return 1.0 if len(found) == 1 else min(1.0, 0.85 + 0.05 * len(found))


def _availability_score(value: Any) -> float:
    text = norm(value)
    if not text:
        return 0.35  # Unknown availability is neutral, not a rejection.
    if any(term in text for term in ("not available", "unavailable", "out of stock", "not in stock")):
        return 0.0
    if "available soon" in text or "limited" in text:
        return 0.6
    if any(term in text for term in ("available", "immediate", "ready", "in stock")):
        return 1.0
    return 0.35


def _float_number(value: Any) -> float | None:
    try:
        number = float(str(value).replace(",", "").strip())
        return number if math.isfinite(number) else None
    except (TypeError, ValueError):
        return None


def _similarities(query_text: str, candidate_texts: list[str]) -> list[float]:
    texts = [query_text] + candidate_texts
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        stop_words="english",
        sublinear_tf=True,
        strip_accents="unicode",
    )
    try:
        matrix = vectorizer.fit_transform(texts)
        values = cosine_similarity(matrix[0:1], matrix[1:]).ravel()
        return [float(max(0.0, min(1.0, value))) for value in values]
    except ValueError:
        return [0.0] * len(candidate_texts)


def rank_individual_to_ngos(user: dict[str, Any], candidates: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not candidates:
        return []

    help_type = clean(user.get("helpType"))
    query_text = _individual_request_text(user)
    candidate_texts = [_ngo_profile_text(candidate) for candidate in candidates]
    text_scores = _similarities(query_text, candidate_texts)

    ranked: list[dict[str, Any]] = []
    local_ranked: list[dict[str, Any]] = []
    for candidate, text_score in zip(candidates, text_scores):
        sectors = clean(candidate.get("sectors"))
        district = clean(candidate.get("districtName"))
        state = clean(candidate.get("stateName"))
        address = clean(candidate.get("address"))
        subdistrict = clean(candidate.get("subDstName"))
        # Evaluate district/address and state separately so city aliases such as
        # Noida -> Gautam Buddha Nagar can resolve against districtName.
        loc = max(
            location_score(user.get("location"), district, state),
            location_score(user.get("location"), address, state) * 0.9,
            location_score(user.get("location"), subdistrict, state) * 0.85,
        )
        sector = _sector_score(help_type, sectors)

        # Keep only plausible profiles. A matching focus sector or meaningful
        # text relevance is required; a location-only result is not a suitable NGO match.
        if sector <= 0 and text_score < 0.045:
            continue

        # Content relevance, mapped area of work and locality jointly determine rank.
        score = (0.58 * text_score) + (0.27 * sector) + (0.15 * loc)
        reasons: list[str] = []
        if sector > 0:
            reasons.append("NGO focus areas are related to the help you selected")
        if loc >= 0.85:
            reasons.append("NGO is listed in your district or nearby area")
        elif loc > 0:
            reasons.append("NGO location has a regional match")
        if text_score >= 0.06:
            reasons.append("NGO profile is relevant to the details you provided")
        if not reasons:
            reasons.append("NGO profile is relevant to your request")

        item = {
            "id": clean(candidate.get("ngoId") or candidate.get("darpanId")),
            "darpanId": clean(candidate.get("darpanId")),
            "name": clean(candidate.get("ngoName")) or "Registered NGO",
            "resource": sectors or "Focus areas not listed",
            "focusAreas": sectors or "Focus areas not listed",
            "district": district or "Not listed",
            "state": state or "Not listed",
            "location": ", ".join(part for part in (district, state) if part) or address or "Location not listed",
            "quantity": "Not applicable",
            "matchScore": round(max(0.0, min(1.0, score)) * 100),
            "similarity": round(text_score * 100, 1),
            "reasons": reasons,
            "contact": "The directory does not provide verified contact details or current service availability.",
            "_locationScore": loc,
        }
        ranked.append(item)
        if loc >= 0.85 and sector > 0:
            local_ranked.append(item)

    # When the directory has suitable NGOs in the requested district/city,
    # show those first instead of filling the page with distant organisations.
    # If the locality has no sector-relevant NGO, fall back to the wider directory.
    selected = local_ranked if local_ranked else ranked
    selected.sort(key=lambda item: (item["matchScore"], item["similarity"]), reverse=True)
    for item in selected:
        item.pop("_locationScore", None)
    return selected[:20]


def _resource_candidate_text(record: dict[str, Any]) -> str:
    return " ".join(filter(None, [
        clean(record.get("resource")),
        clean(record.get("additionalInfo")),
        clean(record.get("description")),
        clean(record.get("location")),
        clean(record.get("availability")),
    ]))


def rank_ngo_provider(user: dict[str, Any], candidates: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not candidates:
        return []

    role = clean(user.get("type"))
    resource = canonical_resource(user.get("resource"))
    query = " ".join(filter(None, [
        clean(user.get("resource")),
        clean(user.get("additionalInfo")),
        clean(user.get("location")),
        clean(user.get("urgency")),
        clean(user.get("availability")),
    ]))
    candidate_texts = [_resource_candidate_text(candidate) for candidate in candidates]
    text_scores = _similarities(query, candidate_texts)

    ranked: list[dict[str, Any]] = []
    for candidate, text_score in zip(candidates, text_scores):
        candidate_resource = canonical_resource(candidate.get("resource"))
        resource_match = 1.0 if resource and candidate_resource and resource == candidate_resource else 0.0
        # Do not recommend a clearly different resource category.
        if resource and candidate_resource and not resource_match:
            continue

        loc = location_score(user.get("location"), candidate.get("location"))
        if role == "Provider":
            # The provider is offering user.quantity to satisfy candidate.quantity.
            available = _float_number(user.get("quantity"))
            required = _float_number(candidate.get("quantity"))
        else:
            # The NGO is requesting user.quantity from candidate.quantity.
            required = _float_number(user.get("quantity"))
            available = _float_number(candidate.get("quantity"))

        qty_score = 0.35
        quantity_reason = "Quantity could not be compared"
        if required is not None and required > 0 and available is not None:
            qty_score = min(1.0, max(0.0, available / required))
            if available >= required:
                quantity_reason = "Sufficient quantity available"
            else:
                quantity_reason = "Some of the requested quantity is available"

        availability_value = candidate.get("availability")
        if role == "Provider":
            # For provider-to-NGO, the provider's own availability is on the request side.
            availability_value = user.get("availability")
        availability = _availability_score(availability_value)

        # Weights add to 100%; score is a ranking index, not a probability.
        final = (
            0.42 * text_score
            + 0.28 * resource_match
            + 0.16 * loc
            + 0.10 * qty_score
            + 0.04 * availability
        )
        reasons: list[str] = []
        if text_score >= 0.05:
            reasons.append("Details are relevant to your request")
        if resource_match:
            reasons.append("Resource category matches")
        if loc >= 0.85:
            reasons.append("Location is a good match")
        elif loc > 0:
            reasons.append("Location has some regional overlap")
        if required is not None and required > 0 and available is not None:
            reasons.append(quantity_reason)
        if availability_value:
            availability_text = clean(availability_value)
            if availability >= 0.9:
                reasons.append(f"Provider availability: {availability_text}")
            elif availability <= 0.01:
                reasons.append("Provider has marked this resource as unavailable")
            else:
                reasons.append(f"Availability: {availability_text}")
        if not reasons:
            reasons.append("Recommended based on the available request details")

        name = clean(candidate.get("name") or candidate.get("ngoName"))
        if not name:
            name = "NGO request" if role == "Provider" else "Available resource"

        ranked.append({
            "id": clean(candidate.get("id")),
            "name": name,
            "resource": clean(candidate.get("resource")) or "Not specified",
            "location": clean(candidate.get("location")) or "Not specified",
            "quantity": clean(candidate.get("quantity")) or "Not specified",
            "availability": clean(candidate.get("availability")) or "Not specified",
            "matchScore": round(max(0.0, min(1.0, final)) * 100),
            "similarity": round(text_score * 100, 1),
            "reasons": reasons,
        })

    ranked.sort(key=lambda item: (item["matchScore"], item["similarity"]), reverse=True)
    return ranked[:20]


@lru_cache(maxsize=1)
def load_ngos() -> tuple[dict[str, Any], ...]:
    """Load and cache the supplied 1,000-row NGO directory."""
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"NGO dataset not found: {DATASET_PATH}")
    frame = pd.read_excel(DATASET_PATH, sheet_name=DATASET_SHEET)
    required = {"ngoId", "ngoName", "districtName", "stateName", "sectors"}
    missing = required.difference(frame.columns)
    if missing:
        raise ValueError("NGO dataset is missing required columns: " + ", ".join(sorted(missing)))
    frame = frame.where(pd.notna(frame), None)
    records = frame.to_dict(orient="records")
    return tuple(records)


def rank_records(payload: dict[str, Any]) -> list[dict[str, Any]]:
    user = payload.get("request") or {}
    candidates = payload.get("candidates") or []
    if clean(user.get("type")) == "Individual":
        return rank_individual_to_ngos(user, candidates)
    return rank_ngo_provider(user, candidates)


@app.get("/api/health")
def health():
    try:
        ngo_count = len(load_ngos())
        dataset_status = "available"
    except Exception:
        ngo_count = 0
        dataset_status = "unavailable"
    return jsonify({
        "status": "ok",
        "engine": "TF-IDF + cosine similarity + contextual ranking",
        "ngoDirectoryRecords": ngo_count,
        "ngoDirectoryStatus": dataset_status,
    })


@app.post("/api/match")
def match():
    payload = request.get_json(silent=True) or {}
    user = payload.get("request") or {}
    role = clean(user.get("type"))
    if role not in {"NGO", "Provider", "Individual"}:
        return jsonify({"error": "Request type must be NGO, Provider or Individual."}), 400

    try:
        if role == "Individual":
            candidates = list(load_ngos())
        else:
            candidates = payload.get("candidates") or []
            if not isinstance(candidates, list):
                return jsonify({"error": "Candidates must be a list of Firestore records."}), 400
        results = rank_records({"request": user, "candidates": candidates})
        return jsonify({
            "matches": results,
            "count": len(results),
            "method": "Content-based recommendation with contextual ranking",
            "role": role,
        })
    except FileNotFoundError as exc:
        app.logger.exception("NGO directory file missing")
        return jsonify({"error": str(exc)}), 500
    except Exception as exc:  # Return useful diagnostics without exposing a traceback.
        app.logger.exception("Matching request failed")
        return jsonify({"error": f"Matching could not be completed: {exc}"}), 500


if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", "5000")), debug=debug)
