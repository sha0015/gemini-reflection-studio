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
  Database
} from 'lucide-react';
import { User } from 'firebase/auth';
import { signOutUser } from '../lib/firebase';

interface AppHeaderProps {
  user: User;
  currentTab: 'studio' | 'history' | 'insights' | 'security';
  onSelectTab: (tab: 'studio' | 'history' | 'insights' | 'security') => void;
  onNewEntry: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  currentTab,
  onSelectTab,
  onNewEntry
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
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & App Title */}
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
                  Gemini Reflection & Journal
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  3.6 Flash
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono hidden sm:block">
                Isolated Cloud Firestore Storage
              </span>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            <button
              id="tab-studio"
              onClick={() => onSelectTab('studio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'studio'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Reflect</span>
            </button>

            <button
              id="tab-history"
              onClick={() => onSelectTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'history'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>History</span>
            </button>

            <button
              id="tab-insights"
              onClick={() => onSelectTab('insights')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'insights'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
              <span>Insights</span>
            </button>

            <button
              id="tab-security"
              onClick={() => onSelectTab('security')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'security'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden md:inline">Isolation & Rules</span>
            </button>
          </nav>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-3 shrink-0">
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
              <div className="hidden lg:block text-left">
                <span className="text-xs font-bold text-slate-900 block leading-none">
                  {user.displayName || 'Demo Guest User'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {user.email || 'guest_user'}
                </span>
              </div>
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
