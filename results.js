import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// For local development, Flask runs on port 5000. For deployment, set
// window.NGOCONNECT_API_BASE_URL before this module is loaded.
const API_BASE_URL = window.NGOCONNECT_API_BASE_URL || "http://127.0.0.1:5000";
const API_URL = `${API_BASE_URL.replace(/\/$/, "")}/api/match`;

const byId = (id) => document.getElementById(id);

function setText(id, value) {
    const element = byId(id);
    if (element) element.textContent = value === undefined || value === null || value === "" ? "Not specified" : String(value);
}

function showState(message, kind = "info") {
    const container = document.querySelector(".matches-grid");
    if (!container) return;
    container.replaceChildren();
    const panel = document.createElement("div");
    panel.className = kind === "error"
        ? "matching-state matching-state-error"
        : "matching-state";
    panel.textContent = message;
    container.appendChild(panel);
}

function waitForFirebaseAuth() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user || null);
        }, (error) => {
            unsubscribe();
            console.error("Firebase authentication state error:", error);
            resolve(null);
        });
    });
}

function setRequestSummary(userRequest) {
    const role = userRequest.type;
    const isIndividual = role === "Individual";
    const quantityItem = byId("summaryQuantity")?.closest(".summary-item");
    const resourceLabel = byId("summaryResourceLabel");
    const quantityLabel = byId("summaryQuantityLabel");
    const urgencyLabel = byId("summaryUrgencyLabel");
    const summaryGrid = document.querySelector(".summary-grid");
    if (summaryGrid) summaryGrid.classList.toggle("individual-summary", isIndividual);

    if (resourceLabel) resourceLabel.textContent = isIndividual ? "Help needed" : "Resource";
    if (quantityLabel) quantityLabel.textContent = role === "Provider" ? "Quantity offered" : "Quantity needed";
    if (urgencyLabel) urgencyLabel.textContent = role === "Provider" ? "Availability" : "Urgency";
    if (quantityItem) quantityItem.hidden = isIndividual;

    setText("summaryResource", userRequest.resource || userRequest.helpType);
    setText("summaryQuantity", userRequest.quantity);
    setText("summaryLocation", userRequest.location);
    setText("summaryUrgency", userRequest.urgency || userRequest.availability);

    if (isIndividual) {
        setText("resultsTitle", "NGOs Recommended for You");
    } else if (role === "Provider") {
        setText("resultsTitle", "NGO Requests That Match");
    } else {
        setText("resultsTitle", "Matching Results");
    }
}

function displayReasons(listElement, reasons) {
    const cleaned = (Array.isArray(reasons) ? reasons : [])
        .map((reason) => String(reason || "").trim())
        .filter(Boolean)
        .map((reason) => {
            if (/tf.?idf|cosine|vectorizer|similarity algorithm/i.test(reason)) {
                return "Profile information is relevant to your request";
            }
            return reason;
        });

    const items = cleaned.length
        ? cleaned
        : ["Recommended based on the information available"];

    for (const reason of items) {
        const li = document.createElement("li");
        li.textContent = reason;
        listElement.appendChild(li);
    }
}

function addDetail(container, label, value) {
    const item = document.createElement("div");
    item.className = "match-detail-item";

    const heading = document.createElement("span");
    heading.textContent = label;

    const content = document.createElement("strong");
    content.textContent = value === undefined || value === null || value === "" ? "Not listed" : String(value);

    item.append(heading, content);
    container.appendChild(item);
}

function makeMatchCard(match, index, role) {
    const isIndividual = role === "Individual";
    const isProvider = role === "Provider";

    const card = document.createElement("article");
    card.className = "match-card dynamic-match-card";

    const top = document.createElement("div");
    top.className = "dynamic-card-top";

    const logo = document.createElement("div");
    logo.className = "match-logo";
    logo.textContent = isIndividual ? "🤝" : (isProvider ? "📋" : "📦");

    const titleArea = document.createElement("div");
    titleArea.className = "dynamic-card-title";

    const rank = document.createElement("span");
    rank.className = "match-rank";
    rank.textContent = `MATCH ${index + 1}`;

    const title = document.createElement("h3");
    title.textContent = match.name || (isIndividual ? "Registered NGO" : (isProvider ? "NGO request" : "Available resource"));

    const location = document.createElement("p");
    location.className = "location-subtitle";
    location.textContent = match.location || "Location not listed";

    titleArea.append(rank, title, location);

    const score = document.createElement("div");
    score.className = "dynamic-score";
    const scoreNumber = document.createElement("strong");
    const numericScore = Math.max(0, Math.min(100, Number(match.matchScore) || 0));
    scoreNumber.textContent = `${numericScore}%`;
    const scoreLabel = document.createElement("span");
    scoreLabel.textContent = "Match";
    score.append(scoreNumber, scoreLabel);

    top.append(logo, titleArea, score);

    const details = document.createElement("div");
    details.className = "dynamic-match-details";

    if (isIndividual) {
        addDetail(details, "Focus areas", match.focusAreas || match.resource);
        addDetail(details, "District", match.district);
        addDetail(details, "State", match.state);
    } else {
        addDetail(details, "Resource", match.resource);
        addDetail(details, isProvider ? "Quantity needed" : "Quantity available", match.quantity);
        addDetail(details, "Location", match.location);
    }

    const reasonsSection = document.createElement("div");
    reasonsSection.className = "match-reasons";
    const reasonsTitle = document.createElement("strong");
    reasonsTitle.textContent = "Why this is recommended";
    const reasonList = document.createElement("ul");
    reasonList.className = "reason-list";
    displayReasons(reasonList, match.reasons);
    reasonsSection.append(reasonsTitle, reasonList);

    card.append(top, details, reasonsSection);

    if (isIndividual) {
        const note = document.createElement("p");
        note.className = "contact-note";
        note.textContent = "Directory recommendation only. Contact the NGO to confirm its current services and availability.";
        card.appendChild(note);
    }

    return card;
}

