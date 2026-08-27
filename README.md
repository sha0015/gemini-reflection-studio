# Gemini Reflection Studio & Security Suite 🪞🛡️

> **Next-Generation Agentic, Privacy-Preserving Reflection Companion & AI Security Verification Suite**  
> Built for the Google AI Studio Social Challenge with **Gemini 3.7 Flash**, **True Client-Side WebCrypto AES-GCM (256-bit) Encryption**, **5-Zone Threat Modeling Studio**, **OWASP Security Code Reviewer**, **Firestore Rule Static Analyzer**, **Model Resilience Fallback Ladder**, **Reflection Circles with AI Redaction Diffs**, **Longitudinal Cross-Entry Pattern Agent**, **Action Item State Machine**, and **Distress-Aware Support Routing**.

[![Live App](https://img.shields.io/badge/Live_App-Cloud_Run-10b981?style=for-the-badge)](https://ais-pre-rd64k74ouyenk7tcawcie6-586821086323.asia-southeast1.run.app)
[![Architecture Blog](https://img.shields.io/badge/Engineering_Blog-BLOG.md-6366f1?style=for-the-badge)](./BLOG.md)
[![Model](https://img.shields.io/badge/Model-Gemini_3.7_Flash-blue?style=for-the-badge)](https://ai.google.dev/)
[![Database](https://img.shields.io/badge/Database-Cloud_Firestore-amber?style=for-the-badge)](https://firebase.google.com/)
[![Security](https://img.shields.io/badge/Security-WebCrypto_AES--GCM_PBKDF2-purple?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)

---

## 🏆 Key Capabilities & Authentic Feature Breakdown

### 1. 🛡️ Agentic Security & Threat Modeling Suite (Beyond Baseline)
* **5-Zone Threat Modeling Studio**: Uses Gemini 3.7 Flash to decompose complex architectures across 5 distinct threat zones (*Input Surfaces*, *Planning & Reasoning*, *Tool Execution*, *Memory & Storage*, *Inter-System Communication*). Maps every threat to **OWASP Top 10 (Web)**, **OWASP Top 10 for LLMs (LLM01-LLM10)**, and **STRIDE**, generating concrete code remediation snippets and test walkthroughs (`/api/threat-model`).
* **OWASP Security Code Reviewer (LLM-Guided Data-Flow Trace)**: Gemini 3.7 Flash inspects source code and configuration files and narrates a plausible data-flow trace from untrusted **Source** through **Intermediate** transforms into execution **Sinks**, providing unified code diffs and patch suggestions (`/api/security-review`). This is a prompted LLM analysis, not a compiler-grade AST parser or static-analysis tool.
* **Firestore Rule Static Analyzer & Workbench**: Audits `firestore.rules` against wildcard bypasses, missing owner checks, and insecure defaults with genuine deterministic regex-based rule parsing, no LLM involved (`/api/rules/validate`).
* **4-Tier Model Resilience Fallback Ladder**: Cascades dynamically between `gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-3.1-flash-lite`, and `gemini-flash-latest` with latency metrics and simulated 503/429 recovery (`/api/gemini/resilient-test`).
* **Walkthrough Test Matrix**: Interactive verification matrix documenting expected behavior for automated threat modeling, rule simulation, and LLM-guided code reviews against defined user stories.

---

### 2. 🔐 True Client-Side Zero-Knowledge Encryption
* **WebCrypto AES-GCM (256-bit) + PBKDF2 (100,000 rounds)**: Journal entries are cryptographically encrypted directly inside the browser thread before network dispatch. Plaintext never touches Firestore at rest.
* **Live Cryptographic Proof Panel**: Real-time inspector rendering the raw ciphertext payload (`iv`, `salt`, `ct`, `v`) stored in Firestore alongside your decrypted client-side view.
* **12-Word Mnemonic Recovery**: Client-side backup phrase generation for key derivation without server-side escrow.

---

### 3. 👥 Reflection Circles (Privacy-Preserving Peer Sharing)
* **AI Redaction Diff Engine**: Before sharing introspective reflections with mentors or peer circles, Gemini 3.7 Flash automatically detects and redacts identifying names, employers, and locations into generic roles.
* **Side-by-Side Visual Diff**: Review exact sanitized spans before confirming.
* **Granular Capability Grants**: Set time-bounded access (12h, 24h, 3d, 7d) with instant revocation backed by Firestore security rules (`/shares` collection).

---

### 4. 📈 Longitudinal Pattern & Cross-Entry Agent
* **Multi-Week Corpus Synthesis**: Evaluates your reflection archive across weeks and months using Gemini 3.7 Flash (`/api/patterns/analyze-corpus`).
* **Recurring Trigger Detection**: Identifies repeating cognitive stressors and recommends actionable behavioral shifts.
* **Spatial & Atmospheric Correlations**: Uncovers patterns connecting physical environments with cognitive clarity and emotional resilience.
* **Intentional Growth Index**: Measures longitudinal trajectory and reflective depth over time.

---

### 5. 📋 Action Item Loop Closure & State Machine
* **Three-State Lifecycle**: Tracks commitments extracted from reflections with `Open`, `Done`, and guilt-free `Dropped` states.
* **Integrity Metrics**: Live completion rates computed across your entire reflection archive.

---

### 6. 🌿 Distress-Aware Support Routing & Offline Buffer
* **Gentle Intervention Banner**: Evaluates reflection text for severe distress or crisis indicators. Surfaces calm, dismissible 24/7 crisis support options (988 Lifeline, Crisis Text Line) alongside non-clinical disclaimers.
* **Offline Resilience Queue**: Buffers entries locally in `localStorage` when network drops and automatically syncs to Firestore upon reconnection.

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

## 🩺 System Health & Latency Telemetry

- **Health Endpoint**: `GET /api/health` queries live Gemini 3.7 Flash response latency, Cloud Firestore status, and client dictation readiness.
