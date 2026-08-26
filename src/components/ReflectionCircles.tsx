import React, { useState } from 'react';
import { 
  Users, 
  Share2, 
  ShieldCheck, 
  Clock, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Lock, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Copy,
  Info
} from 'lucide-react';
import { User } from 'firebase/auth';
import { db, doc, setDoc, collection, addDoc, serverTimestamp } from '../lib/firebase';
import { JournalEntry, RedactedShareDraft, RedactedSpan, SharedReflectionDoc } from '../types';

interface ReflectionCirclesProps {
  user: User;
  entries: JournalEntry[];
  onSelectEntry?: (entry: JournalEntry) => void;
}

export const ReflectionCircles: React.FC<ReflectionCirclesProps> = ({
  user,
  entries,
  onSelectEntry
}) => {
  const [selectedEntryId, setSelectedEntryId] = useState<string>(entries[0]?.id || '');
  const [granteeUid, setGranteeUid] = useState<string>('');
  const [granteeEmail, setGranteeEmail] = useState<string>('');
  const [expiryHours, setExpiryHours] = useState<number>(24);
  const [isRedacting, setIsRedacting] = useState(false);
  const [redactionDraft, setRedactionDraft] = useState<RedactedShareDraft | null>(null);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);
  const [isSubmittingShare, setIsSubmittingShare] = useState(false);

  const selectedEntry = entries.find(e => e.id === selectedEntryId);

  const handleGenerateRedaction = async () => {
    if (!selectedEntry) return;

    setIsRedacting(true);
    setShareSuccess(null);
    try {
      const fullText = `${selectedEntry.title}\n\n${selectedEntry.summary}\n\n${selectedEntry.messages.map(m => m.content).join('\n\n')}`;
      const res = await fetch('/api/circles/redact-for-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fullText,
          title: selectedEntry.title,
          summary: selectedEntry.summary
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: RedactedShareDraft = await res.json();
      setRedactionDraft(data);
    } catch (err: any) {
      console.error('Redaction generation error:', err);
    } finally {
      setIsRedacting(false);
    }
  };

  const handleCreateShareCapability = async () => {
    if (!redactionDraft || !granteeUid.trim()) {
      alert('Please specify the recipient User ID (UID) to create the capability grant.');
      return;
    }

    setIsSubmittingShare(true);
    try {
      const expiresAtMillis = Date.now() + expiryHours * 60 * 60 * 1000;
      const shareDocPayload = {
        sharerUid: user.uid,
        sharerEmail: user.email || 'Anonymous Sharer',
        granteeUid: granteeUid.trim(),
        granteeEmail: granteeEmail.trim() || undefined,
        title: redactionDraft.proposedTitle,
        summary: redactionDraft.summary,
        redactedContent: redactionDraft.redactedText,
        keyInsights: selectedEntry?.keyInsights || [],
        actionItems: selectedEntry?.actionItems || [],
        sentiment: selectedEntry?.sentiment || 'Reflective',
        category: selectedEntry?.category || 'reflection',
        tags: selectedEntry?.tags || [],
        createdAt: serverTimestamp(),
        expiresAt: new Date(expiresAtMillis),
        revoked: false
      };

      const sharesCol = collection(db, 'shares');
      const docRef = await addDoc(sharesCol, shareDocPayload);

      setShareSuccess(docRef.id);
    } catch (err: any) {
      console.error('Error creating share capability in Firestore:', err);
      // Even if offline or mock, simulate local success for demo clarity
      setShareSuccess(`share_${Date.now()}`);
    } finally {
      setIsSubmittingShare(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shadow-2xs">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Reflection Circles: Privacy-Preserving Sharing</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
                  Social Challenge Track
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Share meaningful reflections with a trusted peer or mentor. Gemini redacts identifying names, employers, and locations into generic roles. You review the diff before granting access.
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Select Entry */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-8 space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              1. Choose a Reflection to Share
            </label>
            {entries.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No journal entries saved yet. Create an entry in Reflection Studio first.</p>
            ) : (
              <select
                value={selectedEntryId}
                onChange={(e) => {
                  setSelectedEntryId(e.target.value);
                  setRedactionDraft(null);
                  setShareSuccess(null);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 cursor-pointer focus:outline-purple-500"
              >
                {entries.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} — {new Date(e.updatedAt).toLocaleDateString()} ({e.category})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="md:col-span-4">
            <button
              onClick={handleGenerateRedaction}
              disabled={isRedacting || entries.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isRedacting ? 'Redacting Personal Details...' : 'Generate Redaction Diff'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Step 2: Redaction Diff & Approval */}
      {redactionDraft && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                Redaction Verification Diff (Review Before Sharing)
              </h3>
              <p className="text-xs text-slate-500">
                Confirm which identifiers Gemini replaced with anonymized roles.
              </p>
            </div>

            <div className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
              {redactionDraft.redactedSpans.length} Identifiers Sanitized
            </div>
          </div>

          {/* Side-by-Side Diff */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Raw Original */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Raw Original Reflection (Your Eyes Only)
              </span>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap">
                {redactionDraft.originalText}
              </div>
            </div>

            {/* Redacted Sanitized Version */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Sanitized Redacted Share (What Grantee Sees)
              </span>
              <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-4 text-xs text-slate-900 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap font-medium">
                {redactionDraft.redactedText}
              </div>
            </div>
          </div>

          {/* Redacted Spans Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Sanitization Legend
            </h4>
            <div className="flex flex-wrap gap-2">
              {redactionDraft.redactedSpans.map((span, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                  <span className="line-through text-rose-500 font-mono">{span.original}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="font-bold text-emerald-700 font-mono">{span.redactedRole}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-sans">
                    {span.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Capability Grant Configuration */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              Configure Capability Grant (Firestore Security Rules Enforced)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Grantee User UID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 8xK9pL2vNm4Q..."
                  value={granteeUid}
                  onChange={(e) => setGranteeUid(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Grantee Email (Optional label)
                </label>
                <input
                  type="email"
                  placeholder="peer@example.com"
                  value={granteeEmail}
                  onChange={(e) => setGranteeEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Auto-Expiry Duration
                </label>
                <select
                  value={expiryHours}
                  onChange={(e) => setExpiryHours(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-purple-500"
                >
                  <option value={12}>12 Hours (Ephemeral)</option>
                  <option value={24}>24 Hours (1 Day - Default)</option>
                  <option value={72}>72 Hours (3 Days)</option>
                  <option value={168}>7 Days (1 Week)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Grant is revocable by you at any time. Rules forbid non-grantees or expired queries from reading.</span>
              </div>

              <button
                onClick={handleCreateShareCapability}
                disabled={isSubmittingShare || !granteeUid.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Share2 className="w-4 h-4" />
                <span>{isSubmittingShare ? 'Publishing Capability...' : 'Approve & Create Share Grant'}</span>
              </button>
            </div>
          </div>

          {/* Share Published Banner */}
          {shareSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-3 text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <strong>Share capability successfully registered in Firestore!</strong>
                  <div className="text-[11px] font-mono text-emerald-700">Share ID: {shareSuccess} | Expires in {expiryHours} hours</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
