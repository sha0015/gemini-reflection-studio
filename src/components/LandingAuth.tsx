import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Database, 
  Lock, 
  ArrowRight, 
  Feather, 
  BrainCircuit, 
  CheckCircle2, 
  Layers, 
  Zap, 
  Users,
  Compass,
  FileText
} from 'lucide-react';
import { signInWithGoogle, signInAsGuest } from '../lib/firebase';

interface LandingAuthProps {
  onSuccess?: () => void;
}

export const LandingAuth: React.FC<LandingAuthProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setError(err?.message || 'Failed to complete sign-in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInAsGuest();
      onSuccess?.();
    } catch (err: any) {
      console.error('Guest sign-in error:', err);
      setError(err?.message || 'Failed to sign in as demo guest.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Decorative backdrop glow */}
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Hero & Benefits */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Gemini 3.6 Flash + Cloud Firestore
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                  <Lock className="w-3 h-3 text-slate-500" />
                  Zero-Knowledge Isolation
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Reflect deeper. <br />
                <span className="text-emerald-700">Synthesize clarity with AI.</span>
              </h1>

              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                A private, multi-turn AI journaling companion that listens, categorizes, brainstorms, and extracts structured insights from your stream of consciousness.
              </p>

              {/* Feature Highlights */}
              <div className="mt-8 space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Feather className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900">Multi-Turn Journal Reflections</h2>
                    <p className="text-xs text-slate-600">Converse iteratively with Gemini 3.6 Flash to unpack thoughts, explore decisions, and brainstorm creative paths.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100/80 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900">Automated Synthesis & Action Items</h2>
                    <p className="text-xs text-slate-600">Auto-generates executive summaries, key takeaways, sentiment tags, and concrete next steps from each reflection.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100/80 text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900">Strictly Isolated Cloud Firestore</h2>
                    <p className="text-xs text-slate-600">Protected by owner-bound Firestore rules (<code className="font-mono text-[11px] text-slate-800">request.auth.uid == userId</code>). Your entries are 100% private to your account.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Firebase Auth Protected
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                Resilient Fallback Ladder
              </span>
            </div>
          </div>

          {/* Right Column: Sign In Card */}
          <div className="lg:col-span-5 p-8 sm:p-10 bg-slate-50/70 flex flex-col justify-center">
            <div className="w-full max-w-sm mx-auto space-y-6">
              
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md mb-3">
                  <Feather className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Sign in to your Journal</h2>
                <p className="text-xs text-slate-600 mt-1">
                  Authenticate securely using Google Sign-In to access your private reflection space.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2">
                  <span className="font-semibold shrink-0">Note:</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Primary Google Auth Action */}
              <div className="space-y-3">
                <button
                  id="btn-google-signin"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-sm py-3 px-4 rounded-xl shadow-xs transition-all hover:border-slate-400 disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-wider font-medium">Or</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button
                  id="btn-guest-signin"
                  onClick={handleGuestSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Explore as Guest / Anonymous Tester</span>
                </button>
              </div>

              {/* Privacy Notice */}
              <div className="text-[11px] text-slate-500 text-center leading-relaxed">
                By continuing, your profile creates a private document under <code className="font-mono bg-slate-200/80 px-1 py-0.5 rounded text-slate-700">/users/{'{uid}'}</code> in Cloud Firestore. We never store plain passwords.
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
