import React, { useState } from 'react';
import { 
  Database, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  FileCode2, 
  Lock, 
  Unlock,
  RefreshCw,
  Sparkles,
  Layers
} from 'lucide-react';
import { FirestoreRuleAuditResult } from '../types';

export const FirestoreRuleWorkbench: React.FC = () => {
  const [rulesContent, setRulesContent] = useState(`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ❌ Critical Insecure Default Example
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`);

  const [auditResult, setAuditResult] = useState<FirestoreRuleAuditResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sanitizationTestInput, setSanitizationTestInput] = useState(`{
  "userId": "usr_9812",
  "prompt": "Evaluate patient symptoms",
  "optionalMetadata": undefined,
  "internalDebugToken": undefined,
  "status": "QUEUED"
}`);
  const [sanitizedOutput, setSanitizedOutput] = useState<string | null>(null);

  const handleValidateRules = async () => {
    setIsValidating(true);
    try {
      const res = await fetch('/api/rules/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rulesContent })
      });

      const data: FirestoreRuleAuditResult = await res.json();
      setAuditResult(data);
    } catch (err) {
      console.error('Validation error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleApplyRecommendedRules = () => {
    if (auditResult?.recommendedRules) {
      setRulesContent(auditResult.recommendedRules);
      handleValidateRules();
    }
  };

  const copyRules = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestUndefinedStripping = async () => {
    try {
      const parsed = {
        userId: "usr_9812",
        prompt: "Evaluate patient symptoms",
        optionalMetadata: undefined,
        internalDebugToken: undefined,
        status: "QUEUED"
      };

      const res = await fetch('/api/sanitize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });

      const data = await res.json();
      setSanitizedOutput(JSON.stringify(data.sanitized, null, 2));
    } catch (err) {
      console.error('Sanitization error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Directive 3: Database Security & Persistence Hygiene</span>
              <span className="bg-emerald-50 text-emerald-700 text-[11px] font-medium px-2 py-0.5 rounded border border-emerald-200">
                Zero Insecure Defaults
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Firestore Security Rules & Payload Hygiene Studio</h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Verify owner-bound user data isolation (<code className="font-mono text-slate-800">request.auth.uid == userId</code>), eliminate public write wildcards, and strip undefined properties.
            </p>
          </div>

          <button
            id="btn-validate-firestore-rules"
            onClick={handleValidateRules}
            disabled={isValidating}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isValidating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Auditing Rules...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Audit Firestore Rules</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor & Recommended Rules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rules Editor */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-slate-500" />
              <span>Current firestore.rules</span>
            </h3>
            <button
              onClick={() => copyRules(rulesContent)}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <textarea
            rows={12}
            id="input-rules-editor"
            value={rulesContent}
            onChange={(e) => setRulesContent(e.target.value)}
            className="w-full p-3 font-mono text-xs text-slate-100 bg-slate-900 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />

          {auditResult?.recommendedRules && !auditResult.isDeployable && (
            <button
              onClick={handleApplyRecommendedRules}
              className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Apply Production-Grade Secure Rules</span>
            </button>
          )}
        </div>

        {/* Audit Compliance Verification */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-500" />
            <span>Rule Compliance & Deployment Guard</span>
          </h3>

          {auditResult ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-3 rounded-lg border ${
                  auditResult.hasInsecureDefaults ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  <span className="font-bold block mb-0.5">Zero Insecure Defaults:</span>
                  <span>{auditResult.hasInsecureDefaults ? '❌ Violated (Public write)' : '✅ Compliant (No wildcard)'}</span>
                </div>

                <div className={`p-3 rounded-lg border ${
                  auditResult.ownerIsolationEnforced ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  <span className="font-bold block mb-0.5">Owner Isolation:</span>
                  <span>{auditResult.ownerIsolationEnforced ? '✅ Enforced (request.auth.uid)' : '⚠️ Missing Path Check'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">Security Audit Findings:</span>
                {auditResult.findings.map((f, idx) => (
                  <div 
                    key={idx} 
                    className={`p-2.5 rounded-lg text-xs border flex items-start gap-2 ${
                      f.type === 'ERROR' ? 'bg-rose-50 border-rose-200 text-rose-800' : 
                      (f.type === 'WARNING' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800')
                    }`}
                  >
                    {f.type === 'ERROR' ? <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />}
                    <div>
                      <span className="font-semibold block">{f.type}: {f.message}</span>
                      {f.ruleExcerpt && <code className="block mt-1 font-mono text-[11px] bg-white/60 px-1 py-0.5 rounded">{f.ruleExcerpt}</code>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 border border-dashed border-slate-200 rounded-lg">
              <Unlock className="w-6 h-6 mx-auto text-slate-400 mb-1" />
              <p className="text-xs font-medium text-slate-700">Click &quot;Audit Firestore Rules&quot; to test compliance</p>
            </div>
          )}
        </div>
      </div>

      {/* Strict Undefined-Stripping Hygiene Test Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Strict Undefined-Stripping (Zero-Crash Payload Hygiene)</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Ensure all objects passed to database drivers or API proxies are stripped of <code className="font-mono">undefined</code> values before write operations.
            </p>
          </div>

          <button
            id="btn-test-sanitize"
            onClick={handleTestUndefinedStripping}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Test Payload Hygiene</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-900 text-slate-100 rounded-lg border border-slate-800">
            <span className="text-[10px] text-amber-400 uppercase font-semibold block mb-1">
              Raw Ingested Payload (contains undefined values):
            </span>
            <pre className="whitespace-pre-wrap">{sanitizationTestInput}</pre>
          </div>

          <div className="p-3 bg-slate-900 text-emerald-300 rounded-lg border border-slate-800">
            <span className="text-[10px] text-emerald-400 uppercase font-semibold block mb-1">
              Sanitized Output (stripUndefinedDeep clean for Firestore):
            </span>
            <pre className="whitespace-pre-wrap">
              {sanitizedOutput || '// Click "Test Payload Hygiene" to execute'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
