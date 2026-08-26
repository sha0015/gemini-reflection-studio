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

// Helper to sign in with Google
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
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

// Helper for guest / demo sign-in
export async function signInAsGuest(): Promise<FirebaseUser> {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Anonymous Sign-In Error:', error);
    throw error;
  }
}

// Sign out
export async function signOutUser(): Promise<void> {
  await fbSignOut(auth);
}

export { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc, 
  serverTimestamp, 
  onSnapshot,
  updateDoc
};
