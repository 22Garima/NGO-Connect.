# NGOConnect — final project setup and Smart Matching guide

## Project overview

NGOConnect connects three user groups:

1. **NGOs** submit requests for resources such as food, medicines, clothes or volunteers.
2. **Resource Providers** list resources they can offer and their available quantities.
3. **Individuals** describe the help they need and receive recommendations for relevant NGOs from the supplied directory of 1,000 organisations.

## Technology stack

- Frontend: HTML, CSS and vanilla JavaScript
- Authentication and database: Firebase Authentication and Cloud Firestore
- Matching API: Python Flask + Flask-CORS
- NLP/recommendation: scikit-learn TF-IDF and cosine similarity
- Contextual ranking: category, location, quantity and availability rules
- Directory processing: Pandas and OpenPyXL

## Smart Matching workflows

### 1. NGO → Resource Provider

- Browser reads provider offers from Firestore collection `resources`.
- Flask compares resource category, description, location, quantity and availability.
- Results are sorted by a contextual relevance score.

### 2. Resource Provider → NGO

- Browser reads NGO requests from Firestore collection `requests`.
- Flask checks whether the provider's offered quantity can meet each NGO request.
- Results are sorted by contextual relevance.

### 3. Individual → Suitable NGO

- The Individual form saves the request to Firestore collection `individualRequests`.
- Flask reads the local workbook `dataset/Final_NGO_Model_Training_Dataset_1000.new.xlsx`, worksheet `All NGOs` (1,000 rows, 15 columns).
- The request help category is mapped to likely NGO sectors; location is compared with district, state, sub-district and address. Common aliases such as Noida → Gautam Buddha Nagar are handled.
- If suitable NGOs exist in the requested district, local results are prioritised. Otherwise, the matcher falls back to relevant profiles in the wider directory.
- The workbook contains NGO directory profiles, not live service availability or verified contact details. Results are recommendations, not a guarantee of assistance.

## Matching method and score interpretation

The project uses **content-based recommendation**, not a supervised classifier. It does not require labelled historical successful/unsuccessful matches.

For NGO/Provider records, the contextual ranking combines:

- Text relevance (TF-IDF + cosine similarity): 42%
- Resource category compatibility: 28%
- Location relevance: 16%
- Quantity sufficiency: 10%
- Availability: 4%

For Individual-to-NGO recommendations:

- NGO profile text relevance: 58%
- Help-category/sector compatibility: 27%
- Location relevance: 15%

The displayed percentage is a **ranking/relevance score**, not a calibrated probability of success. The project has not trained Logistic Regression, Random Forest or another supervised classification model.

## Start the project on Windows

### 1. Start the Python API

Recommended method:

1. Open the extracted `ngo.project.new` folder in VS Code or File Explorer.
2. Double-click `run_backend.bat` (or run it from a terminal).
3. The script creates `.venv` if needed, installs `requirements.txt`, and starts Flask.
4. Keep the terminal window open while testing the website.

Manual PowerShell method:

```powershell
py -m venv .venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```

Health check:

```text
http://127.0.0.1:5000/api/health
```

Expected JSON includes `"status": "ok"`, `"ngoDirectoryRecords": 1000` and `"ngoDirectoryStatus": "available"`.

### 2. Start the frontend

1. Open the same `ngo.project.new` folder in VS Code.
2. Right-click the root `index.html` (not `public/index.html`).
3. Select **Open with Live Server**.
4. Keep the Flask terminal and Live Server running together.

Typical frontend URL:

```text
http://127.0.0.1:5500/index.html
```

The matching API is configured at `http://127.0.0.1:5000/api/match`. If Live Server uses port 5501, the Flask CORS allow-list already includes that local port.

### 3. Run smoke tests

After installing requirements:

```powershell
python -m unittest test_matching_engine.py
```

The tests cover resource filtering, provider quantity direction, Individual-to-NGO local matching and the 1,000-row directory.