async function getFirestoreCandidates(role) {
    const collectionName = role === "NGO" ? "resources" : "requests";
    try {
        const snapshot = await getDocs(collection(db, collectionName));
        return snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data()
        }));
    } catch (error) {
        console.error(`Firestore read failed for ${collectionName}:`, error);
        if (error?.code === "permission-denied") {
            throw new Error(`Firebase denied access to the "${collectionName}" collection. Check that you are signed in and that your Firestore Rules allow authenticated reads.`);
        }
        if (error?.code === "unauthenticated") {
            throw new Error("Your Firebase session has expired. Please log in again.");
        }
        throw new Error(`Could not read the "${collectionName}" collection from Firebase: ${error.message || "Unknown Firebase error"}`);
    }
}

async function callMatchingApi(userRequest, candidates) {
    let response;
    try {
        response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ request: userRequest, candidates })
        });
    } catch (error) {
        console.error("Flask API connection failed:", error);
        throw new Error("Cannot reach the Python matching server. Open a VS Code terminal in the project folder and run: python app.py. Keep that terminal open while using the website.");
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || `Matching service returned HTTP ${response.status}.`);
    }
    return data;
}

async function runMatching() {
    const rawRequest = sessionStorage.getItem("matchingRequest");
    if (!rawRequest) {
        setText("matchCount", "0 Matches");
        setText("resultsDescription", "No submitted request was found. Please submit a request first.");
        showState("Submit an NGO, provider or individual request to see recommendations.");
        return;
    }

    let userRequest;
    try {
        userRequest = JSON.parse(rawRequest);
    } catch (error) {
        console.error("Could not parse the saved request:", error);
        setText("matchCount", "Unavailable");
        showState("Your saved request could not be read. Please submit it again.", "error");
        return;
    }

    const role = userRequest.type;
    if (!["NGO", "Provider", "Individual"].includes(role)) {
        setText("matchCount", "Unavailable");
        showState("The submitted user role is not recognised. Please submit the request again.", "error");
        return;
    }

    setRequestSummary(userRequest);
    setText("matchCount", "Loading...");
    setText("resultsDescription", "Finding relevant organisations and resources for your request...");
    showState("Finding your best matches...");

    try {
        // Wait for Firebase to restore the signed-in session before any Firestore read.
        const user = await waitForFirebaseAuth();
        const demoPhoneSession = sessionStorage.getItem("phoneVerified") === "true";
        if (!user && !demoPhoneSession) {
            throw new Error("You are not signed in to Firebase. Please log in again and submit your request.");
        }

        // Individual-to-NGO candidates are read from the supplied Excel directory by Flask.
        // NGO and Provider candidates are read from the corresponding Firestore collection.
        let candidates = [];
        if (role !== "Individual") {
            candidates = await getFirestoreCandidates(role);
            if (candidates.length === 0) {
                const collectionName = role === "NGO" ? "resources" : "requests";
                setText("matchCount", "0 Matches");
                setText("resultsDescription", "No records are available to compare with this request yet.");
                showState(`No matching records are currently saved in the Firebase "${collectionName}" collection. Submit a provider offer or NGO request first.`);
                return;
            }
        }

        const data = await callMatchingApi(userRequest, candidates);
        const matches = Array.isArray(data.matches) ? data.matches : [];
        const container = document.querySelector(".matches-grid");
        if (!container) throw new Error("The results page is missing its matches container.");
        container.replaceChildren();

        setText("matchCount", `${matches.length} ${matches.length === 1 ? "Match" : "Matches"}`);
        if (matches.length === 0) {
            setText("resultsDescription", role === "Individual"
                ? "No relevant NGO profiles were found for the help category and location provided."
                : "No suitable resource matches were found for your request.");
            showState(role === "Individual"
                ? "No suitable NGOs were found. Try a broader help description or a nearby district/state."
                : "No suitable matches found. Check the resource category, location and available quantity.");
            return;
        }

        matches.forEach((match, index) => {
            container.appendChild(makeMatchCard(match, index, role));
        });

        if (role === "Individual") {
            setText("resultsDescription", `We found ${matches.length} relevant NGO profiles from the 1,000-record directory, ranked by your requested help and location.`);
        } else if (role === "Provider") {
            setText("resultsDescription", `We found ${matches.length} NGO requests that may fit the resource you offer.`);
        } else {
            setText("resultsDescription", `We found ${matches.length} relevant provider offers for your request.`);
        }
    } catch (error) {
        console.error("Smart matching failed:", error);
        setText("matchCount", "Unavailable");
        setText("resultsDescription", "We could not complete matching for this request.");
        showState(error.message || "An unexpected error occurred while loading matches.", "error");
    }
}

runMatching();
