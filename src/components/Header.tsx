import React from 'react';
import { 
  ShieldCheck, 
  Layers, 
  CodeXml, 
  Cpu, 
  Database, 
  Cloud, 
  CheckCircle2,
  TerminalSquare
} from 'lucide-react';

export type ActiveTab = 'threat-model' | 'code-reviewer' | 'fallback-ladder' | 'firestore-rules' | 'deploy-cloudrun' | 'test-matrix';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  serverHealth: {
    status: string;
    geminiKeyConfigured: boolean;
    fallbackLadder: string[];
  } | null;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, serverHealth }) => {
  const tabs = [
    { id: 'threat-model' as ActiveTab, label: '5-Zone Threat Modeling', icon: ShieldCheck },
    { id: 'code-reviewer' as ActiveTab, label: 'OWASP Security Reviewer', icon: CodeXml },
    { id: 'fallback-ladder' as ActiveTab, label: 'Resilience Fallback Ladder', icon: Cpu },
    { id: 'firestore-rules' as ActiveTab, label: 'Firestore Security Rules', icon: Database },
    { id: 'deploy-cloudrun' as ActiveTab, label: 'Cloud Run & Secret Manager', icon: Cloud },
    { id: 'test-matrix' as ActiveTab, label: 'Walkthrough Test Matrix', icon: CheckCircle2 },
  ];

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm ring-1 ring-slate-900/10">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 tracking-tight text-base">Sentinel ThreatLens</span>
                <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded px-1.5 py-0.5">
                  Production Hardened
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Agentic AI Threat Modeling & Cloud Run Security Architecture</p>
            </div>
          </div>

          {/* Live Status Indicator */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium">Backend:</span>
              <span className="text-slate-900 font-mono text-[11px]">Express + tsx (Port 3000)</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 text-slate-700">
              <TerminalSquare className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">Ladder:</span>
              <span className="text-slate-900 font-mono text-[11px]">4 Models Active</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-2 -mb-px border-t border-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors duration-150 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
