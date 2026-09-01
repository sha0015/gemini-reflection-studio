import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
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
  Zap,
  ArrowRight,
  ShieldAlert,
  Users,
  LineChart,
  ListTodo,
  Globe,
  Share2,
  KeyRound,
  Compass,
  Mic,
  Activity,
  HeartHandshake
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

  const storyChapters = [
    {
      id: 1,
      chapter: 'Chapter 1',
      title: 'The Sanctuary Gate: Google Auth & Zero-Trust Guest Sandbox',
      badge: 'Identity & Isolation',
      storyNarrative: 'Before a vulnerable thought is penned, the user steps through a zero-trust gateway. Authenticated accounts establish cryptographic partitions in Cloud Firestore (/users/{uid}/entries), while evaluators can instantly test in the zero-trust Guest Sandbox where state remains strictly local in browser memory.',
      technicalDetails: 'Enforces Google Identity OAuth 2.0 with default-deny Firestore security rules (match /{document=**} { allow read, write: if false; }). Guest mode maintains an offline localStorage buffer with automated synchronization queues.',
      screenshot: '/screenshots/step1_auth_isolation.svg',
      tags: ['Google Identity', 'Owner Partitioning', 'Zero-Trust Sandbox', 'Default Deny Rules']
    },
    {
      id: 2,
      chapter: 'Chapter 2',
      title: 'The Sound of Clarity: 7 Cognitive Personas & Live Voice Dictation',
      badge: 'Multi-Modal Voice & Empathy',
      storyNarrative: 'The user begins to speak. Using the browser-native Web Speech API with real-time waveform pulses, raw streams of consciousness flow directly into the editor. Rather than generic replies, the user engages with 7 tailored thinking personas—from Socratic inquiry and Stoic CBT reframing to Somatic mindfulness.',
      technicalDetails: 'Direct integration with Web Speech API for low-latency dictation. Gemini 3.7 Flash dynamically shapes conversational temperature and system framing based on active persona. Privacy Shield regex strips client-side PII (API keys, SSNs, emails) before network dispatch.',
      screenshot: '/screenshots/step2_modalities_studio.svg',
      tags: ['Web Speech API', '7 Cognitive Personas', 'Privacy Shield Regex', 'Distress Routing']
    },
    {
      id: 3,
      chapter: 'Chapter 3',
      title: 'The Mathematical Vault: Mandatory Client-Side WebCrypto (256-bit)',
      badge: 'Dual Key-Wrap Cryptography',
      storyNarrative: 'When the user saves their reflection, zero-knowledge architecture takes over. The entry is encrypted in the local browser thread under a random 32-byte Data Encryption Key (DEK) with AES-GCM (256-bit). The DEK is then dual-wrapped via PBKDF2 (100,000 rounds) under both a user passphrase and a 12-word recovery phrase. Firestore strictly receives opaque ciphertext.',
      technicalDetails: 'Mandatory on all authenticated saves. Cloud Firestore documents store solely the ciphertext envelope (v: 2, iv, ct, keyWraps). The live cryptographic proof panel renders the raw stored ciphertext side-by-side with in-memory decrypted views for verifiable auditing.',
      screenshot: '/screenshots/step3_gemini_reasoning.svg',
      tags: ['AES-GCM 256-bit', 'PBKDF2 100,000 Rounds', '12-Word Recovery', 'Zero Plaintext At Rest']
    },
    {
      id: 4,
      chapter: 'Chapter 4',
      title: 'The Physical Grounding & SSRF-Hardened Webhook Dispatcher',
      badge: 'Spatial Grounding & Webhooks',
      storyNarrative: 'Cognitive reflection is deeply tied to physical environment. The studio connects with Nominatim reverse geocoding and Open-Meteo live weather metrics (18°C Misty Zen in Kyoto) to enrich Gemini reasoning prompts. Actionable commitments can be dispatched directly to team channels via an SSRF-hardened outbound gateway.',
      technicalDetails: 'Spatial context injection into Gemini system instructions. Webhook dispatcher enforces DNS pre-resolution, blocking IPv4/IPv6 private ranges (10.0.0.0/8, 192.168.0.0/16), loopback (127.0.0.1), link-local/cloud metadata (169.254.169.254), and CGNAT (100.64.0.0/10) with tiered rate limiting (20 req/10min).',
      screenshot: '/screenshots/step4_spatial_maps.svg',
      tags: ['Nominatim Geocoding', 'Open-Meteo Weather', 'SSRF IP Guard', 'Slack & Discord Formats']
    },
    {
      id: 5,
      chapter: 'Chapter 5',
      title: 'The Fortress Walls: 5-Zone AI Threat Modeling & OWASP Reviewer',
      badge: 'AI Security & Threat Modeling',
      storyNarrative: 'To ensure the companion remains impervious to prompt injection and exfiltration, an embedded security research lab decomposes architectures across 5 distinct threat zones (Input Surfaces, Planning, Tool Execution, Memory, Inter-System Comm), mapping every vulnerability to OWASP Top 10, OWASP LLM01–LLM10, and STRIDE with automated code patches.',
      technicalDetails: 'Gemini 3.7 Flash generates unified git diffs and test matrices. An LLM-guided data flow tracer models taint from Source to Sink. A deterministic regex AST scanner audits firestore.rules for wildcard bypasses and missing owner checks with zero hallucinations.',
      screenshot: '/screenshots/step5_threat_modeling.svg',
      tags: ['5 Threat Zones', 'STRIDE & OWASP LLM', 'LLM Data-Flow Trace', 'Deterministic Rules Engine']
    },
    {
      id: 6,
      chapter: 'Chapter 6',
      title: 'The Shared Circle & Longitudinal Cognitive Synthesis',
      badge: 'Peer Circles & Habit Growth',
      storyNarrative: 'When sharing deep reflections with mentors, Reflection Circles automatically anonymizes identifying companies and names into generic peer roles. Multi-week archives are then synthesized by the Longitudinal Pattern Agent to extract cognitive clarity scores, stress triggers, and follow-through resilience across a 3-state action machine.',
      technicalDetails: 'AI role-based entity anonymization with visual before/after diffs. Time-bounded, revocable capability grants in Firestore (/shares/{shareId}). 3-state action state machine (open, done, dropped) prevents guilt while tracking longitudinal behavioral growth.',
      screenshot: '/screenshots/step6_security_rules.svg',
      tags: ['AI Redaction Diffs', 'Capability-Based Grants', 'Longitudinal Pattern Agent', '3-State Action Machine']
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Blog Hero Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              Story Mode Architecture Blog
            </span>
            <span className="text-xs text-slate-500 font-mono">
              August 2026 • 8 min read
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
          The Architect's Odyssey: Building Gemini Reflection Studio &amp; AI Security Suite 🪞🛡️
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
          A narrative deep dive into how we paired Gemini 3.7 Flash reasoning with mandatory client-side WebCrypto encryption, SSRF-hardened webhooks, 5-zone AI threat modeling, and privacy-preserving peer circles.
        </p>

        {/* Story Index Badges */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-700 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>Gemini 3.7 Flash Engine</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-700 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Lock className="w-4 h-4 text-purple-600" />
            <span>WebCrypto AES-GCM (256-bit)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-700 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>5-Zone Threat Modeling</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-700 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Globe className="w-4 h-4 text-amber-600" />
            <span>Open-Meteo Spatial Grounding</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-700 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Share2 className="w-4 h-4 text-indigo-600" />
            <span>SSRF-Hardened Webhooks</span>
          </div>
        </div>
      </div>

      {/* STORY CHAPTERS SECTION WITH EMBEDDED SCREENSHOTS */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-mono font-bold">01</span>
              <h2 className="text-lg font-bold text-slate-900">Story Mode Chapters &amp; Architectural Blueprints</h2>
            </div>
            <p className="text-slate-500 text-xs mt-1">Journey through the 6 chapters from raw thought to cryptographic proof, peer sharing, and security threat modeling</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            Chapter {activeStep} of 6
          </span>
        </div>

        {/* Chapter Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {storyChapters.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveStep(c.id)}
              className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                activeStep === c.id
                  ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 shadow-xs ring-1 ring-emerald-500'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-600 hover:bg-slate-100/70'
              }`}
            >
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">{c.chapter}</div>
              <div className="text-xs font-bold truncate mt-0.5">{c.badge}</div>
            </button>
          ))}
        </div>

        {/* Active Chapter Card */}
        {(() => {
          const current = storyChapters.find(s => s.id === activeStep) || storyChapters[0];
          return (
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 text-white shadow-md space-y-0">
              <div className="p-5 border-b border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{current.chapter}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs font-semibold text-slate-400">{current.badge}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mt-1">{current.title}</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {current.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono font-medium border border-slate-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Embedded Screenshot Graphic */}
              <div className="p-6 bg-slate-950 flex flex-col items-center justify-center border-b border-slate-800">
                <div className="w-full rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900">
                  <img 
                    src={current.screenshot} 
                    alt={current.title}
                    className="w-full h-auto object-cover rounded-xl"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-900/90 space-y-5">
                {/* Narrative Section */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Story &amp; User Journey</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed italic">{current.storyNarrative}</p>
                </div>

                {/* Technical Blueprint Section */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <Cpu className="w-3.5 h-3.5 text-blue-400" />
                    <span>Technical Architecture &amp; Implementation</span>
                  </div>
                  <p className="text-xs font-mono text-slate-300 leading-relaxed">{current.technicalDetails}</p>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setActiveStep(prev => prev > 1 ? prev - 1 : 6)}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    Previous Chapter
                  </button>
                  <button
                    onClick={() => setActiveStep(prev => prev < 6 ? prev + 1 : 1)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next Chapter</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* CORE PHILOSOPHY & CRAFTSMANSHIP GRID */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-800 flex items-center justify-center text-xs font-mono font-bold">02</span>
          <h2 className="text-lg font-bold text-slate-900">Core Engineering Invariants</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 text-purple-800 font-bold text-sm">
              <Lock className="w-4 h-4 text-purple-600" />
              <span>Zero Plaintext at Rest in Cloud Firestore</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real reflections are never written to Firestore in plaintext. WebCrypto AES-GCM (256-bit) and PBKDF2 (100,000 rounds) encrypt content in the local browser thread under independent dual key-wraps (passphrase + 12-word mnemonic phrase).
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>5-Zone Agentic AI Threat Modeling</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Decomposes complex AI pipelines across Input Surfaces, Planning, Tool Execution, Memory, and Inter-System Communication, mapping every vulnerability to OWASP Top 10, OWASP LLM01–LLM10, and STRIDE with automated code remediation diffs.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>AI Entity Redaction Diffs for Peer Circles</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Share authentic reflections with mentors using Gemini 3.7 Flash's automated role-based entity anonymizer. Side-by-side visual diffs let users inspect redactions before granting time-bounded, revocable capability access in Firestore.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>SSRF-Hardened Webhooks &amp; Spatial Grounding</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Combines Nominatim reverse geocoding and live Open-Meteo weather telemetry with an SSRF-hardened outbound webhook gateway that rigorously verifies DNS IP resolutions to block all private, loopback, and cloud-metadata addresses.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 md:col-span-2">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>Server-Side Secret Management &amp; 4-Tier Model Resilience Ladder</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              API secrets are securely managed on the Express server via environment variables (<code className="bg-amber-100/70 text-amber-900 px-1 py-0.5 rounded font-mono text-[11px]">process.env.GEMINI_API_KEY</code>)—never exposed or bundled in client code. The server dynamically cascades across a 4-tier model resilience ladder (<code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">gemini-3.7-flash</code> &rarr; <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">gemini-3.6-flash</code> &rarr; <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">gemini-3.1-flash-lite</code> &rarr; <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">gemini-flash-latest</code>) with deterministic offline fallbacks to gracefully absorb rate limits (HTTP 429/503) without downtime.
            </p>
          </div>
        </div>
      </section>

      {/* VERIFIED ZERO-KNOWLEDGE SECURITY RULES */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-mono font-bold">03</span>
          <h2 className="text-lg font-bold text-slate-900">Verified Cloud Firestore Security Rules (Zero-Knowledge Invariant)</h2>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
          <code>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() { return request.auth != null; }
    function isOwner(userId) { return isAuthenticated() && request.auth.uid == userId; }

    // Default deny on all root collections
    match /{document=**} { allow read, write: if false; }

    // User profile isolation
    match /users/{userId} { allow read, write: if isOwner(userId); }

    // User reflection partition (raw ciphertext envelopes)
    match /users/{userId}/entries/{entryId} { allow read, write: if isOwner(userId); }

    // Time-bounded peer capability grants
    match /shares/{shareId} {
      allow create: if isAuthenticated() && request.resource.data.sharerUid == request.auth.uid;
      allow read: if isAuthenticated() && (
        resource.data.sharerUid == request.auth.uid ||
        (resource.data.granteeUid == request.auth.uid && resource.data.revoked == false && request.time < resource.data.expiresAt)
      );
      allow update, delete: if isAuthenticated() && resource.data.sharerUid == request.auth.uid;
    }
  }
}`}</code>
        </pre>
      </section>
    </div>
  );
};
