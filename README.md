# Sentinel ThreatLens - Agentic AI Security & Threat Modeling Platform

Production-grade Agentic AI Threat Modeling, OWASP Top 10 (Web & LLM) Security Architecture, and Resilient Gemini Fallback System designed for Google Cloud Run, Secret Manager, and Cloud Firestore.

---

## 🛡️ Production Directives & Architecture Overview

Sentinel ThreatLens is engineered to enforce high-assurance security across all **5 Agentic Threat Zones**:

1. **Threat Zone 1: Input Surfaces** — Sanitizes untrusted user inputs, uploaded PDF/image attachments, and webhook payloads using strict delimiter separation and schema validation to prevent Direct and Indirect Prompt Injection (OWASP LLM01, A03).
2. **Threat Zone 2: Planning & Reasoning** — Hardens system instructions, eliminates jailbreak vectors, and validates tool routing logic before calling APIs.
3. **Threat Zone 3: Tool Execution** — Implements SSRF guards, sandboxed parameter parsing, and role-based execution constraints (OWASP LLM06, A10).
4. **Threat Zone 4: Memory & State** — Enforces owner-bound Firestore isolation (`request.auth.uid == userId`), RBAC claim checks, and strict undefined-stripping for transaction integrity.
5. **Threat Zone 5: Inter-System Communication** — Guarantees Zero-Hardcoding Hygiene by integrating Google Cloud Secret Manager and server-side API proxies.

---

## ⚡ Gemini Model Resilience & Fallback Protocol

All server-side AI endpoints implement an automated 4-tier model fallback ladder:
- **Tier 1 (Primary)**: `gemini-3.6-flash`
- **Tier 2 (High-Availability Fallback)**: `gemini-3.1-flash-lite`
- **Tier 3 (Dynamic Alias)**: `gemini-flash-latest`
- **Tier 4 (Deep Reasoning Fallback)**: `gemini-3.7-flash`

The error recovery matrix catches recoverable status codes (`503 UNAVAILABLE`, `429 RESOURCE_EXHAUSTED`, `404 NOT_FOUND`, `500 INTERNAL`) and sequentially attempts the next model before raising any user-facing error.

---

## 🔒 Firestore Security Rules

To enforce User Data Isolation and Zero Insecure Defaults, deploy the following `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default Deny: Reject unauthenticated root access
    match /{document=**} {
      allow read, write: if false;
    }

    // Owner-Bound User Data Isolation
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User Profile Documents
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Role-Based Access Control (RBAC) for Elevated Admin Operations
    match /admin/{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
  }
}
```

---

## 🔐 Google Cloud Secret Manager Setup

Follow these steps to securely store and bind the `GEMINI_API_KEY` without hardcoding credentials in source code:

```bash
# 1. Enable required Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com

# 2. Create and populate the Gemini API Key secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY_HERE" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 3. Obtain your Google Cloud Project Number
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

# 4. Grant the default Cloud Run Compute Service Account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 🚀 Google Cloud Run Deployment Flow

Deploy the application container directly to Google Cloud Run with the Secret Manager environment binding:

```bash
# Build and deploy service to Cloud Run
gcloud run deploy sentinel-threatlens \
  --source . \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --port 3000
```

---

## 🏷️ Mandatory Campaign Verification Labeling

To register the Cloud Run service for automated challenge verification and tracking, execute the following update command:

```bash
gcloud run services update sentinel-threatlens \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region asia-southeast1
```

---

## 🧪 Comprehensive Verification Walkthrough

| Verification Step | Target Subsystem | Expected Security Outcome |
| :--- | :--- | :--- |
| **1. Threat Modeling Engine** | `POST /api/threat-model` | Evaluates 5 Threat Zones, outputs Threat Summary Table with OWASP LLM01-LLM10 and Web Top 10 mappings. |
| **2. Fallback Ladder Resilience** | `POST /api/gemini/resilient-test` | Recovers smoothly upon simulated 503/429 failures across the 4-tier model ladder. |
| **3. Zero-Hardcoding Validator** | `POST /api/security-review` | Detects hardcoded `AIzaSy...` keys, emits code diff patches binding Secret Manager. |
| **4. Firestore Rule Auditor** | `POST /api/rules/validate` | Detects and flags insecure `allow read, write: if true;` wildcards, enforces `request.auth.uid == userId`. |
| **5. Strict Payload Hygiene** | `POST /api/sanitize` | Strips all `undefined` values recursively to ensure transaction and database driver integrity. |

---

## 📜 License
Apache-2.0
