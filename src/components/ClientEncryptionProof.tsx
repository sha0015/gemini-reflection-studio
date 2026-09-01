import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  Key, 
  ShieldCheck, 
  AlertTriangle, 
  FileCode, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Copy, 
  Sparkles,
  Info,
  RefreshCw
} from 'lucide-react';
import { User } from 'firebase/auth';
import { JournalEntry } from '../types';
import {
  generateRecoveryPhrase,
  generatePassphrase,
  encryptClientSide,
  decryptClientSide
} from '../lib/cryptoVault';
import { 
  getSessionPassphrase, 
  setSessionPassphrase, 
  getStoredRecoveryPhrase, 
  setStoredRecoveryPhrase 
} from '../lib/offlineQueue';

interface ClientEncryptionProofProps {
  user: User;
  entries: JournalEntry[];
  currentPassphrase?: string;
  onPassphraseChanged?: (pass: string) => void;
}

export const ClientEncryptionProof: React.FC<ClientEncryptionProofProps> = ({
  user,
  entries,
  currentPassphrase = '',
  onPassphraseChanged
}) => {
  const encryptedEntries = entries.filter(e => e.isClientEncrypted && e.encryptedEnvelope);
  const [passphraseInput, setPassphraseInput] = useState(getSessionPassphrase() || currentPassphrase || '');
  const [recoveryPhrase, setRecoveryPhrase] = useState(getStoredRecoveryPhrase() || '');
  const [isCopied, setIsCopied] = useState(false);
  const [showPhrase, setShowPhrase] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string>(encryptedEntries[0]?.id || '');
  const [decryptedPreview, setDecryptedPreview] = useState<any>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    if (!recoveryPhrase) {
      const generated = generateRecoveryPhrase();
      setRecoveryPhrase(generated);
      setStoredRecoveryPhrase(generated);
    }
  }, []);

  useEffect(() => {
    if (!selectedEntryId && encryptedEntries.length > 0) {
      setSelectedEntryId(encryptedEntries[0].id);
    }
  }, [entries]);

  const selectedEntry = encryptedEntries.find(e => e.id === selectedEntryId);
  const [passphraseVisible, setPassphraseVisible] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  const handleGeneratePassphrase = () => {
    setPassphraseInput(generatePassphrase());
    setPassphraseVisible(true);
    setSaveError(null);
    setShowResetConfirm(false);
  };

  // Same principle as the Studio save gate: a typed passphrase must actually
  // decrypt an existing entry before it's trusted, or a mistyped one would
  // silently fork the vault instead of failing loudly.
  const handleSavePassphrase = async () => {
    const pass = passphraseInput.trim();
    if (!pass) {
      setSaveError('Enter a passphrase first.');
      return;
    }
    const canary = selectedEntry || encryptedEntries[0];
    if (canary?.encryptedEnvelope) {
      try {
        await decryptClientSide(canary.encryptedEnvelope as any, pass);
      } catch {
        setSaveError("This doesn't match your existing entries.");
        setShowResetConfirm(true);
        return;
      }
    }
    setSessionPassphrase(pass);
    setSaveError(null);
    setShowResetConfirm(false);
    if (onPassphraseChanged) onPassphraseChanged(pass);
  };

  // The recovery phrase is already known on this device (it's right there on
  // screen) -- resetting just confirms it still decrypts real data, then
  // adopts the newly typed passphrase for everything saved from now on.
  const handleResetWithStoredRecovery = async () => {
    const canary = selectedEntry || encryptedEntries[0];
    if (!canary?.encryptedEnvelope || !recoveryPhrase) return;
    setResetBusy(true);
    try {
      await decryptClientSide(canary.encryptedEnvelope as any, recoveryPhrase);
      const pass = passphraseInput.trim();
      setSessionPassphrase(pass);
      setSaveError(null);
      setShowResetConfirm(false);
      if (onPassphraseChanged) onPassphraseChanged(pass);
    } catch {
      setSaveError("Even your saved recovery phrase doesn't match this entry — you may be signed into the wrong account.");
    } finally {
      setResetBusy(false);
    }
  };

  // Decrypts the actually-selected entry's real ciphertext envelope with whatever
  // secret is typed in -- the passphrase or the 12-word recovery phrase both work.
  const runDecryptPreview = async (secret: string) => {
    if (!secret || !selectedEntry?.encryptedEnvelope) {
      setDecryptedPreview(null);
      setDecryptError(null);
      return;
    }
    setIsDecrypting(true);
    setDecryptError(null);
    try {
      const decrypted = await decryptClientSide(selectedEntry.encryptedEnvelope as any, secret);
      setDecryptedPreview(decrypted);
    } catch (e: any) {
      setDecryptedPreview(null);
      setDecryptError(e?.message || 'Decryption failed.');
    } finally {
      setIsDecrypting(false);
    }
  };

  useEffect(() => {
    runDecryptPreview(passphraseInput);
  }, [selectedEntryId, passphraseInput]);

  return (
    <div className="space-y-6">
      
      {/* Real Zero-Knowledge Architecture Explainer */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">True Client-Side WebCrypto AES-GCM</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  PBKDF2 100,000 Iterations
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Data is encrypted in your browser memory before reaching Firestore. Database administrators and Google physically cannot read raw entries at rest.
              </p>
            </div>
          </div>
        </div>

        {/* Verbatim Architecture Sentence */}
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-200/90 leading-relaxed font-mono">
            <strong>Security Guarantee:</strong> Plaintext exists strictly in client browser memory and transiently in transit to Google for reasoning — never at rest in your Firestore database.
          </div>
        </div>

        {/* Passphrase & 12-Word Recovery Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Active Passphrase Control */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-3">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              Active Encryption Passphrase
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={passphraseVisible ? 'text' : 'password'}
                  placeholder="Enter client encryption key..."
                  value={passphraseInput}
                  onChange={(e) => { setPassphraseInput(e.target.value); setSaveError(null); setShowResetConfirm(false); }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-xs font-mono text-slate-100 focus:outline-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setPassphraseVisible(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  title={passphraseVisible ? 'Hide' : 'Reveal'}
                >
                  {passphraseVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <button
                onClick={handleSavePassphrase}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Set Key
              </button>
            </div>
            <button
              onClick={handleGeneratePassphrase}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900/60 hover:bg-slate-900 border border-dashed border-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold cursor-pointer"
            >
              <Key className="w-3 h-3 text-emerald-400" />
              Generate a strong passphrase for me
            </button>
            {saveError && (
              <div className="text-[11px] text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-lg p-2.5 space-y-2">
                <p className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 shrink-0" />{saveError}</p>
                {showResetConfirm && (
                  <button
                    onClick={handleResetWithStoredRecovery}
                    disabled={resetBusy}
                    className="w-full px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-md text-[11px] font-bold cursor-pointer disabled:opacity-50"
                  >
                    {resetBusy ? 'Verifying…' : "Reset using this device's recovery phrase"}
                  </button>
                )}
              </div>
            )}
            <p className="text-[11px] text-slate-400">
              Keys are derived client-side via PBKDF2 with a unique 16-byte random cryptographic salt.
            </p>
          </div>

          {/* 12-Word Recovery Phrase */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                12-Word Mnemonic Recovery Phrase
              </label>
              <button
                onClick={() => setShowPhrase(!showPhrase)}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                {showPhrase ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showPhrase ? 'Hide' : 'Reveal'}
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 font-mono text-xs text-amber-300 select-all flex items-center justify-between">
              <span>{showPhrase ? recoveryPhrase : '•••••••••••• •••••••••••• ••••••••••••'}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(recoveryPhrase);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className="p-1 hover:text-white text-slate-400 cursor-pointer"
                title="Copy Recovery Phrase"
              >
                {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <p className="text-[11px] text-rose-300/90 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
              <strong>Warning:</strong> Losing your passphrase and recovery phrase means your entries are mathematically unrecoverable.
            </p>
          </div>
        </div>
      </div>

      {/* Proof Panel: Raw Firestore Ciphertext Envelope vs Decrypted UI View */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-600" />
              Live Cryptographic Proof Panel
            </h3>
            <p className="text-xs text-slate-500">
              A real, currently-selected entry: the exact ciphertext envelope stored in Firestore, next to what your passphrase decrypts it to.
            </p>
          </div>

          {encryptedEntries.length > 0 && (
            <select
              value={selectedEntryId}
              onChange={(e) => setSelectedEntryId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              {encryptedEntries.map(e => (
                <option key={e.id} value={e.id}>{e.id.slice(0, 12)}… ({new Date(e.updatedAt).toLocaleDateString()})</option>
              ))}
            </select>
          )}
        </div>

        {encryptedEntries.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-500">
            No encrypted entries yet. Set a passphrase above, then save a reflection in the Studio tab — it will appear here as real ciphertext.
          </div>
        ) : (
          <>
            {/* Side-by-Side Proof Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Left: Raw Stored Document in Firestore */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-600" />
                    Raw Firestore Document (Stored at Rest)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">application/json</span>
                </div>

                <div className="bg-slate-950 text-emerald-400 font-mono text-[11px] p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-[300px] leading-relaxed shadow-inner">
                  <pre>{JSON.stringify(selectedEntry?.encryptedEnvelope || {}, null, 2)}</pre>
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  * This is the actual document written to Firestore for this entry — the title, summary, messages, insights, and action items were replaced with this ciphertext envelope before the write.
                </p>
              </div>

              {/* Right: Decrypted In-Memory Browser View */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                    Decrypted In-Memory Representation (Client-Only)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                    {isDecrypting ? 'Decrypting…' : decryptedPreview ? 'Decrypted via WebCrypto' : 'Locked'}
                  </span>
                </div>

                <div className="bg-slate-50 text-slate-800 font-mono text-[11px] p-4 rounded-xl border border-slate-200 overflow-x-auto max-h-[300px] leading-relaxed">
                  {decryptError ? (
                    <div className="text-rose-600 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 shrink-0" />{decryptError}</div>
                  ) : (
                    <pre>{JSON.stringify(decryptedPreview || { status: 'Enter the passphrase or recovery phrase above to decrypt.' }, null, 2)}</pre>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  * Decrypted exclusively in this browser tab using the passphrase or recovery phrase you type above — never sent anywhere.
                </p>
              </div>

            </div>
          </>
        )}
      </div>

    </div>
  );
};
