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
  ListTodo
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
      title: 'Step 1: Google Authentication & Zero-Trust Guest Sandbox',
      badge: 'Auth & Isolation',
      desc: 'Seamless Google Identity Services login with instant Guest Sandbox fallback.',
      summary: 'Users authenticate via Google Sign-In or test immediately via the Guest Sandbox. Firestore security rules enforce strict owner-bound data partitions (/users/{uid}/entries) with zero public access defaults.'
    },
    {
      id: 2,
      title: 'Step 2: Multi-Modal Reflection Input & 7 Cognitive Personas',
      badge: 'Cognitive Modes',
      desc: 'Voice dictation via Web Speech API and 7 specialized reflection personas.',
      summary: 'Choose between Socratic Inquire, Stoic CBT Reframing, Lateral Brainstorming, Executive Synthesis, First Principles, Action Items, and Somatic Mindfulness. Gemini 3.7 Flash dynamically tailors its system prompt for deep empathy and actionable clarity.'
    },
    {
      id: 3,
      title: 'Step 3: True Client-Side WebCrypto AES-GCM (256-bit) Encryption',
      badge: 'Zero-Knowledge Crypto',
      desc: 'In-browser encryption before network dispatch with live Cryptographic Proof Panel.',
      summary: 'Reflections are encrypted using WebCrypto AES-GCM with PBKDF2 (100,000 rounds). The live proof panel lets judges inspect raw ciphertext envelopes stored in Firestore vs decrypted UI in real time.'
    },
    {
      id: 4,
      title: 'Step 4: 5-Zone Threat Modeling & OWASP Security Reviewer',
      badge: 'AI Security Suite',
      desc: 'Live Gemini 3.7 Flash STRIDE analysis, AST taint scanning, and rule static validation.',
      summary: 'Security is provable: the embedded 5-Zone Threat Modeling Studio decomposes architectures across Input Surfaces, Planning, Tool Execution, Memory, and Inter-System communication, mapping vulnerabilities to OWASP LLM01-LLM10.'
    },
    {
      id: 5,
      title: 'Step 5: Reflection Circles with AI Redaction Diffs',
      badge: 'Privacy Peer Sharing',
      desc: 'Automated role-based entity sanitization with side-by-side visual diffs.',
      summary: 'When sharing reflections with a mentor or peer, Gemini 3.7 Flash automatically detects and redacts identifying names, employers, and locations into generic roles. Users review the diff before generating time-bounded capability grants.'
    },
    {
      id: 6,
      title: 'Step 6: Longitudinal Pattern Agent & Action Item State Machine',
      badge: 'Longitudinal Growth',
      desc: 'Cross-entry cognitive synthesis and 3-state commitment tracking.',
      summary: 'The longitudinal agent analyzes multi-week archives to identify recurring cognitive triggers and environmental clarity patterns. The action item state machine closes the loop on insights with open, done, and dropped states.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Blog Hero Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full uppercase tracking-wider">
              Engineering Deep Dive &amp; Architecture
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
          Building Gemini Reflection Studio &amp; AI Security Suite
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
          How we combined Gemini 3.7 Flash reasoning, True Client-Side WebCrypto AES-GCM Encryption, 5-Zone Threat Modeling, and Privacy-Preserving Reflection Circles into a next-generation AI companion.
        </p>

        {/* Tech Badges */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-700 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>Gemini 3.7 Flash</span>
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
            <Database className="w-4 h-4 text-amber-600" />
            <span>Cloud Firestore Zero-Knowledge</span>
          </div>
        </div>
      </div>

      {/* STEP-BY-STEP VISUAL TOUR SECTION */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-mono font-bold">01</span>
              <h2 className="text-lg font-bold text-slate-900">Step-by-Step Architecture &amp; User Experience</h2>
            </div>
            <p className="text-slate-500 text-xs mt-1">Interactive walkthrough of the 6 core pillars of Gemini Reflection Studio</p>
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
              <div className="text-[10px] font-mono font-bold text-slate-600 uppercase">Step 0{s.id}</div>
              <div className="text-xs font-bold truncate mt-0.5">{s.badge}</div>
            </button>
          ))}
        </div>

        {/* Active Step Display Card */}
        {(() => {
          const current = steps.find(s => s.id === activeStep) || steps[0];
          return (
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 text-white shadow-md">
              <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{current.badge}</span>
                  <h3 className="text-base font-bold text-slate-100 mt-0.5">{current.title}</h3>
                </div>
                <div className="text-xs text-slate-400">{current.desc}</div>
              </div>

              <div className="p-6 bg-slate-900/90 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Technical Breakdown &amp; Implementation</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{current.summary}</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setActiveStep(prev => prev > 1 ? prev - 1 : 6)}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    Previous Pillar
                  </button>
                  <button
                    onClick={() => setActiveStep(prev => prev < 6 ? prev + 1 : 1)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next Pillar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* CORE ARCHITECTURE & DESIGN HIGHLIGHTS */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-800 flex items-center justify-center text-xs font-mono font-bold">02</span>
          <h2 className="text-lg font-bold text-slate-900">Core Innovations &amp; Authenticity Pillars</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>5-Zone Agentic Threat Modeling</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Decomposes agentic AI architectures across Input Surfaces, Planning &amp; Reasoning, Tool Execution, Memory &amp; Storage, and Inter-System Communication with Gemini 3.7 Flash generating STRIDE and OWASP LLM mappings.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 text-purple-800 font-bold text-sm">
              <Lock className="w-4 h-4 text-purple-600" />
              <span>True Client-Side AES-GCM (256-bit)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Reflections are encrypted in the browser thread via PBKDF2 (100,000 rounds) before leaving your device. Cloud Firestore strictly holds encrypted envelopes (<code className="font-mono text-[11px]">iv</code>, <code className="font-mono text-[11px]">ct</code>, <code className="font-mono text-[11px]">salt</code>).
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Reflection Circles &amp; Redaction Diffs</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Share authentic reflections with mentors or trusted peers with automated AI entity sanitization replacing specific names and companies with generic roles.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <LineChart className="w-4 h-4 text-emerald-600" />
              <span>Longitudinal Pattern Agent</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Synthesizes multi-week journal archives to extract recurring cognitive stressors, environmental clarity correlations, and an Intentional Growth index over time.
            </p>
          </div>
        </div>
      </section>

      {/* VERIFIED SECURITY RULES CODE EXCERPT */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-mono font-bold">03</span>
          <h2 className="text-lg font-bold text-slate-900">Verified Cloud Firestore Security Rules (Zero-Knowledge)</h2>
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
