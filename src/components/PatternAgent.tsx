import React, { useState } from 'react';
import { 
  TrendingUp, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  Zap, 
  Compass, 
  BarChart3, 
  Lightbulb, 
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { User } from 'firebase/auth';
import { JournalEntry, CrossEntryPatternReport } from '../types';

interface PatternAgentProps {
  user: User;
  entries: JournalEntry[];
  onSelectEntry?: (entry: JournalEntry) => void;
}

export const PatternAgent: React.FC<PatternAgentProps> = ({
  user,
  entries,
  onSelectEntry
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<CrossEntryPatternReport | null>(null);

  const handleRunLongitudinalAnalysis = async () => {
    if (entries.length === 0) {
      alert('You need at least 1-2 journal reflections to run cross-entry pattern synthesis.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/patterns/analyze-corpus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: CrossEntryPatternReport = await res.json();
      setReport(data);
    } catch (err: any) {
      console.error('Pattern analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-2xs">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Longitudinal Pattern &amp; Cross-Entry Agent</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wider">
                  Gemini 3.7 Flash
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Reason across your entire archive: uncover recurring triggers, evaluate action-item follow-through, and correlate places/weather with cognitive clarity.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunLongitudinalAnalysis}
            disabled={isAnalyzing || entries.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAnalyzing ? 'Synthesizing Corpus...' : `Analyze ${entries.length} Entries`}</span>
          </button>
        </div>

        {/* Quick Stats overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Total Journal Corpus</span>
            <span className="text-xl font-bold text-slate-900">{entries.length} reflections</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Spatial Grounding Taggings</span>
            <span className="text-xl font-bold text-teal-700">
              {entries.filter(e => e.spatialContext?.locationName).length} locations mapped
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Action Items Logged</span>
            <span className="text-xl font-bold text-indigo-700">
              {entries.flatMap(e => e.actionItemsStructured || []).length || entries.flatMap(e => e.actionItems || []).length} commitments
            </span>
          </div>
        </div>
      </div>

      {/* Synthesis Report Display */}
      {report && (
        <div className="space-y-6">
          
          {/* Executive Synthesis */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  Longitudinal Growth Synthesis
                </h3>
                <span className="text-xs text-slate-500">{report.analyzedPeriod}</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
                Intentionality Score: <span className="font-extrabold text-teal-600">{report.growthTrajectorScore}/100</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {report.holisticSynthesis}
            </p>
          </div>

          {/* Tri-Column Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. Recurring Cognitive Triggers */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Recurring Triggers &amp; Shifts
              </h4>

              <div className="space-y-3">
                {report.recurringTriggers.map((t, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{t.trigger}</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                        {t.frequency}x recurring
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{t.impactSummary}</p>
                    <div className="text-[11px] font-semibold text-teal-700 bg-teal-50/70 p-2 rounded-lg border border-teal-100">
                      💡 <strong>Shift:</strong> {t.actionableShift}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Action Item Follow-Through & Integrity */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Action Item Follow-Through
              </h4>

              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">Completion Integrity</span>
                  <span className="text-base font-extrabold text-emerald-700">
                    {report.actionItemIntegrity.completionRatePercent}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="bg-white p-2 rounded-lg border border-emerald-100">
                    <span className="block font-bold text-emerald-700">{report.actionItemIntegrity.doneCount}</span>
                    <span className="text-slate-500 text-[10px]">Done</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-emerald-100">
                    <span className="block font-bold text-blue-700">{report.actionItemIntegrity.openCount}</span>
                    <span className="text-slate-500 text-[10px]">Open</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-emerald-100">
                    <span className="block font-bold text-slate-600">{report.actionItemIntegrity.droppedCount}</span>
                    <span className="text-slate-500 text-[10px]">Dropped</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed italic">
                  "{report.actionItemIntegrity.synthesis}"
                </p>
              </div>
            </div>

            {/* 3. Spatial & Weather Atmosphere Correlation */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-500" />
                Place &amp; Weather Correlations
              </h4>

              <div className="space-y-3">
                {report.spatialAtmosphereCorrelations.map((cor, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-blue-50/40 border border-blue-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-blue-900 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        {cor.placeTypeOrLocation}
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">
                        {cor.dominantTone}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {cor.insightSummary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
