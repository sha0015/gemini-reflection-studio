# Building Gemini Reflection Studio & AI Security Suite

*How we combined Gemini 3.7 Flash, True Client-Side WebCrypto AES-GCM Encryption, 5-Zone Threat Modeling, and Privacy-Preserving Reflection Circles into a next-generation AI companion.*

---

## 🌟 Submission Overview & Public Endpoint

- **Active Public Endpoint:** [https://ais-pre-rd64k74ouyenk7tcawcie6-586821086323.asia-southeast1.run.app](https://ais-pre-rd64k74ouyenk7tcawcie6-586821086323.asia-southeast1.run.app)
- **GitHub Repository:** [https://github.com/sha0015/ai-app](https://github.com/sha0015/ai-app)
- **Core AI Model:** Gemini 3.7 Flash (`@google/genai`) with 4-tier model resilience ladder
- **Database & Auth:** Cloud Firestore (Owner-isolated rules + Capability grants) & Firebase Google Auth / Sandbox Guest Mode
- **Cryptography:** WebCrypto API (AES-GCM 256-bit, PBKDF2 100,000 rounds)
- **Security Suite:** 5-Zone Agentic Threat Modeling, OWASP Code Reviewer, Firestore Rule Static Analyzer

---

## 🌟 Introduction & The Architectural Challenge

Journaling and daily self-reflection are among the highest-leverage habits for mental clarity and personal growth. However, conventional digital journaling tools suffer from three fundamental limitations:

1. **Passive Text Dump:** Traditional apps act as inert text boxes. They don't inquire, spot recurring cognitive blind spots, or help you close the loop on action items.
2. **Confidentiality & Privacy at Rest:** Journal entries contain deeply private thoughts. Users need mathematical guarantees that their data is encrypted before leaving the browser and unreadable by database administrators.
3. **Safe Collaboration & Sharing Friction:** Sharing an authentic reflection with a mentor or peer often leaks sensitive employer names or identifying details without an automated anonymization pipeline.

To solve this, we built **Gemini Reflection Studio & Security Suite**—a full-stack, user-authenticated AI reflection companion and security engineering platform powered by **Gemini 3.7 Flash**, **True Client-Side Zero-Knowledge Encryption**, **Reflection Circles with AI Redaction Diffs**, and a **Live 5-Zone Threat Modeling Suite**.

---

## 🛡️ Core Architectural Innovations

### 1. 5-Zone Agentic Threat Modeling Studio (Beyond Baseline)
Security and privacy in AI-driven applications must be provable, not aspirational. We built an interactive Threat Modeling Studio directly into the application:
- **5 Threat Zones**: Systematically decomposes agentic systems across *Input Surfaces*, *Planning & Reasoning*, *Tool Execution*, *Memory & Storage*, and *Inter-System Communication*.
- **Comprehensive Mappings**: Every vulnerability maps directly to OWASP Top 10 (Web), OWASP Top 10 for LLMs (LLM01-LLM10), and STRIDE categories.
- **Actionable Remediation**: Gemini 3.7 Flash generates unified code patch snippets and reproducible test verification steps for each identified threat.

### 2. True Client-Side WebCrypto AES-GCM (256-bit) Encryption
- **Browser-Thread Encryption**: Reflections are encrypted via PBKDF2 (100,000 rounds, SHA-256) and AES-GCM (256-bit) before any network dispatch.
- **Zero Plaintext at Rest**: Cloud Firestore strictly stores encrypted envelopes (`v`, `iv`, `salt`, `ct`).
- **Live Cryptographic Proof Panel**: Judges and users can inspect the raw ciphertext envelope stored in Firestore directly side-by-side with the decrypted client UI.

### 3. Reflection Circles & AI Redaction Diffs
- **Automated Anonymization**: When sharing with a mentor or circle, Gemini 3.7 Flash analyzes the reflection and generates an inline redaction diff replacing identifying names, companies, and locations with generic roles.
- **Visual Diff Inspection**: Users review the exact redacting changes before issuing time-bounded, revocable capability grants via Firestore security rules (`/shares` collection).

### 4. Longitudinal Cross-Entry Pattern Agent
- **Corpus Synthesis**: Analyzes multi-week archives to extract recurring cognitive stressors, environmental clarity correlations, and follow-through resilience scores.

### 5. Action Item State Machine & Distress Support
- **Loop Closure**: Three-state commitment tracking (`open`, `done`, `dropped`) eliminates guilt while tracking real behavioral follow-through.
- **Distress Support**: Gentle, non-clinical intervention banner offering 24/7 crisis support options whenever high distress is detected.

---

## 🏗️ Architectural Diagram

```
 ┌────────────────────────────────────────────────────────┐
 │                   Client Layer (React 18 + Vite)       │
 │  - Google Identity Auth & Sandbox Guest Mode           │
 │  - WebCrypto AES-GCM (256-bit) + PBKDF2 (100k rounds)  │
 │  - Cryptographic Proof Inspector                       │
 │  - 5-Zone Threat Modeling & Security Reviewer UI       │
 │  - Reflection Circles & AI Redaction Diffs             │
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
│  - Raw Ciphertext Envelopes   │ │  - Longitudinal Pattern Agent    │
└───────────────────────────────┘ └──────────────────────────────────┘
```

---

## 🔒 Verified Cloud Firestore Security Rules

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

    match /{document=**} {
      allow read, write: if false;
    }

    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }

    match /users/{userId}/entries/{entryId} {
      allow read, write: if isOwner(userId);
    }

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

## 🚀 Summary

By combining **Gemini 3.7 Flash reasoning**, **client-side WebCrypto AES-GCM encryption**, **automated role-based redaction diffs for peer sharing**, and a **production-grade Threat Modeling & Security Suite**, Gemini Reflection Studio sets a new benchmark for privacy-first, secure, and authentic AI applications.
