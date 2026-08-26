import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db, doc, setDoc, serverTimestamp } from './lib/firebase';
import { LandingAuth } from './components/LandingAuth';
import { AppHeader } from './components/AppHeader';
import { ReflectionStudio } from './components/ReflectionStudio';
import { EntryHistory } from './components/EntryHistory';
import { InsightsDashboard } from './components/InsightsDashboard';
import { FirestoreSecurityBadge } from './components/FirestoreSecurityBadge';
import { BlogViewer } from './components/BlogViewer';
import { JournalEntry } from './types';
import { Sparkles, Shield, Database, Lock } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'studio' | 'history' | 'insights' | 'security' | 'blog'>('studio');
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);

      // If user logs in, ensure their user profile document is recorded in Firestore
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Guest User',
            email: firebaseUser.email || null,
            photoURL: firebaseUser.photoURL || null,
            lastLoginAt: serverTimestamp()
          }, { merge: true });
        } catch (err) {
          console.warn('[Firestore] User profile sync notice:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSelectEntry = (entry: JournalEntry) => {
    setActiveEntry(entry);
    setCurrentTab('studio');
  };

  const handleStartNewEntry = () => {
    setActiveEntry(null);
    setCurrentTab('studio');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md max-w-sm w-full text-center space-y-4">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-sm font-bold text-slate-800">Initializing Firebase Session...</h2>
          <p className="text-xs text-slate-500">Checking authenticated credentials & Firestore tokens.</p>
        </div>
      </div>
    );
  }

  // If not authenticated, render the Google Sign-In Landing Page
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
        {/* Simple Top Bar */}
        <header className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">
                Gemini Reflection & Journal
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1 text-emerald-800 font-medium">
                <Lock className="w-3.5 h-3.5" />
                Firebase Auth & Cloud Firestore
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <LandingAuth />
        </main>

        <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
            <span>Powered by Gemini 3.6 Flash and user-isolated Cloud Firestore storage.</span>
          </div>
        </footer>
      </div>
    );
  }

  // If authenticated, render the User's Private Reflection Dashboard
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Application Header & Navigation */}
      <AppHeader
        user={user}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onNewEntry={handleStartNewEntry}
      />

      {/* Main Private User Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'studio' && (
          <ReflectionStudio
            user={user}
            activeEntry={activeEntry}
            onEntrySaved={(saved) => setActiveEntry(saved)}
            onNewEntry={handleStartNewEntry}
          />
        )}

        {currentTab === 'history' && (
          <EntryHistory
            user={user}
            onSelectEntry={handleSelectEntry}
            onNewEntry={handleStartNewEntry}
          />
        )}

        {currentTab === 'insights' && (
          <InsightsDashboard
            user={user}
            onNavigateToStudio={handleStartNewEntry}
          />
        )}

        {currentTab === 'security' && (
          <FirestoreSecurityBadge
            user={user}
          />
        )}

        {currentTab === 'blog' && (
          <BlogViewer />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Authenticated as <strong className="text-slate-800 font-mono">{user.email || user.displayName || 'Guest User'}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-600">Storage: /users/{user.uid.slice(0, 8)}.../entries</span>
            <span>•</span>
            <span className="font-mono text-emerald-800 font-medium">Gemini 3.6 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
