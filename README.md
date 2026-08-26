# Gemini Reflection Studio 🪞✨

> **Next-Generation Agentic, Privacy-Preserving & Provably Secure Reflection Companion**  
> Built for the Google AI Studio Social Challenge with **Gemini 3.7 Flash**, **True Client-Side WebCrypto AES-GCM Encryption**, **Reflection Circles with AI Redaction Diffs**, **Longitudinal Cross-Entry Pattern Agent**, **Action Item Follow-Through Loop**, and **Distress-Aware Gentle Routing**.

[![Live App](https://img.shields.io/badge/Live_App-Cloud_Run-10b981?style=for-the-badge)](https://ais-pre-rd64k74ouyenk7tcawcie6-586821086323.asia-southeast1.run.app)
[![Architecture Blog](https://img.shields.io/badge/Engineering_Blog-BLOG.md-6366f1?style=for-the-badge)](./BLOG.md)
[![Model](https://img.shields.io/badge/Model-Gemini_3.7_Flash-blue?style=for-the-badge)](https://ai.google.dev/)
[![Database](https://img.shields.io/badge/Database-Cloud_Firestore-amber?style=for-the-badge)](https://firebase.google.com/)
[![Security](https://img.shields.io/badge/Security-WebCrypto_AES--GCM_PBKDF2-purple?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)

---

## 🏆 Hackathon Evaluation Pillars & Architecture

| Criterion | Implementation in Gemini Reflection Studio |
| :--- | :--- |
| **Authenticity** | 7 Specialized Cognitive Personas (Socratic Inquire, Stoic CBT Reframing, Lateral Brainstorming, Executive Synthesis, First Principles Thinking, Action Items, Somatic Mindfulness) with high-empathy structured reasoning powered by Gemini 3.7 Flash. |
| **Security** | **True Client-Side WebCrypto PBKDF2 (100,000 rounds) + AES-GCM (256-bit) Encryption**. Plaintext exists strictly in browser memory and transiently during reasoning — never at rest in Firestore. Includes live Cryptographic Proof Panel showing raw ciphertext JSON stored in Firestore vs decrypted client view. |
| **Social Track** | **Reflection Circles**: Privacy-preserving peer sharing. Gemini automatically generates an AI sanitization diff replacing identifying names, companies, and locations with generic roles. Sharers review the diff before issuing time-bounded, revocable capability grants via Firestore security rules. |
| **Usability & Follow-Through** | **Action Item State Machine** (`open` / `done` / `dropped` without guilt) closing the loop on insights; **Longitudinal Pattern Agent** synthesizing recurring cognitive triggers and spatial-weather clarity correlations over time. |
| **Stability & Safety** | **Distress-Aware Routing**: Heuristic and model-evaluated detection providing gentle, dismissible human crisis resource interventions (988 Lifeline, Crisis Text Line) with explicit non-clinical disclaimers; **Resilient Offline Queue** with auto-flushing upon reconnection. |

---

## 🛡️ Security Decisions & Honest Threat Model

### 1. Plaintext vs Rest Guarantees
> **Security Guarantee:** Plaintext exists strictly in client browser memory and transiently in transit to Google for reasoning — never at rest in your Firestore database.

- **PBKDF2 Key Derivation**: 100,000 iterations, SHA-256 with 16-byte random cryptographically secure salt.
- **AES-GCM 256-bit**: 12-byte initialization vector (IV), 128-bit authentication tag.
- **12-Word Mnemonic Recovery**: Client-side BIP39-compatible wordlist generator.
- **Firestore Security Rules**: User isolation (`request.auth.uid == userId`) combined with capability-grant-based access for the `shares` collection.

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

## 📸 Step-by-Step Experience & Proofs

### 1. Client-Side Encryption & Live Proof Panel
*View raw encrypted envelopes (`iv`, `salt`, `ct`) at rest in Firestore alongside decrypted client UI.*

### 2. Multi-Modal Reflection Input & 7 Cognitive Personas
*Voice dictation via Web Speech API, spatial grounding presets, and Gemini 3.7 Flash reasoning.*

### 3. Reflection Circles & AI Redaction Diff
*Review redacted spans side-by-side before creating capability grants for mentors or trusted peers.*

### 4. Longitudinal Cross-Entry Pattern Agent
*Longitudinal synthesis evaluating recurring triggers, growth trajectories, and action item follow-through.*

### 5. Action Items Loop Closure
*Filter commitments by `open`, `done`, and `dropped` to track actual behavioural follow-through.*

---

## 🚀 Live Health & Telemetry Endpoint

- **Health Check**: `GET /api/health` returns dependency status, model latency (Gemini 3.7 Flash), and Firestore connectivity.
