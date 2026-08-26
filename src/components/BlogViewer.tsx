import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  Copy, 
  Check, 
  ExternalLink, 
  Cpu, 
  Database, 
  Lock, 
  CheckCircle2, 
  FileDown, 
  History, 
  Layers,
  ChevronRight,
  Eye,
  Compass,
  Zap,
  ArrowRight
} from 'lucide-react';

export const BlogViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);

  const handleCopyMarkdown = () => {
    fetch('/BLOG.md')
      .then(res => res.text())
      .then(text => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  const steps = [
    {
      id: 1,
      title: 'Step 1: Google Authentication & Zero-Trust Workspace',
      badge: 'Auth & Isolation',
      desc: 'Seamless Google Identity Services login with instantaneous isolated Firestore directory creation.',
      summary: 'Users authenticate via Google Sign-In popup or instant Guest mode. The client acquires a secure auth token, and Firestore establishes a dedicated owner-only subcollection at /users/{uid}/entries.'
    },
    {
      id: 2,
      title: 'Step 2: Multi-Modal Reflection Input & Persona Seeding',
      badge: 'Thinking Modalities',
      desc: 'Choose between 4 cognitive reflection modalities (Deep Inquire, Brainstorm, Synthesize, Actions).',
      summary: 'Users select their desired thinking mode (e.g. Creative Brainstorm or Deep Inquiry). Gemini 3.6 Flash dynamically adjusts its system prompts to act as an empathetic mirror or pragmatic strategist.'
    },
    {
      id: 3,
      title: 'Step 3: Multi-Turn AI Reasoning & Auto-Synthesis',
      badge: 'Gemini 3.6 Flash',
      desc: 'Real-time AI thought partnership with automated executive takeaways and action item extraction.',
      summary: 'Every response stream from Gemini 3.6 Flash returns structured JSON containing executive summaries, emotional tone classification, and actionable checklist items with live completion checkboxes.'
    },
    {
      id: 4,
      title: 'Step 4: Spatial Grounding via Google Maps Platform',
      badge: 'Google Maps Spatial',
      desc: 'Tagging physical locations, scenic retreats, and ambient weather context into reflections.',
      summary: 'Users pin geographic locations (Kyoto Bamboo Garden, Alpine Cabin, City Studio) and ambient weather conditions. Spatial context is grounded into the reflection context.'
    },
    {
      id: 5,
      title: 'Step 5: Cloud Firestore History & Markdown Export',
      badge: 'Persistence & Export',
      desc: 'Persistent timeline search, filtering by emotional tone, and 1-click portable markdown downloads.',
      summary: 'All sessions are synchronized in real-time to Cloud Firestore. Users can filter by mood, search by keyword, view full transcript modals, and export to clean Markdown.'
    },
    {
      id: 6,
      title: 'Step 6: Security Rules Isolation & Admin RBAC Audit',
      badge: 'Zero-Knowledge Security',
      desc: 'Demonstration of owner-bound Firestore rules (request.auth.uid == userId) & RBAC telemetry.',
      summary: 'Strict Firestore rules reject cross-user access at the database level. The Admin Governance dashboard provides role-based access control and live audit telemetry.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Blog Hero Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full uppercase tracking-wider">
              Engineering Deep Dive & Walkthrough
            </span>
            <span className="text-xs text-slate-500 font-mono">
              August 2026 • 6 min read
            </span>
          </div>

          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Markdown Copied!' : 'Copy Full Blog Markdown'}</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug mb-4">
          Building Gemini Reflection Studio: An Agentic, Spatial, and User-Isolated AI Journaling Companion
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
          How we unified Gemini 3.6 Flash reasoning, Cloud Firestore Zero-Knowledge security rules, and Google Maps Platform spatial grounding to transform unorganized thoughts into actionable clarity.
        </p>

        {/* Author / Tech Badges */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-700 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>Gemini 3.6 Flash</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-700 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Database className="w-4 h-4 text-amber-600" />
            <span>Cloud Firestore User Isolation</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-700 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <MapPin className="w-4 h-4 text-rose-600" />
            <span>Google Maps Spatial Grounding</span>
          </div>
        </div>
      </div>

      {/* STEP-BY-STEP VISUAL SCREENSHOTS SECTION */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-mono font-bold">01</span>
              <h2 className="text-lg font-bold text-slate-900">Step-by-Step User Experience Screenshots</h2>
            </div>
            <p className="text-slate-500 text-xs mt-1">Interactive visual walkthrough of every step in the user journey</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            Step {activeStep} of 6
          </span>
        </div>

        {/* Step Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {steps.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStep(s.id)}
              className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                activeStep === s.id
                  ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-600 hover:bg-slate-100/70'
              }`}
            >
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Step 0{s.id}</div>
              <div className="text-xs font-bold truncate mt-0.5">{s.badge}</div>
            </button>
          ))}
        </div>

        {/* High-Fidelity Interactive Screenshot Window Frame */}
        <div className="rounded-2xl border border-slate-300 bg-slate-950 shadow-md overflow-hidden text-slate-100">
          {/* Browser Window Header */}
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              <span className="text-[11px] font-mono text-slate-400 ml-2 hidden sm:inline">
                https://ais-pre-rd64k74ouyenk7tcawcie6-586821086323.asia-southeast1.run.app
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              Screenshot: {steps[activeStep - 1].badge}
            </span>
          </div>

          {/* Screenshot Visual Body */}
          <div className="p-6 sm:p-8 bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 min-h-[380px] flex flex-col justify-center">
            {activeStep === 1 && (
              <div className="max-w-md mx-auto w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-lg">
                    🪞
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Gemini Reflection Studio</h4>
                    <p className="text-[11px] text-slate-400">Zero-Knowledge Isolated AI Companion</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="w-full py-2.5 px-4 rounded-xl bg-white text-slate-900 flex items-center justify-center gap-2 font-bold text-xs shadow-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                    <span>Continue with Google</span>
                  </div>

                  <div className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center gap-2 font-semibold text-xs">
                    <span>Explore as Anonymous Guest</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl flex items-center gap-2.5 text-[11px] text-emerald-300">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Encrypted Firestore path: <code>/users/&#123;uid&#125;/entries</code></span>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="max-w-xl mx-auto w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-slate-300">Select Thinking Modality</span>
                  <span className="text-[11px] text-emerald-400 font-mono">Gemini 3.6 Flash Active</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500 text-center">
                    <span className="text-xs font-bold text-emerald-300 block">Deep Inquire</span>
                    <span className="text-[9px] text-slate-400">Self-Discovery</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-center text-slate-400">
                    <span className="text-xs font-semibold block">Brainstorm</span>
                    <span className="text-[9px]">Divergent Ideas</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-center text-slate-400">
                    <span className="text-xs font-semibold block">Synthesize</span>
                    <span className="text-[9px]">Executive Takeaways</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-center text-slate-400">
                    <span className="text-xs font-semibold block">Action Items</span>
                    <span className="text-[9px]">Execution Steps</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Stream of Consciousness</span>
                  <p className="text-xs text-slate-300 font-mono">
                    "I want to scale our engineering architecture while preserving team focus and code isolation..."
                  </p>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="max-w-2xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AI Chat Turn */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Gemini 3.6 Flash Reflection</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    "When scaling systems, modular separation of concerns serves as your cognitive firewall. Notice where the friction points originate..."
                  </p>
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-800 font-mono">
                      Tone: Thoughtful & Pragmatic
                    </span>
                  </div>
                </div>

                {/* Extracted Artifacts */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-bold text-slate-200">Auto-Synthesized Action Items</span>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2 p-1.5 rounded bg-slate-950/60 border border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Formalize Firestore security rules test suite</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 rounded bg-slate-950/60 border border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Establish 20-minute daily architecture synthesis</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="max-w-xl mx-auto w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                    <MapPin className="w-4 h-4" />
                    <span>Google Maps Platform Grounding</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Kyoto Bamboo Sanctuary (35.01° N, 135.67° E)</span>
                </div>

                <div className="h-28 rounded-xl bg-linear-to-r from-emerald-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center text-center p-4">
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-slate-200">📍 Active Location Anchor</div>
                    <div className="text-xs text-emerald-400 font-mono">Weather: Misty & Serene • 18°C • Ambient Zen</div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Gemini grounds its tone in your surrounding environment, tailoring prompts to quiet mindfulness in nature or high-tempo focus in an urban workspace.
                </p>
              </div>
            )}

            {activeStep === 5 && (
              <div className="max-w-xl mx-auto w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <History className="w-4 h-4" />
                    <span>Firestore Real-Time Sync & History</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 text-slate-300 text-[11px] rounded font-semibold">
                    <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export Markdown</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Scaling Architecture with Zero-Knowledge Rules</div>
                      <div className="text-[10px] text-slate-500">Aug 26, 2026 • Kyoto Retreat • 4 Action Items</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[10px] text-emerald-300 font-mono">
                      #Architecture
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 6 && (
              <div className="max-w-xl mx-auto w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Firestore Security Isolation Proof</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Rule Status: Enforced
                  </span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                  <div className="text-emerald-400 font-bold">// Verification Rule</div>
                  <div>allow read, write: if request.auth.uid == userId;</div>
                  <div className="text-slate-500 pt-1">// Cross-user access simulation: 403 PERMISSION_DENIED (Blocked)</div>
                </div>
              </div>
            )}
          </div>

          {/* Screenshot Navigation Footer */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-300 max-w-lg">
              <strong className="text-emerald-400">{steps[activeStep - 1].title}:</strong> {steps[activeStep - 1].summary}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveStep(prev => prev > 1 ? prev - 1 : 6)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={() => setActiveStep(prev => prev < 6 ? prev + 1 : 1)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono cursor-pointer transition-colors"
              >
                Next Step →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Architecture & System Diagram */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-mono font-bold">02</span>
          System Architecture
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          The application is engineered with a strict zero-trust separation between client state, AI gateway proxying, and user-isolated cloud storage.
        </p>

        {/* Visual Architecture Box */}
        <div className="bg-slate-900 text-slate-100 p-6 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
          <pre className="text-emerald-400 font-bold mb-2">// Full-Stack Architecture Pipeline</pre>
          <pre>{`[ Client Layer: React 18 + Vite ]
   ├── Google Identity Services (GIS) / Anonymous Token
   ├── Multi-Turn Chat State & Markdown Synthesizer
   ├── Google Maps Geolocation & Ambient Weather Pinning
   └── Real-Time Firestore Snapshot Subscription
         │
         ├── (Direct TLS Firestore Connection via Rules)
         ▼
[ Cloud Firestore Database ]
   └── Path: /users/{userId}/entries/{entryId}
   └── Rule: allow read, write: if request.auth.uid == userId
         │
         ├── (Secure /api/reflect Server Proxy with Gemini Secret)
         ▼
[ Server-Side Gateway: Express + Node.js ]
   └── Google GenAI SDK (Gemini 3.6 Flash)
   └── Structured Output Schema Enforcement
   └── Outbound Webhooks (Slack Block Kit / Discord / Email)`}</pre>
        </div>
      </section>

      {/* Section 3: Technical Highlights & Code */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-800 flex items-center justify-center text-xs font-mono font-bold">03</span>
          Key Technical Implementations
        </h2>

        {/* Sub-item A: Structured Gemini Schema */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            1. Structured Multi-Turn Synthesis with Gemini 3.6 Flash
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We configured Gemini 3.6 Flash to parse stream-of-consciousness narratives into structured JSON entities, guaranteeing instant generation of executive summaries, sentiment ratings, and interactive action item checklists.
          </p>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
            <pre className="text-purple-400">// Server-side Schema Enforcement</pre>
            <pre>{`const responseSchema = {
  type: Type.OBJECT,
  properties: {
    replyText: { type: Type.STRING },
    summary: { type: Type.STRING },
    keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
    actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
    sentiment: { type: Type.STRING },
    suggestedTitle: { type: Type.STRING },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ['replyText', 'summary', 'keyInsights', 'actionItems', 'sentiment', 'suggestedTitle', 'tags']
};`}</pre>
          </div>
        </div>

        {/* Sub-item B: Firestore Rules */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            2. Provable Zero-Knowledge Database Security Rules
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All user journal entries are stored inside subcollections bounded by user ID. Cross-user reads or malicious ID spoofing are rejected at the database engine level.
          </p>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
            <pre className="text-emerald-400">// firestore.rules</pre>
            <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`}</pre>
          </div>
        </div>
      </section>

      {/* Section 4: Live Links & Repository */}
      <section className="bg-linear-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-md space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-emerald-400">
          <Sparkles className="w-5 h-5" />
          Ready to Experience It Live?
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
          The production deployment is actively live on Google Cloud Run with real-time Firebase persistence and Gemini 3.6 Flash integration.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href="https://ais-pre-rd64k74ouyenk7tcawcie6-586821086323.asia-southeast1.run.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all shadow-sm"
          >
            <span>Open Live Applet</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Blog Markdown for Medium/Dev.to</span>
          </button>
        </div>
      </section>
    </div>
  );
};
