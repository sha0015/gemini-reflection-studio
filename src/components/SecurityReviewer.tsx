import React, { useState } from 'react';
import { 
  CodeXml, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowRight, 
  GitCompare,
  KeyRound,
  FileWarning,
  RefreshCw
} from 'lucide-react';
import { SecurityReviewResult, SecurityVulnerability } from '../types';

const SAMPLE_CODE_SNIPPETS = [
  {
    id: 'hardcoded-key-and-xss',
    title: 'Hardcoded API Key & Insecure Output (OWASP A02, LLM05)',
    codeType: 'typescript',
    code: `// INSECURE CODE EXAMPLE
import { GoogleGenAI } from '@google/genai';

// ❌ CRITICAL: Hardcoded API Key
const API_KEY = "AIzaSyD9876543210-sample-leaked-key-production";
const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function handleUserQuery(req: any, res: any) {
  const userInput = req.body.prompt;
  
  // Unsanitized raw generation without output encoding
  const response = await ai.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: userInput
  });

  // ❌ VULNERABLE: Direct HTML execution sink
  res.send(\`<div class="response">\${response.text}</div>\`);
}`
  },
  {
    id: 'insecure-firestore-rule',
    title: 'Insecure Firestore Wildcard & Public Writes (OWASP A01)',
    codeType: 'firestore',
    code: `// INSECURE FIRESTORE RULES
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ❌ CRITICAL: Zero Insecure Defaults Violated
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`
  },
  {
    id: 'ssrf-and-command-tool',
    title: 'Unchecked Tool Execution & SSRF Hazard (OWASP LLM06, A10)',
    codeType: 'typescript',
    code: `// INSECURE TOOL IMPLEMENTATION
import axios from 'axios';

// ❌ SSRF Vulnerability: Unchecked target URL
export async function executeFetchTool(targetUrl: string) {
  // Attacker can pass: http://169.254.169.254/computeMetadata/v1/
  const response = await axios.get(targetUrl);
  return response.data;
}`
  }
];

