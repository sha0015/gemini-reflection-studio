import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Cloud, 
  Cpu, 
  Globe, 
  Mic, 
  RefreshCw, 
  Clock, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { HealthCheckReport } from '../types';

export const HealthDiagnosticsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const [report, setReport] = useState<HealthCheckReport | null>(null);
  const [loading, setLoading] = useState(false);

  // Web Speech support is a browser capability, not a server dependency -- the server
  // can never actually know this, so it's always detected here on the client rather
  // than trusted from (or faked in) the API response.
  const detectWebSpeechSupport = () => Boolean('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setReport({
        ...data,
        dependencies: {
          ...data.dependencies,
          webSpeechApi: { supported: detectWebSpeechSupport() }
        }
      });
    } catch {
      // The health check itself couldn't be reached -- report the network-dependent
      // checks as unknown/failed rather than claiming everything is fine.
      setReport({
        status: 'error',
        timestamp: new Date().toISOString(),
        model: 'gemini-3.7-flash',
        region: 'unknown',
        dependencies: {
          geminiAi: { status: 'fail', latencyMs: 0, lastChecked: new Date().toISOString() },
          cloudFirestore: { status: 'fail', lastChecked: new Date().toISOString() },
          geolocationAtmosphere: { status: 'fail', quotaOk: false },
          webSpeechApi: { supported: detectWebSpeechSupport() }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 space-y-5 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">System Resilience &amp; Dependency Health</h3>
              <p className="text-xs text-slate-500">Live health telemetry across model, Firestore, and device APIs</p>
            </div>
          </div>

          <button
            onClick={fetchHealth}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
            title="Refresh Health"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {report && (() => {
          const overallOk = report.status === 'healthy';
          const badgeCls = (ok: boolean) => ok ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800';

          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Overall Cluster Status</span>
                  <span className="text-xs text-slate-500 font-mono">Region: {report.region} | Model: {report.model}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${badgeCls(overallOk)}`}>
                  {overallOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {report.status.toUpperCase()}
                </span>
              </div>

              {/* Dependencies -- each tile reflects the actual status in `report`, not a fixed label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                      Gemini 3.7 Flash API
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${badgeCls(report.dependencies.geminiAi.status === 'ok')}`}>
                      {report.dependencies.geminiAi.status === 'ok' ? `${report.dependencies.geminiAi.latencyMs}ms` : 'UNAVAILABLE'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {report.dependencies.geminiAi.status === 'ok' ? 'Authenticated & operational' : 'Not reachable -- offline fallback responses in use'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-blue-600" />
                      Cloud Firestore DB
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${badgeCls(report.dependencies.cloudFirestore.status === 'ok')}`}>
                      {report.dependencies.cloudFirestore.status === 'ok' ? 'REACHABLE' : 'UNREACHABLE'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Security rules active</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-amber-600" />
                      Spatial Atmosphere Grounding
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${badgeCls(report.dependencies.geolocationAtmosphere.status === 'ok')}`}>
                      {report.dependencies.geolocationAtmosphere.status === 'ok'
                        ? (report.dependencies.geolocationAtmosphere.quotaOk ? 'OK' : 'QUOTA LIMITED')
                        : 'UNAVAILABLE'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {report.dependencies.geolocationAtmosphere.status === 'ok' ? 'Nominatim + Open-Meteo reachable' : 'Fallback presets active'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-purple-600" />
                      Web Speech Dictation
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${badgeCls(report.dependencies.webSpeechApi.supported)}`}>
                      {report.dependencies.webSpeechApi.supported ? 'SUPPORTED' : 'NOT SUPPORTED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {report.dependencies.webSpeechApi.supported ? 'Detected in this browser' : 'Not available in this browser'}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
