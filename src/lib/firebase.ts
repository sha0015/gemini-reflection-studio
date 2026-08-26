import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged as fbOnAuthStateChanged,
  User as FirebaseUser,
  signInAnonymously
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  updateDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firestore with configured databaseId or default
let firestoreInstance: Firestore;
try {
  if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
    firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } else {
    firestoreInstance = getFirestore(app);
  }
} catch (err) {
  console.warn('[Firebase] Fallback to default Firestore instance:', err);
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;

const GUEST_SESSION_KEY = 'gemini_reflection_guest_session_v1';
const GUEST_ENTRIES_KEY = 'gemini_reflection_guest_entries_v1';

export function getGuestSession(): any | null {
  try {
    const raw = localStorage.getItem(GUEST_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getGuestEntries(): any[] {
  try {
    const raw = localStorage.getItem(GUEST_ENTRIES_KEY);
    if (!raw) {
      // Prepopulate high-quality demo reflections for instant testing of Circles, Patterns & Actions
      const initialDemoEntries = [
        {
          id: 'demo_entry_launch_01',
          userId: 'guest_demo_user',
          title: 'Q3 Product Architecture & Launch Strategy',
          category: 'decision_memo',
          mode: 'first_principles',
          tags: ['architecture', 'launch', 'strategy', 'gemini'],
          summary: 'Evaluating whether to decouple client-side encryption modules before the beta launch. Weighing zero-knowledge security guarantees against migration friction with Dr. Aris Thorne and Jane Miller at Vertex Labs.',
          sentiment: 'Focused & Pragmatic',
          keyInsights: [
            'True zero-knowledge WebCrypto AES-GCM guarantees eliminate server-side blast radius.',
            'Peer sharing needs automated anonymization diffs so sensitive customer names are never leaked.',
            'Closing the loop on action items requires an explicit state machine beyond simple checkboxes.'
          ],
          actionItems: [
            'Finalize WebCrypto PBKDF2 key derivation iterations at 100k rounds',
            'Conduct cross-entry pattern analysis across team reflection notes',
            'Schedule peer review session in Reflection Circles with mentor'
          ],
          actionItemsStructured: [
            { id: 'act_demo_1', text: 'Finalize WebCrypto PBKDF2 key derivation iterations at 100k rounds', status: 'done', priority: 'high' },
            { id: 'act_demo_2', text: 'Conduct cross-entry pattern analysis across team reflection notes', status: 'open', priority: 'high' },
            { id: 'act_demo_3', text: 'Schedule peer review session in Reflection Circles with mentor', status: 'open', priority: 'medium' }
          ],
          messages: [
            {
              id: 'msg_demo_1',
              role: 'user',
              content: 'I need to decide whether our client-side encryption rollout at Vertex Labs is ready for external beta, or if we should add automated sanitization first.',
              timestamp: Date.now() - 86400000 * 2
            },
            {
              id: 'msg_demo_2',
              role: 'model',
              content: 'Let us decompose this using First Principles: The fundamental risk is exposing identifying metadata during collaborative sharing. Coupling client-side AES-GCM with automated LLM redaction solves both confidentiality at rest and privacy in transit.',
              timestamp: Date.now() - 86400000 * 2 + 5000
            }
          ],
          spatialContext: {
            locationName: 'Design Studio Sanctuary, Seattle',
            placeCategory: 'workspace',
            weatherCondition: 'Overcast & Quiet',
            temperatureC: 19,
            atmosphereEmoji: '☕'
          },
          isFavorite: true,
          wordCount: 310,
          privacyShieldUsed: true,
          isClientEncrypted: true,
          createdAt: Date.now() - 86400000 * 2,
          updatedAt: Date.now() - 86400000 * 2
        },
        {
          id: 'demo_entry_mindful_02',
          userId: 'guest_demo_user',
          title: 'Evening Forest Walk & Cognitive Decompression',
          category: 'mindfulness',
          mode: 'mindfulness',
          tags: ['mindfulness', 'nature', 'recovery', 'calm'],
          summary: 'Reflecting on stress management after a high-intensity sprint. Noticed a strong correlation between 45 minutes in forested trails and reduced cognitive fatigue.',
          sentiment: 'Serene & Rejuvenated',
          keyInsights: [
            'Physical environment acts as a cognitive grounding anchor.',
            'Regular boundary-setting on late night triage prevents burnout buildup.'
          ],
          actionItems: [
            'Block 30-minute afternoon walking reflection every Tuesday and Thursday',
            'Log atmospheric conditions during deep work sessions'
          ],
          actionItemsStructured: [
            { id: 'act_demo_4', text: 'Block 30-minute afternoon walking reflection every Tuesday and Thursday', status: 'open', priority: 'medium' },
            { id: 'act_demo_5', text: 'Log atmospheric conditions during deep work sessions', status: 'done', priority: 'low' }
          ],
          messages: [
            {
              id: 'msg_demo_3',
              role: 'user',
              content: 'Feeling drained from back-to-back reviews. Taking a quiet walk through the pine grove to reset my mental clarity.',
              timestamp: Date.now() - 86400000
            },
            {
              id: 'msg_demo_4',
              role: 'model',
              content: 'Notice the rhythm of your breath and the ambient sounds around you. Allow thoughts about work deadlines to pass like clouds without grasping or resisting.',
              timestamp: Date.now() - 86400000 + 4000
            }
          ],
          spatialContext: {
            locationName: 'Pine Ridge Trail, Cascade Foothills',
            placeCategory: 'nature',
            weatherCondition: 'Crisp & Pine Mist',
            temperatureC: 15,
            atmosphereEmoji: '🌲'
          },
          isFavorite: false,
          wordCount: 240,
          privacyShieldUsed: false,
          isClientEncrypted: false,
          createdAt: Date.now() - 86400000,
          updatedAt: Date.now() - 86400000
        }
      ];
      localStorage.setItem(GUEST_ENTRIES_KEY, JSON.stringify(initialDemoEntries));
      return initialDemoEntries;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveGuestEntries(entries: any[]): void {
  try {
    localStorage.setItem(GUEST_ENTRIES_KEY, JSON.stringify(entries));
    window.dispatchEvent(new CustomEvent('gemini_reflection_guest_entries_changed', { detail: entries }));
  } catch (e) {
    console.error('Failed to save guest entries:', e);
  }
}

// Helper to sign in with Google
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    localStorage.removeItem(GUEST_SESSION_KEY);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    // If popup was closed or blocked, re-throw with user-friendly message
    if (error?.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by browser. Please allow popups for this page or try again.');
    }
    if (error?.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in popup was closed before completing. Please try again.');
    }
    throw error;
  }
}

// Helper for guest / demo sign-in with robust fallback for admin-restricted environments
export async function signInAsGuest(): Promise<any> {
  try {
    const result = await signInAnonymously(auth);
    localStorage.removeItem(GUEST_SESSION_KEY);
    return result.user;
  } catch (error: any) {
    console.warn('[Firebase Auth] Anonymous sign-in was restricted or disabled in console, initializing Sandbox Guest Mode:', error);
    
    // Create instant local guest user session
    const guestUser = {
      uid: 'guest_demo_user',
      displayName: 'Guest Tester (Local Sandbox)',
      email: null,
      photoURL: null,
      isAnonymous: true
    };
    
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(guestUser));
    // Ensure initial demo entries exist
    getGuestEntries();
    
    // Notify all app listeners
    window.dispatchEvent(new CustomEvent('gemini_reflection_auth_change', { detail: guestUser }));
    return guestUser;
  }
}

// Unified auth state listener supporting both Firebase Google Auth and Instant Guest Sandbox
export function subscribeToAuth(callback: (user: any | null) => void): () => void {
  const handleCustomAuthChange = (e: any) => {
    const user = e.detail;
    callback(user);
  };
  window.addEventListener('gemini_reflection_auth_change', handleCustomAuthChange);

  const fbUnsub = fbOnAuthStateChanged(auth, (fbUser) => {
    if (fbUser) {
      localStorage.removeItem(GUEST_SESSION_KEY);
      callback(fbUser);
    } else {
      const guest = getGuestSession();
      callback(guest);
    }
  });

  return () => {
    window.removeEventListener('gemini_reflection_auth_change', handleCustomAuthChange);
    fbUnsub();
  };
}

// Sign out
export async function signOutUser(): Promise<void> {
  localStorage.removeItem(GUEST_SESSION_KEY);
  window.dispatchEvent(new CustomEvent('gemini_reflection_auth_change', { detail: null }));
  try {
    await fbSignOut(auth);
  } catch (e) {
    console.warn('Firebase signOut notice:', e);
  }
}

export { 
  collection, 
  doc, 
  setDoc,
  addDoc,
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc, 
  serverTimestamp, 
  onSnapshot,
  updateDoc
};
