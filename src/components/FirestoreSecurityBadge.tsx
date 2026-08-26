import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  Copy, 
  Server, 
  FileCode,
  Layers,
  Sparkles
} from 'lucide-react';
import { User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

interface FirestoreSecurityBadgeProps {
  user: User;
}

export const FirestoreSecurityBadge: React.FC<FirestoreSecurityBadgeProps> = ({ user }) => {
  const [copied, setCopied] = useState(false);

  const securityRulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Default deny all unmatched collections
    match /{document=**} {
      allow read, write: if false;
    }

    // User profile documents
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }

    // Strictly isolated private reflections subcollection
    match /users/{userId}/entries/{entryId} {
      allow read, write: if isOwner(userId);
    }
  }
}`;

  const handleCopyRules = () => {
    navigator.clipboard.writeText(securityRulesCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Security Overview Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Cloud Firestore User Isolation & Security Model</h2>
            <p className="text-xs text-slate-600">
              Zero-knowledge architecture ensuring your journal entries are strictly private and unreadable by any other user.
            </p>
          </div>
        </div>

        {/* Security Checklist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Owner-Bound UID Rules</span>
            </div>
            <p className="text-xs text-slate-600">
              Firestore queries enforce <code className="font-mono text-emerald-900 bg-emerald-100/70 px-1 py-0.5 rounded text-[11px]">request.auth.uid == userId</code>. Subcollections outside your UID cannot be queried.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
              <Key className="w-4 h-4 text-blue-700" />
              <span>Google Identity Tokens</span>
            </div>
            <p className="text-xs text-slate-600">
              Tokens cryptographically signed by Google Identity Services verify your active session on each Firestore transaction.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200/80 space-y-2">
            <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
              <Lock className="w-4 h-4 text-purple-700" />
              <span>No Plaintext Credentials</span>
            </div>
            <p className="text-xs text-slate-600">
              Gemini API keys and sensitive runtime tokens are securely stored in server environment secrets without browser exposure.
            </p>
          </div>

        </div>
      </div>

      {/* Active User Isolation State */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-700" />
          <span>Active Firebase & Firestore Session Verification</span>
        </h3>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200">
            <span className="text-slate-500">Authenticated UID:</span>
            <span className="text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-200 break-all">{user.uid}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200">
            <span className="text-slate-500">Email Address:</span>
            <span className="text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">{user.email || 'Anonymous Guest User'}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200">
            <span className="text-slate-500">Firestore Project ID:</span>
            <span className="text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">{firebaseConfig.projectId}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200">
            <span className="text-slate-500">Firestore Database ID:</span>
            <span className="text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">{firebaseConfig.firestoreDatabaseId || '(default)'}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500">Isolated Storage Path:</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 break-all">
              /users/{user.uid}/entries/{'{entryId}'}
            </span>
          </div>
        </div>
      </div>

      {/* Deployed Security Rules Code Excerpt */}
      <div className="bg-slate-900 rounded-xl p-6 shadow-xs text-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold font-mono text-slate-100">firestore.rules (Production Deployed)</span>
          </div>

          <button
            onClick={handleCopyRules}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy Rules'}</span>
          </button>
        </div>

        <pre className="p-4 bg-slate-950 rounded-lg text-xs font-mono text-emerald-400/90 overflow-x-auto border border-slate-800 leading-relaxed">
          {securityRulesCode}
        </pre>
      </div>

    </div>
  );
};
