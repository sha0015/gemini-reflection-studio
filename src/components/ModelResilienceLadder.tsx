import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Layers, 
  Zap, 
  Activity, 
  ArrowRight,
  ShieldCheck,
  Code2
} from 'lucide-react';
import { FallbackAttempt } from '../types';

export const ModelResilienceLadder: React.FC = () => {
  const [testPrompt, setTestPrompt] = useState('Verify model resilience and output high-assurance security confirmation.');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    success: boolean;
    text: string;
    successfulModel: string;
    totalDurationMs: number;
    fallbackTriggered: boolean;
    attempts: FallbackAttempt[];
  } | null>(null);

  const ladderTiers = [
    { tier: 1, model: 'gemini-3.6-flash', role: 'Primary Execution Engine', latency: 'Fast (Low Latency)' },
    { tier: 2, model: 'gemini-3.1-flash-lite', role: 'High-Availability Fallback', latency: 'Minimal Latency' },
    { tier: 3, model: 'gemini-flash-latest', role: 'Dynamic Alias Fallback', latency: 'Standard' },
    { tier: 4, model: 'gemini-3.7-flash', role: 'Deep Reasoning Fallback', latency: 'High Capability' },
  ];

  const handleExecuteResilienceTest = async () => {
    setIsExecuting(true);
    try {
      const res = await fetch('/api/gemini/resilient-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testPrompt,
          simulateFailureOnPrimary: simulateFailure,
        })
      });

      const data = await res.json();
      setExecutionResult(data);
    } catch (err) {
      console.error('Resilience test failed:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Directive 6: Resilience & Fallback Protocol</span>
              <span className="bg-emerald-50 text-emerald-700 text-[11px] font-medium px-2 py-0.5 rounded border border-emerald-200">
                Zero Unhandled Downtime
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">4-Tier Resilient Gemini Model Ladder</h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Automated error recovery ladder catching 503 UNAVAILABLE, 429 RESOURCE_EXHAUSTED, 404 NOT_FOUND, and 500 status codes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                id="checkbox-simulate-failure"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="rounded text-slate-900 focus:ring-slate-900"
              />
              <span>Simulate 503 on Primary Tier</span>
            </label>

            <button
              id="btn-test-resilience"
              onClick={handleExecuteResilienceTest}
              disabled={isExecuting}
              className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Traversing Ladder...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Execute Resilience Test</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Model Ladder Tier Visualization */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ladderTiers.map((tier) => {
          const attempt = executionResult?.attempts.find(a => a.model === tier.model);
          const isSuccess = attempt?.status === 'SUCCESS';
          const isFailed = attempt?.status === 'FAILED';

          return (
            <div
              key={tier.tier}
              className={`p-4 rounded-xl border transition-all ${
                isSuccess 
                  ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20' 
                  : (isFailed 
                      ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-500/20' 
                      : 'bg-white border-slate-200 shadow-xs')
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase text-slate-500">Tier {tier.tier}</span>
                {isSuccess && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3" /> Resolved
                  </span>
                )}
                {isFailed && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                    <AlertTriangle className="w-3 h-3" /> Fallback Hop
                  </span>
                )}
              </div>

              <div className="mt-2">
                <h4 className="text-sm font-bold text-slate-900 font-mono">{tier.model}</h4>
                <p className="text-xs text-slate-600 mt-0.5">{tier.role}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Expected Latency:</span>
                <span className="font-medium text-slate-700">{tier.latency}</span>
              </div>

              {attempt && (
                <div className="mt-2 text-[10px] font-mono text-slate-600">
                  <span>Duration: {attempt.durationMs}ms</span>
                  {attempt.statusCode && <span className="block text-rose-600 font-semibold">HTTP Status: {attempt.statusCode}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Execution Results View */}
      {executionResult && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold uppercase text-slate-500">Telemetry Resolution</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-bold text-slate-900">
                  Resolved by: <span className="font-mono text-emerald-700">{executionResult.successfulModel}</span>
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                  executionResult.fallbackTriggered
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {executionResult.fallbackTriggered ? 'Fallback Ladder Triggered' : 'Primary Tier Success'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">Total Pipeline Latency</span>
              <span className="text-base font-bold font-mono text-slate-900">{executionResult.totalDurationMs}ms</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-700 block mb-1.5">Model Generated Payload Response:</span>
            <div className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono whitespace-pre-wrap">
              {executionResult.text}
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <span className="font-semibold text-slate-700">Traversal Trace Log:</span>
            <div className="space-y-1">
              {executionResult.attempts.map((att, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200 text-[11px] font-mono">
                  <span className="font-bold text-slate-700">Step {idx + 1}:</span>
                  <span className="text-slate-900">{att.model}</span>
                  <span className={`px-1.5 py-0.2 rounded font-semibold ${
                    att.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {att.status} ({att.durationMs}ms)
                  </span>
                  {att.errorMessage && (
                    <span className="text-rose-600 truncate max-w-md">Reason: {att.errorMessage}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Code Standard Implementation Reference */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-slate-500" />
            <span>Backend Helper Standard: generateContentWithFallback</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">server.ts implementation</span>
        </div>

        <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre-wrap">
{`// Mandatory Gemini Fallback Helper Implementation
const MODEL_FALLBACK_LADDER = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash'
] as const;

async function generateContentWithFallback(prompt: string, systemInstruction?: string) {
  const attempts = [];
  for (const model of MODEL_FALLBACK_LADDER) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined
      });
      return { text: response.text, successfulModel: model, attempts };
    } catch (error: any) {
      console.warn(\`[Fallback] Model \${model} failed (\${error?.status}). Attempting next tier...\`);
      attempts.push({ model, status: 'FAILED', error: error?.message });
    }
  }
  throw new Error('All fallback ladder models exhausted.');
}`}
        </pre>
      </div>
    </div>
  );
};
