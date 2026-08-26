# Building Gemini Reflection Studio: An Agentic, Spatial, and User-Isolated AI Journaling Companion

*How we combined Gemini 3.6 Flash, Cloud Firestore Zero-Knowledge Rules, and Google Maps Platform to turn streams of consciousness into actionable clarity.*

---

## 🌟 Submission Overview & Public Endpoint

- **Active Public Endpoint:** [https://ais-pre-rd64k74ouyenk7tcawcie6-586821086323.asia-southeast1.run.app](https://ais-pre-rd64k74ouyenk7tcawcie6-586821086323.asia-southeast1.run.app)
- **GitHub Repository:** [https://github.com/sha0015/ai-app](https://github.com/sha0015/ai-app)
- **Core AI Model:** Gemini 3.6 Flash (`@google/genai`)
- **Database & Auth:** Cloud Firestore (Owner-isolated rules) & Firebase Google Auth
- **Spatial Platform:** Google Maps Platform (Places, Geocoding, Dynamic Canvas)

---

## 🌟 Introduction & The Problem

Journaling and daily self-reflection are among the highest-leverage habits for mental clarity, personal growth, and strategic decision-making. However, conventional digital journaling tools suffer from three fundamental limitations:

1. **Passive Text Dump:** Traditional apps act as inert text boxes. They don't inquire, spot recurring cognitive blind spots, or help you brainstorm solutions.
2. **Missing Spatial & Environmental Context:** Thoughts and epiphanies are deeply tied to *where* they happen—a quiet morning walk in a bamboo garden, a bustling city café, or an alpine retreat.
3. **Data Privacy & Security Concerns:** Journal entries contain deeply private thoughts. Users need mathematical guarantees that their data is isolated, encrypted, and accessible solely by their authenticated identity.

To solve this, we built **Gemini Reflection Studio**—a full-stack, user-authenticated AI journaling companion powered by **Gemini 3.6 Flash**, **Cloud Firestore User Isolation Rules**, and **Google Maps Platform** spatial grounding.

---

## 📸 Complete User Workflow & Step-by-Step Screenshots

Below is the complete step-by-step visual demonstration of how users experience logging in, configuring thinking personas, conversing with Gemini 3.6 Flash, grounding reflections on Google Maps, and managing isolated Cloud Firestore history.

---

### **Step 1: Google Authentication & Zero-Trust Workspace Setup**
Users log in with Google Sign-In or explore instantly via an anonymous guest session. Cloud Firestore provisions a dedicated, user-isolated path at `/users/{userId}/entries`.

![Step 1: Google Authentication and Isolation](screenshots/step1_auth_isolation.svg)
*Figure 1.0 — Google Sign-In authentication with mathematical zero-knowledge Firestore isolation.*

---

### **Step 2: Choosing Thinking Modalities & Stream-of-Consciousness Input**
Users choose from four cognitive reflection personas (*Deep Inquire*, *Creative Brainstorm*, *Synthesize*, or *Action Items*) and dictate or type their unorganized thoughts.

![Step 2: Thinking Modalities and Stream Input](screenshots/step2_modalities_studio.svg)
*Figure 2.0 — Modality selection bar and raw stream-of-consciousness text editor.*

---

### **Step 3: Multi-Turn AI Reasoning & Auto-Synthesized Action Items**
Gemini 3.6 Flash engages in an ongoing reflection dialogue, simultaneously outputting emotional tone, executive takeaways, and structured action items with interactive checklist states.

![Step 3: Gemini 3.6 Flash Reasoning and Action Items](screenshots/step3_gemini_reasoning.svg)
*Figure 3.0 — Gemini 3.6 Flash reasoning dialogue alongside auto-extracted action items and executive summary.*

---

### **Step 4: Spatial Grounding with Google Maps Platform & Weather**
Thoughts are anchored to physical places (Kyoto Sanctuary, Alpine Cabin, SF Workspace) alongside ambient meteorological weather data, infusing environmental presence into the AI's responses.

![Step 4: Google Maps Spatial Grounding and Weather](screenshots/step4_spatial_maps.svg)
*Figure 4.0 — Google Maps interactive world stage and atmospheric weather anchor.*

---

### **Step 5: Cloud Firestore Timeline & 1-Click Markdown Export**
Sessions are synchronized to Cloud Firestore in real-time. Users can search by keyword, filter by emotional sentiment, and download clean Markdown for Obsidian or Notion.

![Step 5: Cloud Firestore History and Markdown Export](screenshots/step5_history_export.svg)
*Figure 5.0 — Real-time Firestore history timeline with sentiment tags and 1-click Markdown export.*

---

### **Step 6: Provable Database Security Rules & Admin Governance**
Strict database-level rules ensure that only authenticated owners can access their journal entries. The Admin Governance dashboard provides real-time audit telemetry and role-based access control.

![Step 6: Zero-Knowledge Security Rules and Audit](screenshots/step6_security_rules.svg)
*Figure 6.0 — Deployed Firestore security rules and real-time cross-boundary access test matrix.*

---

## 🏗️ Architectural Overview

```
 ┌────────────────────────────────────────────────────────┐
 │                   Client Layer (React 18 + Vite)       │
 │  - Google Identity Services Authentication (Popup)     │
 │  - Multi-Turn Reflection Studio & Audio Stream         │
 │  - Google Maps Spatial Pinning & Weather Context       │
 │  - Real-Time Firestore Subscription & Markdown Export  │
 └───────────────────────┬────────────────────────────────┘
                         │
      ┌──────────────────┴──────────────────┐
      ▼                                     ▼
┌───────────────────────────────┐ ┌──────────────────────────────────┐
│    Cloud Firestore DB         │ │      Server-Side API Gateway     │
│  - Path: /users/{uid}/entries │ │      (Express + TypeScript)      │
│  - Rule: request.auth.uid     │ │  - Gemini 3.6 Flash LLM Ladder   │
│          == userId            │ │  - Schema-Enforced Extraction    │
│  - Zero-Knowledge Isolation   │ │  - Webhook Dispatcher (Slack/    │
│  - Real-Time onSnapshot Sync  │ │    Discord/Email)                │
└───────────────────────────────┘ └──────────────────────────────────┘
```

---

## 💻 Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, React Markdown
- **AI & Reasoning:** Google Gemini 3.6 Flash via `@google/genai` TypeScript SDK
- **Backend:** Node.js, Express, ESBuild bundler
- **Database & Auth:** Google Firebase Auth (Google Sign-In + Anonymous), Cloud Firestore
- **Spatial:** Google Maps Platform APIs (Places, Geocoding, Dynamic Canvas)
- **Deployment:** Google Cloud Run containerized deployment

---

## 🎯 Submission Verification Checklist

- [x] **Active Public Endpoint:** [https://ais-pre-rd64k74ouyenk7tcawcie6-586821086323.asia-southeast1.run.app](https://ais-pre-rd64k74ouyenk7tcawcie6-586821086323.asia-southeast1.run.app)
- [x] **Step-by-Step Screenshots in Blog:** All 6 steps with figures embedded directly in `BLOG.md` and the in-app Blog tab.
- [x] **GitHub Repository:** [https://github.com/sha0015/ai-app](https://github.com/sha0015/ai-app)
- [x] **Zero-Knowledge Security Rules:** Cryptographic enforcement via `firestore.rules`.
- [x] **Gemini 3.6 Flash Reasoning:** Multi-turn reflection and JSON schema-enforced artifact generation.

*Built with ❤️ using Google AI Studio, Gemini 3.6 Flash, Cloud Firestore, and Google Maps Platform.*
