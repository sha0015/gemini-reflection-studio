import React from 'react';
import { 
  Feather, 
  Sparkles, 
  BookOpen, 
  BarChart3, 
  ShieldCheck, 
  LogOut, 
  User as UserIcon,
  CheckCircle2,
  Lock,
  Users,
  TrendingUp,
  ListChecks,
  Activity
} from 'lucide-react';
import { User } from 'firebase/auth';
import { signOutUser } from '../lib/firebase';

export type AppTabType = 'studio' | 'history' | 'actions' | 'circles' | 'patterns' | 'encryption_proof' | 'security' | 'blog';

interface AppHeaderProps {
  user: User;
  currentTab: AppTabType;
  onSelectTab: (tab: AppTabType) => void;
  onNewEntry: () => void;
  onOpenHealth: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  currentTab,
  onSelectTab,
  onNewEntry,
  onOpenHealth
}) => {
  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Model */}
          <div className="flex items-center gap-3 shrink-0">
            <div 
              onClick={() => onSelectTab('studio')}
              className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center cursor-pointer shadow-xs"
            >
              <Feather className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Gemini Reflection &amp; Journal
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  3.7 Flash
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono hidden sm:block">
                Client-Side WebCrypto AES-GCM Encrypted
              </span>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 overflow-x-auto max-w-[65vw]">
            <button
              id="tab-studio"
              onClick={() => onSelectTab('studio')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                currentTab === 'studio'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Studio</span>
            </button>

            <button
              id="tab-actions"
              onClick={() => onSelectTab('actions')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                currentTab === 'actions'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5 text-blue-600" />
              <span>Actions Loop</span>
            </button>

            <button
              id="tab-circles"
              onClick={() => onSelectTab('circles')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                currentTab === 'circles'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>Reflection Circles</span>
            </button>

            <button
              id="tab-patterns"
              onClick={() => onSelectTab('patterns')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                currentTab === 'patterns'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
              <span>Pattern Agent</span>
            </button>

            <button
              id="tab-proof"
              onClick={() => onSelectTab('encryption_proof')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                currentTab === 'encryption_proof'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-rose-600" />
              <span>Proof Panel</span>
            </button>

            <button
              id="tab-history"
              onClick={() => onSelectTab('history')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                currentTab === 'history'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Timeline</span>
            </button>

            <button
              id="tab-security"
              onClick={() => onSelectTab('security')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                currentTab === 'security'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Security</span>
            </button>

            <button
              id="tab-blog"
              onClick={() => onSelectTab('blog')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                currentTab === 'blog'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>Architecture</span>
            </button>
          </nav>

          {/* User Profile, Health, and Sign Out */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Health Telemetry Button */}
            <button
              onClick={onOpenHealth}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all cursor-pointer"
              title="System Health & Latency Telemetry"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden xl:inline">Health</span>
            </button>

            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User Avatar'}
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                </div>
              )}
            </div>

            <button
              id="btn-signout"
              onClick={handleSignOut}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