## Firebase configuration and troubleshooting

The browser uses `firebase-config.js` for Firebase Web SDK configuration. No service-account key is required for the website or the matching API.

- Users must be signed in before using protected role forms and matching pages (unless using the existing demo phone-verification path).
- Firestore Rules must permit the signed-in users to create their respective request/offer documents and read the matching collection required by their workflow (`resources` for NGOs; `requests` for providers).
- If the browser shows a Firestore `permission-denied` error, check Firebase Authentication state and Firestore Rules. Do not solve this by making all collections public.
- Firebase Authentication → Settings → Authorized domains should include `127.0.0.1` and/or `localhost` for Live Server testing.
- Firebase App Check is configured with the existing reCAPTCHA Enterprise site key. Ensure the local test hostname is allowed by that key and App Check is configured for this Firebase app.
- If the page says it cannot reach the Python matching server, start `run_backend.bat`/`python app.py` and confirm the `/api/health` page responds.
- For deployment, host the Flask API separately and set `window.NGOCONNECT_API_BASE_URL` to the deployed API base URL before `results.js` loads. The default URL is for local development only.

## Microsoft login setup (required in external consoles)

The project now has a real login page with the IDs expected by `script.js`, and a Microsoft popup handler using Firebase `OAuthProvider("microsoft.com")`. **The client credentials cannot be generated from source code.** Complete these console steps with an account that has access to the Firebase project and Microsoft Entra:

1. In Firebase Console → Authentication → Sign-in method, enable **Microsoft**.
2. In Microsoft Entra Admin Center, create an App Registration. For broad public access, choose the account type that supports organisational directories and personal Microsoft accounts, as appropriate for the project.
3. In the App Registration, add a **Web** redirect URI exactly as shown by Firebase. For this project it is:

   ```text
   https://ngo-connect-1147b.firebaseapp.com/__/auth/handler
   ```

4. Create a client secret in Microsoft Entra. Copy its **value** (not the secret ID) into Firebase's Microsoft provider configuration along with the Application (client) ID.
5. Save/enable the provider in Firebase.
6. Confirm `127.0.0.1` (and `localhost` if used) is in Firebase Authentication's Authorized domains.
7. Test the Microsoft button on `login.html` and `signup.html`.

Never place the Microsoft client secret in HTML, JavaScript, this ZIP or source control. If Microsoft still fails after setup, check the browser Console error and Firebase Authentication logs. Common causes are a disabled provider, invalid/expired secret, an unregistered callback URI or an unauthorised local domain.

## Login page and authentication notes

- `login.html` is now a real login page using `loginForm`, `loginEmail`, `loginPassword`, `googleLoginBtn` and `microsoftLoginBtn`, which match the handlers in `script.js`.
- `signup.html` remains the account creation page.
- The phone OTP flow in the existing signup JavaScript is a **local demo OTP**, not a real SMS verification service. Configure Firebase Phone Authentication and reCAPTCHA before treating phone verification as production-ready.

## Security note

A Firebase service-account key was present in the original user-uploaded archive. It is intentionally excluded from this project ZIP. If that key is active, revoke it in Google Cloud IAM immediately. Do not put service-account JSON, OAuth client secrets or `.env` credentials into the project ZIP. The Firebase web config is client-side configuration, not an admin credential; still apply API restrictions and Firestore Rules.

## Known limitations

- NGO directory entries describe registered focus areas. They do not confirm that an NGO currently has funds, staff, supplies or open capacity.
- The directory does not include verified direct contact details in the supplied workbook.
- Location matching is based on names/aliases and available dataset fields; it does not calculate precise road distance because most coordinates in the supplied sheet are missing.
- Match percentages are ranking scores, not predicted probabilities.
- Microsoft OAuth requires the external Firebase/Microsoft configuration described above.
- This project is configured for local development. Production deployment requires hosting Flask, configuring production CORS, and setting the frontend API base URL.
