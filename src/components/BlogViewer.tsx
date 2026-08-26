import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink,
  Code2,
  Terminal,
  Cpu,
  Layers,
  Database,
  ArrowRight
} from 'lucide-react';

export const BlogViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Blog Hero Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full uppercase tracking-wider">
              Engineering Deep Dive
            </span>
            <span className="text-xs text-slate-500 font-mono">
              August 2026 • 6 min read
            </span>
          </div>

          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
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

      {/* Section 1: The Problem */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-mono font-bold">01</span>
          The Problem: Inert Text Boxes vs. Intelligent Companions
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Daily journaling and self-inquiry are vital for strategic decision-making and cognitive well-being. However, most digital journal apps are essentially dumb text inputs:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold text-rose-700 uppercase">Passive Text Dump</span>
            <p className="text-xs text-slate-600">No active questioning, counter-balancing perspectives, or automated executive summaries.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold text-amber-700 uppercase">Spatial Disconnection</span>
            <p className="text-xs text-slate-600">Epiphanies are tied to environments (cafés, mountain walks, studios), yet context is completely discarded.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold text-blue-700 uppercase">Privacy Hazards</span>
            <p className="text-xs text-slate-600">Users hesitate to write vulnerable thoughts without explicit database-level cryptographic isolation guarantees.</p>
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
