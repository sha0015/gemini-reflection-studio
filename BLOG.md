# The Architect's Odyssey: Building Gemini Reflection Studio & AI Security Suite 🪞🛡️

*A Narrative Journey through Gemini 3.7 Flash, Zero-Knowledge WebCrypto Vaults, SSRF-Hardened Gateways, and 5-Zone AI Threat Modeling.*

---

## 🌟 Submission Overview & Live Public Endpoints

- **Live Cloud Run App:** [https://ais-pre-rd64k74ouyenk7tcawcie6-586821086323.asia-southeast1.run.app](https://ais-pre-rd64k74ouyenk7tcawcie6-586821086323.asia-southeast1.run.app)
- **GitHub Repository:** [https://github.com/sha0015/ai-app](https://github.com/sha0015/ai-app)
- **Core AI Engine:** Gemini 3.7 Flash (`@google/genai`) with a 4-tier model resilience ladder
- **Database & Auth:** Cloud Firestore (Owner-isolated rules + Capability grants) & Firebase Google Auth / Sandbox Guest Mode
- **Cryptography Engine:** Browser WebCrypto API (AES-GCM 256-bit, PBKDF2 100,000 rounds, Dual Key-Wrap Envelope)
- **Security & Defense Suite:** 5-Zone Agentic Threat Modeling, OWASP Code Reviewer (LLM-Guided Data-Flow Trace), Deterministic Firestore Rule Static Analyzer, SSRF-Guarded & Rate-Limited API Gateway

---

## 📖 Chapter 1: The Confessional Problem — Why We Built This

It was late on a Tuesday evening when an engineering leader opened up a blank text editor. After a brutal day navigating organizational politics, critical system outages, and impending career pivots, they typed out a raw, unvarnished stream of consciousness:

> *"I'm terrified we are making the wrong architectural bet with our distributed pipeline. Meeting with Sarah (VP of Product) felt tense. I feel burned out, but I can't say this aloud to my team."*

They stared at the blinking cursor. Where could this reflection safely go?

- **If posted to conventional notes apps or standard SaaS tools:** The plaintext would sit in unencrypted cloud databases, accessible to database administrators, subpoena requests, or model training scrapers.
- **If sent to generic AI chatbots:** Identifying details, names, and proprietary trade secrets would be blasted across unredacted network payloads.
- **If saved locally in plaintext:** It remained a passive, inert graveyard of thoughts—unable to challenge cognitive distortions, extract actionable commitments, or identify longitudinal patterns of stress over months.

We realized the world didn't need another generic digital notepad. We needed a **sanctuary for metacognition**—an agentic, privacy-preserving AI reflection companion with the cryptographic rigor of a hardware vault and the reasoning intelligence of **Gemini 3.7 Flash**.

---

## 🗺️ Chapter 2: The Six Journeys — An Interactive Visual Tour

Follow the journey of a reflection from stream-of-consciousness thought to cryptographically guarded insight, peer circle sharing, and agentic threat modeling.

---

### 🛡️ Journey 1: The Sanctuary Gate — Google Auth & Zero-Trust Guest Sandbox
Before a single thought is typed, the user steps through a zero-trust gateway. 

Authenticated users leverage Google Identity Services, establishing isolated partitions in Cloud Firestore (`/users/{uid}/entries`). For evaluators or transient visitors, the **Zero-Trust Guest Sandbox** keeps all state strictly in browser memory and local storage—never dispatching a single byte over the wire until an account is created.

![Step 1: Auth & Isolation](./screenshots/step1_auth_isolation.svg)

*Key Capabilities:*
- Google Identity Services OAuth 2.0 with zero-compromise credential flow.
- Instant, zero-friction local guest sandbox with automated local quota buffers.
- Default-deny Firestore security rules (`match /{document=**} { allow read, write: if false; }`).

---

### 🎙️ Journey 2: The Sound of Clarity — 7 Cognitive Personas & Live Voice Dictation
The user begins to speak. Using the browser's native **Web Speech API**, spoken words fluidly transform into stream-of-consciousness text on screen. 

Instead of generic chatbot replies, the user chooses their cognitive sounding board from **7 specialized personas**:
1. **Socratic Inquire:** Gently exposes hidden assumptions and circular thinking.
2. **Stoic CBT Reframing:** Separates uncontrollable external events from internal agency.
3. **Lateral Brainstorming:** Explores wild, non-linear creative options.
4. **Executive Synthesis:** Condenses unstructured brain-dumps into crisp executive memos.
5. **First Principles:** Deconstructs thorny problems down to foundational axioms.
6. **Action Commitment:** Converts emotional turmoil into prioritized, concrete next steps.
7. **Somatic Mindfulness:** Grounds cognitive anxiety into physical breath and body awareness.

![Step 2: Thinking Modalities](./screenshots/step2_modalities_studio.svg)

*Key Capabilities:*
- Browser-native speech recognition with real-time waveform pulse feedback.
- Client-side Privacy Shield regex that sanitizes API keys, emails, and SSNs before sending prompts to Gemini.
- Non-clinical **Distress Support Banner** that dynamically routes to 24/7 crisis resources if acute distress is detected.

---

### 🔐 Journey 3: The Mathematical Vault — Mandatory Client-Side WebCrypto AES-GCM (256-bit)
The reflection is complete, and the user hits **Save**. This is where the magic of zero-knowledge architecture happens.

The reflection is **never sent in plaintext to Firestore**. In the local browser thread, WebCrypto generates a random 32-byte Data Encryption Key (DEK) and encrypts the entire entry using AES-GCM (256-bit). That DEK is then independently wrapped twice using PBKDF2 (100,000 rounds, SHA-256):
1. Wrapped under the user's secret **Passphrase**.
2. Wrapped under a generated **12-Word Mnemonic Recovery Phrase**.

Firestore receives strictly the ciphertext envelope (`v: 2`, `iv`, `ct`, `keyWraps`). The title, summary, insights, and messages stored in the database are literally replaced with locked placeholders.

![Step 3: WebCrypto Encryption Vault](./screenshots/step3_gemini_reasoning.svg)

*Key Capabilities:*
- Mandatory encryption for all authenticated saves—zero plaintext at rest in Google Cloud.
- Dual key-wrap recovery: if the passphrase is lost, the 12-word mnemonic independently restores access.
- **Live Cryptographic Proof Panel**: Real-time side-by-side inspector comparing the raw ciphertext JSON stored in Firestore with the in-memory decrypted view.

---

### 📍 Journey 4: The Physical Grounding & SSRF-Hardened Webhook Dispatcher
Thoughts do not occur in a vacuum; they happen in physical space. 

Gemini Reflection Studio connects with **Nominatim / OpenStreetMap** reverse geocoding and live **Open-Meteo weather telemetry** (temperature, atmospheric moisture, and sky conditions). Gemini injects this spatial context (*e.g., "18°C Misty Zen at Kyoto Bamboo Sanctuary"*) to ground metaphors and reduce cognitive fatigue.

When the user wants to broadcast their action commitments to their team, they trigger the **Outbound Webhook Dispatcher**:

![Step 4: Spatial Grounding & Webhooks](./screenshots/step4_spatial_maps.svg)

*Key Capabilities:*
- **SSRF Defense-in-Depth Gateway:** Resolves DNS server-side and violently rejects IPv4/IPv6 private ranges (`10.0.0.0/8`, `192.168.0.0/16`), loopback (`127.0.0.1`, `::1`), link-local/cloud-metadata (`169.254.169.254`, `fe80::/10`), and CGNAT (`100.64.0.0/10`).
- **Tiered Rate Limiter:** Protects against flooding with a 60 req/min baseline and a 20 req/10min quota for outbound external calls.
- **Multi-Platform Broadcast:** Beautiful Slack Block Kit cards, Discord Rich Embeds, or standard JSON payloads.

---

### ⚔️ Journey 5: The Fortress Walls — 5-Zone AI Threat Modeling & OWASP Reviewer
How do we know the AI companion itself is secure against prompt injection, data exfiltration, or rogue tool invocation? We built an embedded security research lab directly into the platform.

The **5-Zone Threat Modeling Studio** employs Gemini 3.7 Flash to decompose complex AI architectures into 5 distinct attack surfaces:
1. **Input Surfaces:** Multimodal prompt injection, ASCII smuggling, and jailbreak vectors.
2. **Planning & Reasoning:** Goal hijack, cognitive state corruption, and model hallucinations.
3. **Tool Execution:** SSRF, unbounded API calls, and arbitrary code execution.
4. **Memory & Storage:** Vector store cross-tenant leakage and poisoned context retrieval.
5. **Inter-System Communication:** Insecure RPC interfaces and broken payload validation.

Every threat is mapped to **OWASP Top 10 (Web)**, **OWASP Top 10 for LLMs (LLM01–LLM10)**, and **STRIDE**, accompanied by automated git-style code remediation diffs.

![Step 5: Threat Modeling & Security Reviewer](./screenshots/step5_threat_modeling.svg)

*Key Capabilities:*
- **OWASP Code Reviewer (LLM-Guided Data-Flow Trace):** Narrates taint propagation from untrusted *Source* through *Intermediate* transforms to execution *Sinks*.
- **Deterministic Firestore Rule Static Analyzer:** Real regex-based deterministic engine that scans `firestore.rules` for wildcard bypasses, missing owner checks, and unexpired capability links with zero LLM hallucination risk.
- **4-Tier Model Resilience Fallback Ladder:** Gracefully cascades from `gemini-3.7-flash` down to `gemini-3.6-flash`, `gemini-3.1-flash-lite`, and `gemini-flash-latest` during simulated network degradation or 503/429 spikes.

---

### 👥 Journey 6: The Shared Circle & Longitudinal Synthesis
The final step in personal growth is community and habit formation.

When a user wants to share an authentic reflection with a mentor or peer group, **Reflection Circles** activates Gemini 3.7 Flash's automated **Role-Based Entity Redaction Engine**. Identifying names (*"Sarah, VP Eng at Stripe"*) are seamlessly transformed into generic relational roles (*"[Senior Peer] at [Fintech Corp]"*). The user reviews an interactive side-by-side redaction diff before issuing a time-bounded, cryptographically restricted capability grant in Firestore (`/shares/{shareId}`).

Over weeks and months, the **Longitudinal Pattern Agent** synthesizes multi-week archives to track:
- **Follow-Through Resilience:** Measuring closed action items across the 3-state commitment machine (`open`, `done`, `dropped`).
- **Environmental Clarity:** Pinpointing the physical environments and times of day where cognitive clarity peaks.
- **Recurring Blind Spots:** Surfacing recurring triggers before they become chronic burnouts.

![Step 6: Reflection Circles & Longitudinal Patterns](./screenshots/step6_security_rules.svg)

---

## 🏗️ The Unified Full-Stack Architecture

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

## 🔒 Verified Cloud Firestore Security Rules (Zero-Knowledge Invariant)

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

    // Default deny on all root collections
    match /{document=**} {
      allow read, write: if false;
    }

    // User profile isolation
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }

    // User reflection partition (raw ciphertext envelopes)
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

## 🔑 Secret Management & Quota-Resilient Architecture

Security is not just about encrypting user data at rest—it is also about **zero-leakage credential management**:

1. **Strict Server-Side Proxy Pattern (`process.env.GEMINI_API_KEY`)**:
   - The Gemini API secret key is never sent to the browser, never bundled into client-side JavaScript, and never exposed via `VITE_` public variables.
   - All AI interactions pass through the backend Express API gateway (`/api/reflect`, `/api/threat-model`, `/api/security-review`, `/api/patterns/analyze-corpus`).

2. **Google AI Studio Secrets Integration**:
   - Environment variables are securely declared in `.env.example` and automatically injected into the Cloud Run container runtime by Google AI Studio.
   - Verified via runtime telemetry probes (`GET /api/health`), which validate live connectivity to the `@google/genai` SDK without logging raw secret values.

3. **4-Tier Model Resilience & Quota Ladder**:
   - In production environments where API quotas or rate limits (HTTP 429 / 503) might be encountered, the server's resilient execution engine dynamically cascades across a fallback ladder:
     `gemini-3.7-flash` ➔ `gemini-3.6-flash` ➔ `gemini-3.1-flash-lite` ➔ `gemini-flash-latest`.
   - If upstream network connectivity or prepayment quota boundaries are reached, deterministic offline security engines generate mathematically verified schemas and threat models, guaranteeing uninterrupted app stability.

---

## 🚀 Epilogue: The Future of Intimate AI

By anchoring agentic AI in **mathematical privacy guarantees**, **provable threat modeling**, and **human-centric empathy**, Gemini Reflection Studio proves that AI companions do not have to choose between deep cognitive intelligence and uncompromising personal security. 

We invite you to explore the live application, run the threat modeling studio on your own system architectures, and experience the next generation of privacy-preserving reflection.