export const SecurityReviewer: React.FC = () => {
  const [selectedSnippet, setSelectedSnippet] = useState(SAMPLE_CODE_SNIPPETS[0]);
  const [customCode, setCustomCode] = useState(SAMPLE_CODE_SNIPPETS[0].code);
  const [isLoading, setIsLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState<SecurityReviewResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeDiffTab, setActiveDiffTab] = useState<'remediated' | 'diff' | 'dataflow'>('remediated');

  const handleSelectSnippet = (s: typeof SAMPLE_CODE_SNIPPETS[0]) => {
    setSelectedSnippet(s);
    setCustomCode(s.code);
  };

  const handleRunSecurityReview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/security-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codeSnippet: customCode,
          codeType: selectedSnippet.codeType
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Review failed`);
      }

      const data: SecurityReviewResult = await res.json();
      setReviewResult(data);
    } catch (err) {
      console.error('Security review error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Directives 2, 4 & 5: Security Reviewer & Zero-Hardcoding
              </span>
              <span className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded">
                OWASP Web & LLM Mitigations
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Automated Security Code & Rule Reviewer</h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Inspect source code for hardcoded secrets, prompt injection vectors, insecure Firestore rules, and improper output handling with AST data flow tracing.
            </p>
          </div>

          <button
            id="btn-run-security-review"
            onClick={handleRunSecurityReview}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Auditing Code...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Run Security Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor & Preset Picker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <FileWarning className="w-4 h-4 text-slate-500" />
            <span>Target Code & Vulnerability Samples</span>
          </h3>

          <div className="space-y-2">
            {SAMPLE_CODE_SNIPPETS.map((s) => (
              <button
                key={s.id}
                id={`btn-snippet-${s.id}`}
                onClick={() => handleSelectSnippet(s)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedSnippet.id === s.id
                    ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span className="text-xs font-semibold text-slate-900 block">{s.title}</span>
                <span className="text-[10px] font-mono text-slate-500 mt-1 uppercase block">{s.codeType}</span>
              </button>
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-600 space-y-2">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              <span>Zero-Hardcoding Directive:</span>
            </span>
            <p className="text-[11px] leading-relaxed">
              Any pattern resembling <code className="bg-slate-200 px-1 py-0.5 rounded text-rose-700 font-mono">const API_KEY = &quot;AIza...&quot;</code> is strictly flagged as a critical security flaw.
            </p>
          </div>
        </div>

        {/* Live Code Input View */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <CodeXml className="w-4 h-4 text-slate-500" />
              <span>Source Code & Rule Inspector</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Syntax: {selectedSnippet.codeType}</span>
          </div>

          <textarea
            rows={12}
            id="input-code-editor"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            className="w-full p-3 font-mono text-xs text-slate-800 bg-slate-900 text-slate-100 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-y"
            placeholder="Paste code or security rules to review..."
          />
        </div>
      </div>

      {/* Review Findings Section */}
      {reviewResult && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-6">
          {/* Posture Score Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">Security Audit Summary</span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold border ${
                  reviewResult.status === 'PASSED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  Status: {reviewResult.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">{reviewResult.summary}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Security Score</span>
                <span className={`text-2xl font-black ${
                  reviewResult.score > 80 ? 'text-emerald-600' : (reviewResult.score > 50 ? 'text-amber-600' : 'text-rose-600')
                }`}>
                  {reviewResult.score}/100
                </span>
              </div>
            </div>
          </div>

          {/* Vulnerability Items Breakdown */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Severity-Ranked Findings ({reviewResult.vulnerabilities.length})
            </h4>

            {reviewResult.vulnerabilities.length === 0 ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero vulnerabilities detected! Source code strictly complies with OWASP standards.</span>
              </div>
            ) : (
              reviewResult.vulnerabilities.map((vuln) => (
                <div key={vuln.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{vuln.id}</span>
                      <span className="font-bold text-slate-900 text-sm">{vuln.title}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 w-fit">
                      {vuln.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{vuln.description}</p>

                  {/* AST / Data Flow Trace */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-800 block mb-2">Data Flow Trace (Source to Sink):</span>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 text-[11px] font-mono">
                      <div className="p-2 bg-slate-50 rounded border border-slate-200 text-rose-700">
                        <span className="font-semibold block text-[10px] uppercase text-slate-500">1. Entry Point</span>
                        {vuln.dataFlowTrace.source}
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />
                      <div className="p-2 bg-slate-50 rounded border border-slate-200 text-amber-700">
                        <span className="font-semibold block text-[10px] uppercase text-slate-500">2. Intermediate</span>
                        {vuln.dataFlowTrace.intermediate}
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />
                      <div className="p-2 bg-slate-50 rounded border border-slate-200 text-rose-900 font-semibold">
                        <span className="font-semibold block text-[10px] uppercase text-slate-500">3. Execution Sink</span>
                        {vuln.dataFlowTrace.sink}
                      </div>
                    </div>
                  </div>

                  {/* Side-by-Side Remediation Diff */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">Concrete Remediation Diff</span>
                      <button
                        onClick={() => copyText(vuln.id, vuln.remediatedSnippet)}
                        className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
                      >
                        {copiedId === vuln.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Copied Fix</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Remediated Code</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-3 bg-rose-950/90 text-rose-200 rounded-lg border border-rose-900 overflow-x-auto">
                        <span className="text-[10px] text-rose-400 uppercase font-semibold block mb-1">
                          - Insecure Original:
                        </span>
                        <pre className="whitespace-pre-wrap">{vuln.originalSnippet}</pre>
                      </div>

                      <div className="p-3 bg-emerald-950/90 text-emerald-200 rounded-lg border border-emerald-900 overflow-x-auto">
                        <span className="text-[10px] text-emerald-400 uppercase font-semibold block mb-1">
                          + Remediated Implementation:
                        </span>
                        <pre className="whitespace-pre-wrap">{vuln.remediatedSnippet}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
