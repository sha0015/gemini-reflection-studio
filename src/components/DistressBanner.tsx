import React, { useState } from 'react';
import { 
  HeartPulse, 
  PhoneCall, 
  Globe, 
  X, 
  ExternalLink, 
  Info
} from 'lucide-react';
import { DistressAssessment, DistressResource } from '../types';

interface DistressBannerProps {
  assessment: DistressAssessment;
  onDismiss?: () => void;
}

const DEFAULT_INDIAN_RESOURCES: DistressResource[] = [
  {
    name: 'Tele-MANAS (Govt of India)',
    contact: '14416 (Primary) / 1-800-891-4416',
    description: 'Free 24/7 national tele-mental health counseling across all Indian states and languages.',
    available: '24/7 Toll-Free'
  },
  {
    name: 'Vandrevala Foundation',
    contact: '+91 9999 666 555',
    description: 'Free, confidential 24/7 psychological counseling and crisis intervention across India.',
    available: '24/7 Free'
  },
  {
    name: 'Find A Helpline',
    contact: 'findahelpline.com',
    description: 'Free, confidential online directory to locate verified crisis and mental health support services.',
    available: 'Online Directory'
  }
];

export const DistressBanner: React.FC<DistressBannerProps> = ({
  assessment,
  onDismiss
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (!assessment.isDistressDetected || dismissed) {
    return null;
  }

  const resources = assessment.resources && assessment.resources.length > 0
    ? assessment.resources
    : DEFAULT_INDIAN_RESOURCES;

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
        {resources.map((res, idx) => {
          const isWeb = res.contact.toLowerCase().includes('findahelpline') || res.contact.startsWith('http');
          return (
            <div key={idx} className="bg-white p-3.5 rounded-xl border border-amber-200/80 space-y-1.5 shadow-2xs flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-slate-900">{res.name}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold shrink-0">
                    {res.available}
                  </span>
                </div>
                {isWeb ? (
                  <a
                    href="https://findahelpline.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>findahelpline.com</span>
                    <ExternalLink className="w-3 h-3 text-emerald-600 shrink-0 ml-0.5" />
                  </a>
                ) : (
                  <div className="text-xs font-mono font-bold text-emerald-800 flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{res.contact}</span>
                  </div>
                )}
                <p className="text-[11px] text-slate-600 leading-relaxed">{res.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[11px] text-slate-600 flex items-center gap-1.5 pt-1 border-t border-amber-200/60">
        <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
        <span>Gemini is a reflective companion and does not provide psychiatric or medical diagnoses. Free, confidential Indian crisis helplines are available 24/7.</span>
      </div>
    </div>
  );
};
