# The Architect's Odyssey: Gemini Reflection Studio & Security Suite 🪞🛡️

> **Next-Generation Agentic, Privacy-Preserving Reflection Companion & AI Security Verification Suite**  
> Built for the Google AI Studio Social Challenge with **Gemini 3.7 Flash**, **Mandatory Client-Side WebCrypto AES-GCM (256-bit) Encryption**, **5-Zone AI Threat Modeling Studio**, **OWASP Security Code Reviewer**, **Deterministic Firestore Rule Static Analyzer**, **Model Resilience Fallback Ladder**, **Reflection Circles with AI Redaction Diffs**, **Longitudinal Cross-Entry Pattern Agent**, **3-State Action Machine**, **Distress-Aware Support Routing**, and an **SSRF-Hardened, Rate-Limited API Gateway**.

[![Live App](https://img.shields.io/badge/Live_App-Cloud_Run-10b981?style=for-the-badge)](https://ais-pre-rd64k74ouyenk7tcawcie6-586821086323.asia-southeast1.run.app)
[![Story Mode Blog](https://img.shields.io/badge/Story_Mode_Blog-BLOG.md-6366f1?style=for-the-badge)](./BLOG.md)
[![Model](https://img.shields.io/badge/Model-Gemini_3.7_Flash-blue?style=for-the-badge)](https://ai.google.dev/)
[![Database](https://img.shields.io/badge/Database-Cloud_Firestore-amber?style=for-the-badge)](https://firebase.google.com/)
[![Security](https://img.shields.io/badge/Security-WebCrypto_AES--GCM_PBKDF2-purple?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)

---

## 🌟 Submission Quick Links

- **🚀 Live Cloud Run App:** [https://ais-pre-rd64k74ouyenk7tcawcie6-586821086323.asia-southeast1.run.app](https://ais-pre-rd64k74ouyenk7tcawcie6-586821086323.asia-southeast1.run.app)
- **📖 Story Mode Engineering Blog:** [`BLOG.md`](./BLOG.md) (also accessible via the in-app **Architecture Blog** tab)
- **💻 GitHub Repository:** [https://github.com/sha0015/ai-app](https://github.com/sha0015/ai-app)
- **🗄️ Firestore Instance:** `ai-studio-sentinelthreatle-0baba888-eb3a-4c29-8917-cd74bd9f9e67`

---

## 📸 Interactive 6-Step Visual Tour & Screenshots

| Step / Journey | Pillar | Key Technologies | Screenshot Preview |
| :--- | :--- | :--- | :--- |
| **01. The Sanctuary Gate** | **Auth & Zero-Trust Sandbox** | Google Identity OAuth 2.0, Default-Deny Firestore Rules, Zero-Trace Local Sandbox | [View Screenshot](./screenshots/step1_auth_isolation.svg) |
| **02. The Sound of Clarity** | **7 Cognitive Personas & Voice** | Web Speech API, Privacy Shield Regex, Gemini 3.7 Flash Persona System Prompts | [View Screenshot](./screenshots/step2_modalities_studio.svg) |
| **03. The Mathematical Vault** | **Mandatory WebCrypto (256-bit)** | AES-GCM 256-bit, PBKDF2 100k rounds, Dual Key-Wrap, 12-Word Recovery | [View Screenshot](./screenshots/step3_gemini_reasoning.svg) |
| **04. Physical Grounding** | **Spatial Weather & Webhooks** | Nominatim OSM Geocoding, Open-Meteo Weather, SSRF IP Blocking, Slack Block Kit | [View Screenshot](./screenshots/step4_spatial_maps.svg) |
| **05. The Fortress Walls** | **5-Zone Threat Modeling** | 5 Threat Zones, STRIDE & OWASP LLM01-LLM10, LLM Taint Trace, Static Rules AST | [View Screenshot](./screenshots/step5_threat_modeling.svg) |
| **06. Community & Growth** | **Circles & Longitudinal Agent** | AI Redaction Diffs, Capability Grants, Multi-Week Corpus Synthesis, 3-State Actions | [View Screenshot](./screenshots/step6_security_rules.svg) |

---

## 📖 The Story & Problem Statement

Journaling and daily self-reflection are among the highest-leverage habits for mental clarity and personal growth. However, conventional digital journaling tools suffer from three fundamental limitations:

1. **Passive Text Dump:** Traditional apps act as inert text boxes. They don't inquire, spot recurring cognitive blind spots, or help you close the loop on action items.
2. **Confidentiality & Privacy at Rest:** Journal entries contain deeply private thoughts. Users need mathematical guarantees that their data is encrypted before leaving the browser and unreadable by database administrators.
3. **Safe Collaboration & Sharing Friction:** Sharing an authentic reflection with a mentor or peer often leaks sensitive employer names or identifying details without an automated anonymization pipeline.

To solve this, we built **Gemini Reflection Studio & Security Suite**—a full-stack, user-authenticated AI reflection companion and security engineering platform powered by **Gemini 3.7 Flash**, **True Client-Side Zero-Knowledge Encryption**, **Reflection Circles with AI Redaction Diffs**, **Spatial Atmosphere Grounding**, **SSRF-Hardened Webhook Dispatchers**, and a **Live 5-Zone Threat Modeling Suite**.

---

## 🏆 Key Capabilities & Authentic Feature Breakdown

### 1. 🛡️ Agentic Security & Threat Modeling Suite (Beyond Baseline)
* **5-Zone Threat Modeling Studio**: Uses Gemini 3.7 Flash to decompose complex architectures across 5 distinct threat zones (*Input Surfaces*, *Planning & Reasoning*, *Tool Execution*, *Memory & Storage*, *Inter-System Communication*). Maps every threat to **OWASP Top 10 (Web)**, **OWASP Top 10 for LLMs (LLM01-LLM10)**, and **STRIDE**, generating concrete code remediation snippets and test walkthroughs (`/api/threat-model`).
* **OWASP Security Code Reviewer (LLM-Guided Data-Flow Trace)**: Gemini 3.7 Flash inspects source code and configuration files and narrates a plausible data-flow trace from untrusted **Source** through **Intermediate** transforms into execution **Sinks**, providing unified git-style code diffs and patch suggestions (`/api/security-review`).
* **Firestore Rule Static Analyzer & Workbench**: Audits `firestore.rules` against wildcard bypasses, missing owner checks, and insecure defaults with genuine deterministic regex-based rule parsing (zero LLM hallucination risk) (`/api/rules/validate`).
* **4-Tier Model Resilience Fallback Ladder**: Cascades dynamically between `gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-3.1-flash-lite`, and `gemini-flash-latest` with latency metrics and simulated 503/429 recovery (`/api/gemini/resilient-test`).
* **Walkthrough Test Matrix**: Interactive verification matrix documenting expected behavior for automated threat modeling, rule simulation, and LLM-guided code reviews against defined user stories.

---

### 2. 🔐 True Client-Side Zero-Knowledge Encryption
* **Mandatory for every real account**: The first time you save a reflection, you're asked to set an encryption passphrase — there's no way to save plaintext to Firestore. (The local guest sandbox is exempt since it never leaves your browser's `localStorage` in the first place.)
* **WebCrypto AES-GCM (256-bit) + PBKDF2 (100,000 rounds), Dual Key-Wrap Envelope (`v2`)**: Each entry is encrypted under its own random data key, which is independently wrapped under both your passphrase and your 12-word recovery phrase — either one alone can decrypt it. Firestore only ever stores the ciphertext envelope (`v`, `iv`, `ct`, `keyWraps`); the human-readable fields are never written.
* **Live Cryptographic Proof Panel**: Real-time inspector rendering the actual ciphertext envelope stored in Firestore for a real entry, side-by-side with what your passphrase decrypts it to in memory.
* **12-Word Mnemonic Recovery**: Generated on first use and independently able to decrypt your entries — not just a displayed phrase, an actual second PBKDF2 key-wrap slot.

---

### 3. 👥 Reflection Circles (Privacy-Preserving Peer Sharing)
* **AI Redaction Diff Engine**: Before sharing introspective reflections with mentors or peer circles, Gemini 3.7 Flash automatically detects and redacts identifying names, employers, and locations into generic roles (*e.g., "Sarah, VP Eng at Stripe" → "[Senior Peer] at [Fintech Corp]"*).
* **Side-by-Side Visual Diff**: Review exact sanitized spans before confirming.
* **Granular Capability Grants**: Set time-bounded access (12h, 24h, 3d, 7d) with instant revocation backed by Firestore security rules (`/shares` collection).

---

### 4. 📈 Longitudinal Pattern & Cross-Entry Agent
* **Multi-Week Corpus Synthesis**: Evaluates your reflection archive across weeks and months using Gemini 3.7 Flash (`/api/patterns/analyze-corpus`).
* **Recurring Trigger Detection**: Identifies repeating cognitive stressors and recommends actionable behavioral shifts.
* **Spatial & Atmospheric Correlations**: Uncovers patterns connecting physical environments with cognitive clarity and emotional resilience.
* **Intentional Growth Index**: Measures longitudinal trajectory and reflective depth over time.

---

### 5. 📋 Action Item Loop Closure & 3-State Machine
* **Three-State Lifecycle**: Tracks commitments extracted from reflections with `Open`, `Done`, and guilt-free `Dropped` states.
* **Integrity Metrics**: Live completion rates computed across your entire reflection archive.

---

### 6. 🌿 Distress-Aware Support Routing & Offline Buffer
* **Gentle Intervention Banner**: Evaluates reflection text for severe distress or crisis indicators. Surfaces calm, dismissible 24/7 crisis support options (988 Lifeline, Crisis Text Line) alongside non-clinical disclaimers.
* **Offline Resilience Queue**: Buffers entries locally in `localStorage` when network drops and automatically syncs to Firestore upon reconnection.

---

## 🏗️ Architectural Diagram

```
 ┌────────────────────────────────────────────────────────┐
 │                   Client Layer (React 18 + Vite)       │
 │  - Google Identity Auth & Sandbox Guest Mode           │
 │  - WebCrypto AES-GCM (256-bit) Dual Key-Wrap Vault     │
 │  - Live Cryptographic Proof Inspector                  │
 │  - 7 Cognitive Personas & Speech-to-Text Dictation     │
 │  - 5-Zone Threat Modeling & Security Reviewer UI       │
 │  - Reflection Circles & AI Redaction Diffs             │
 │  - Spatial Grounding & Live Atmospheric Telemetry      │
 │  - Offline Queue Buffer (localStorage)                 │
 └───────────────────────┬────────────────────────────────┘
                         │
       ┌──────────────────┴──────────────────┐
       ▼                                     ▼
┌───────────────────────────────┐ ┌──────────────────────────────────┐
│    Cloud Firestore DB         │ │      Server-Side API Gateway     │
│  - Path: /users/{uid}/entries │ │      (Express + TypeScript)      │
│  - Path: /shares/{shareId}    │ │  - Gemini 3.7 Flash Model Ladder │
│  - Zero-Knowledge Rule Guard  │ │  - 5-Zone Threat Modeling Agent  │
│  - Capability-Based Sharing   │ │  - OWASP Code Review (LLM Trace) │
│  - Raw Ciphertext Envelopes   │ │  - SSRF-Hardened Webhook Egress  │
│  - Owner-Isolated Partitions  │ │  - Rate-Limited Route Ingress    │
│  - Deterministic Rule Audit   │ │  - Live /api/health Telemetry    │
└───────────────────────────────┘ └──────────────────────────────────┘
```

---

## 🔒 Cloud Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Default deny on all unauthenticated root paths
    match /{document=**} {
      allow read, write: if false;
    }

    // User profile isolation
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }

    // User reflection partition (encrypted envelopes)
    match /users/{userId}/entries/{entryId} {
      allow read, write: if isOwner(userId);
    }

    // Time-bounded peer capability grants
    match /shares/{shareId} {
      allow create: if isAuthenticated() && request.resource.data.sharerUid == request.auth.uid;
      allow read: if isAuthenticated() && (
        resource.data.sharerUid == request.auth.uid ||
        (resource.data.granteeUid == request.auth.uid &&
         resource.data.revoked == false &&
         request.time < resource.data.expiresAt)
      );
      allow update: if isAuthenticated() && resource.data.sharerUid == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.sharerUid == request.auth.uid;
    }
  }
}
```

---

## 🌐 API Security Hardening

- **SSRF Protection**: Webhook dispatch endpoints (`/api/webhooks/test-ping`, `/api/export/webhook`, `/api/webhooks/dispatch`) validate every destination URL server-side before requesting it — HTTPS-only, and private/loopback/link-local/CGNAT/reserved IP ranges are rejected, including the cloud metadata address (`169.254.169.254`) and resolved DNS results (IPv4 & IPv6).
- **Rate Limiting**: A baseline limiter (60 req/min per IP) covers all `/api/*` routes; a stricter shared limiter (20 req/10min per IP) covers every route that calls Gemini or an external API.

---

## 🩺 System Health & Latency Telemetry

- **Health Endpoint**: `GET /api/health` makes real checks — a live Gemini 3.7 Flash ping, a Cloud Firestore REST reachability probe against the configured project, and a real Open-Meteo call — instead of reporting fixed statuses. Client-only capabilities (Web Speech support) are detected in the browser, not claimed by the server.

---

## 🔑 Secret Configuration & Quota Resilience

- **Zero-Client Secret Exposure**: All Gemini AI interactions occur strictly server-side via `process.env.GEMINI_API_KEY`. No API keys are bundled or exposed to the client browser.
- **AI Studio Injection**: API keys are securely declared in `.env.example` and automatically populated by the AI Studio platform runtime.
- **Resilient Fallback Ladder**: The system implements an automatic model fallback ladder (`gemini-3.7-flash` ➔ `gemini-3.6-flash` ➔ `gemini-3.1-flash-lite` ➔ `gemini-flash-latest`) and deterministic offline security generators to ensure seamless operational continuity when upstream rate limits or quota boundaries are encountered.

