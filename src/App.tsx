import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  auth, 
  db, 
  doc, 
  setDoc, 
  serverTimestamp, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  subscribeToAuth, 
  getGuestEntries 
} from './lib/firebase';
import { LandingAuth } from './components/LandingAuth';
import { AppHeader, AppTabType } from './components/AppHeader';
import { ReflectionStudio } from './components/ReflectionStudio';
import { EntryHistory } from './components/EntryHistory';
import { FirestoreSecurityBadge } from './components/FirestoreSecurityBadge';
import { BlogViewer } from './components/BlogViewer';
import { ReflectionCircles } from './components/ReflectionCircles';
import { PatternAgent } from './components/PatternAgent';
import { ActionTracker } from './components/ActionTracker';
import { ClientEncryptionProof } from './components/ClientEncryptionProof';
import { HealthDiagnosticsModal } from './components/HealthDiagnosticsModal';
import { JournalEntry } from './types';
import { Sparkles, Shield, Database, Lock, HeartPulse } from 'lucide-react';
import { flushOfflineQueue, getSessionPassphrase, PASSPHRASE_CHANGED_EVENT } from './lib/offlineQueue';
import { decryptClientSide } from './lib/cryptoVault';

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<AppTabType>('studio');
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isHealthOpen, setIsHealthOpen] = useState(false);

  // Monitor Unified Auth state (Firebase Google Provider + Sandbox Guest Mode)
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (authUser) => {
      setUser(authUser);
      setAuthLoading(false);

      if (authUser && !authUser.uid?.startsWith('guest_')) {
        try {
          const userRef = doc(db, 'users', authUser.uid);
          await setDoc(userRef, {
            uid: authUser.uid,
            displayName: authUser.displayName || 'Guest User',
            email: authUser.email || null,
            photoURL: authUser.photoURL || null,
            lastLoginAt: serverTimestamp()
          }, { merge: true });

          // Flush any offline entries stored in localStorage buffer
          await flushOfflineQueue(authUser.uid);
        } catch (err) {
          console.warn('[Firestore] User profile sync notice:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Holds the most recent raw Firestore docs so entries can be re-decrypted locally
  // (without a fresh network round-trip) whenever the session passphrase changes.
  const lastEntryDocsRef = useRef<any[]>([]);

  const buildEntriesFromDocs = useCallback(async (docs: any[]): Promise<JournalEntry[]> => {
    const passphrase = getSessionPassphrase();

    return Promise.all(docs.map(async (docSnap): Promise<JournalEntry> => {
      const data = docSnap.data();
      const base: JournalEntry = {
        id: docSnap.id,
        userId: data.userId || user.uid,
        title: data.title || 'Untitled Reflection',
        category: data.category || 'reflection',
        mode: data.mode || 'reflect',
        tags: data.tags || [],
        summary: data.summary || '',
        sentiment: data.sentiment || 'Reflective',
        keyInsights: data.keyInsights || [],
        actionItems: data.actionItems || [],
        actionItemsStructured: data.actionItemsStructured || [],
        messages: data.messages || [],
        spatialContext: data.spatialContext,
        isFavorite: data.isFavorite || false,
        wordCount: data.wordCount || 0,
        privacyShieldUsed: data.privacyShieldUsed,
        isClientEncrypted: data.isClientEncrypted,
        encryptedEnvelope: data.encryptedEnvelope,
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now()),
        updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : (data.updatedAt || Date.now())
      };

      if (!data.isClientEncrypted || !data.encryptedEnvelope) {
        return base;
      }

      if (!passphrase) {
        return { ...base, title: '🔒 Locked Entry', summary: 'Enter your passphrase or recovery phrase to unlock.', needsPassphrase: true };
      }

      try {
        const decrypted = await decryptClientSide<any>(data.encryptedEnvelope, passphrase);
        return { ...base, ...decrypted, needsPassphrase: false };
      } catch (decErr) {
        console.warn('[Crypto] Failed to decrypt entry', docSnap.id, decErr);
        return { ...base, title: '🔒 Locked Entry', summary: 'Incorrect passphrase for this entry.', needsPassphrase: true, decryptionFailed: true };
      }
    }));
  }, [user]);

  // Listen to Firestore entries for live sync or Local Sandbox for Guest users
  useEffect(() => {
    if (!user) {
      setEntries([]);
      return;
    }

    // Guest Sandbox Mode: read from guest local storage
    if (user.uid?.startsWith('guest_')) {
      const guestList = getGuestEntries();
      setEntries(guestList);

      const handleGuestUpdate = (e: any) => {
        if (Array.isArray(e.detail)) {
          setEntries(e.detail);
        } else {
          setEntries(getGuestEntries());
        }
      };
      window.addEventListener('gemini_reflection_guest_entries_changed', handleGuestUpdate);
      return () => {
        window.removeEventListener('gemini_reflection_guest_entries_changed', handleGuestUpdate);
      };
    }

    // Authenticated Firebase User: subscribe to Cloud Firestore
    try {
      const entriesRef = collection(db, 'users', user.uid, 'entries');
      const q = query(entriesRef, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        lastEntryDocsRef.current = snapshot.docs;
        setEntries(await buildEntriesFromDocs(snapshot.docs));
      }, (error) => {
        console.warn('Firestore snapshot subscription notice:', error);
      });

      // Re-decrypt the already-loaded entries when the passphrase is set/cleared,
      // e.g. after the user unlocks their vault from the Encryption Proof tab.
      const handlePassphraseChange = async () => {
        if (lastEntryDocsRef.current.length > 0) {
          setEntries(await buildEntriesFromDocs(lastEntryDocsRef.current));
        }
      };
      window.addEventListener(PASSPHRASE_CHANGED_EVENT, handlePassphraseChange);

      return () => {
        unsubscribe();
        window.removeEventListener(PASSPHRASE_CHANGED_EVENT, handlePassphraseChange);
      };
    } catch (e) {
      console.error(e);
    }
  }, [user, buildEntriesFromDocs]);

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
          <h2 className="text-sm font-bold text-slate-800">Initializing Session...</h2>
          <p className="text-xs text-slate-500">Checking credentials &amp; storage tokens.</p>
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
                Gemini Reflection &amp; Journal
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1 text-emerald-800 font-medium">
                <Lock className="w-3.5 h-3.5" />
                WebCrypto AES-GCM Encrypted &amp; Firestore Isolated
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <LandingAuth />
        </main>

        <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
            <span>Powered by Gemini 3.7 Flash and client-side encrypted Cloud Firestore storage.</span>
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
        onOpenHealth={() => setIsHealthOpen(true)}
      />

      {/* Main Private User Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'studio' && (
          <ReflectionStudio
            user={user}
            activeEntry={activeEntry}
            entries={entries}
            onEntrySaved={(saved) => setActiveEntry(saved)}
            onNewEntry={handleStartNewEntry}
          />
        )}

        {currentTab === 'actions' && (
          <ActionTracker
            user={user}
            entries={entries}
            onSelectEntry={handleSelectEntry}
          />
        )}

        {currentTab === 'circles' && (
          <ReflectionCircles
            user={user}
            entries={entries}
            onSelectEntry={handleSelectEntry}
          />
        )}

        {currentTab === 'patterns' && (
          <PatternAgent
            user={user}
            entries={entries}
            onSelectEntry={handleSelectEntry}
          />
        )}

        {currentTab === 'encryption_proof' && (
          <ClientEncryptionProof
            user={user}
            entries={entries}
          />
        )}

        {currentTab === 'history' && (
          <EntryHistory
            user={user}
            onSelectEntry={handleSelectEntry}
            onNewEntry={handleStartNewEntry}
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

      {/* Health Diagnostics Modal */}
      <HealthDiagnosticsModal
        isOpen={isHealthOpen}
        onClose={() => setIsHealthOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Authenticated as <strong className="text-slate-800 font-mono">{user.email || user.displayName || 'Guest Tester'}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-600">
              {user.uid?.startsWith('guest_') ? 'Storage: Local Sandbox Buffer' : `Firestore Path: /users/${user.uid.slice(0, 8)}.../entries`}
            </span>
            <span>•</span>
            <span className="font-mono text-emerald-800 font-medium">Gemini 3.7 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
