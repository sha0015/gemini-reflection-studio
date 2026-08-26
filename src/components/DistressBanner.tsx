import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  PhoneCall, 
  Globe, 
  ShieldAlert, 
  X, 
  ExternalLink, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { DistressAssessment } from '../types';

interface DistressBannerProps {
  assessment: DistressAssessment;
  onDismiss?: () => void;
}

export const DistressBanner: React.FC<DistressBannerProps> = ({
  assessment,
  onDismiss
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (!assessment.isDistressDetected || dismissed) {
    return null;
  }

  return (
    <div className="bg-amber-50/90 border-2 border-amber-300/80 rounded-2xl p-5 sm:p-6 text-slate-800 shadow-sm space-y-4 my-4 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
            <HeartPulse className="w-6 h-6 text-amber-800" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Gentle Support &amp; Caring Resources
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed mt-0.5">
              {assessment.calmNotice || 'You are carrying significant emotional weight right now. You deserve a supportive, confidential human space to be heard.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setDismissed(true);
            if (onDismiss) onDismiss();
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-amber-100 transition-colors cursor-pointer"
          title="Dismiss support notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Support Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        {assessment.resources.map((res, idx) => (
          <div key={idx} className="bg-white p-3.5 rounded-xl border border-amber-200/80 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">{res.name}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                {res.available}
              </span>
            </div>
            <div className="text-xs font-mono font-bold text-emerald-800 flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>{res.contact}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">{res.description}</p>
          </div>
        ))}
      </div>

      <div className="text-[11px] text-slate-600 flex items-center gap-1.5 pt-1 border-t border-amber-200/60">
        <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
        <span>Gemini is a reflective companion and does not provide psychiatric or medical diagnoses. Free, confidential human helplines are available 24/7.</span>
      </div>
    </div>
  );
};
