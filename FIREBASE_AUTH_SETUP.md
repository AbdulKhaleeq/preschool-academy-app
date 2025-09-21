Firebase Phone Authentication Setup
==================================

This guide is tailored for your current React web app (Web now) and includes notes for Android later (after Capacitor).

Phase 1 — Web (do this now)
---------------------------

1) Create a Firebase Project
- https://console.firebase.google.com → Add project → name (e.g., WellingtonKids) → Create.

2) Add a Web App
- Project settings (gear icon) → General → Your apps → Add app → Web (</> icon) → Register.
- In the "SDK setup and configuration" code block, copy these values:
  - apiKey → REACT_APP_FIREBASE_API_KEY
  - authDomain → REACT_APP_FIREBASE_AUTH_DOMAIN
  - projectId → REACT_APP_FIREBASE_PROJECT_ID
  - appId → REACT_APP_FIREBASE_APP_ID
  - messagingSenderId → REACT_APP_FIREBASE_MESSAGING_SENDER_ID
  - (storageBucket, measurementId are optional)

3) Enable Phone Authentication
- Build → Authentication → Sign-in method → Phone → Enable.
- Authorized domains (bottom of the page or Authentication → Settings):
  - Add: localhost (for dev) and your production domain URL.
  - Keep the default Firebase domains.

4) Backend Service Account (Firebase Admin)
- Project settings → Service accounts → Firebase Admin SDK → Node.js → Generate new private key.
- Base64 encode the entire JSON (macOS):
  base64 -i /path/to/service-account.json | tr -d '\n'
- Put the base64 string into backend .env as FIREBASE_SERVICE_ACCOUNT_BASE64.
  - Alternative: set GOOGLE_APPLICATION_CREDENTIALS to the JSON file path on the server.

5) Fill .env files
- Frontend (frontend/.env):
  REACT_APP_FIREBASE_API_KEY=yourApiKey
  REACT_APP_FIREBASE_AUTH_DOMAIN=yourAuthDomain
  REACT_APP_FIREBASE_PROJECT_ID=yourProjectId
  REACT_APP_FIREBASE_APP_ID=yourAppId
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID=yourSenderId
  # Optional during local dev
  # REACT_APP_API_URL=http://localhost:4000
- Backend (backend/.env):
  JWT_SECRET=change_this_to_a_long_random_value
  ADMIN_PHONES=9876543210,1234567890
  FIREBASE_SERVICE_ACCOUNT_BASE64=your_base64_service_account_json
  # Or: GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
- Restart both apps after setting envs.

6) Test
- Start backend and frontend.
- Enter a 10‑digit Indian number, Send OTP, enter the SMS.
- You should log in and receive your existing JWT; roles/blocked logic stays server-side.

Phase 2 — Android (later)
-------------------------
- After you wrap with Capacitor, add an Android app in the same Firebase project.
- Add SHA‑1 and SHA‑256 fingerprints (required for Phone Auth on devices).
- No extra code needed; just complete Firebase Android app setup.

Where to find each value
------------------------
- The Web config block (Project settings → General → Your apps → Web) shows:
  - apiKey → REACT_APP_FIREBASE_API_KEY
  - authDomain → REACT_APP_FIREBASE_AUTH_DOMAIN
  - projectId → REACT_APP_FIREBASE_PROJECT_ID
  - appId → REACT_APP_FIREBASE_APP_ID
  - messagingSenderId → REACT_APP_FIREBASE_MESSAGING_SENDER_ID
- Service account JSON is under Project settings → Service accounts.

Troubleshooting
---------------
- Domain not authorized: add your domain under Authentication → Settings → Authorized domains.
- Too many requests: Firebase rate limit — wait or use another test number.
- Invalid Firebase token (backend): check base64 env and restart backend.
