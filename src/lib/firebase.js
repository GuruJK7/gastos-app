// src/lib/firebase.js
// Single source of truth for Firebase initialization (modular SDK v9+)
// All Firebase imports across the app MUST come from this file.

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// ── Step 1.9: read credentials from .env (never hardcode secrets) ──
const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId:     process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Guard: catch missing env vars early in development
if (!firebaseConfig.apiKey) {
  throw new Error(
    'Firebase API key is missing. Create a .env file based on .env.example'
  );
}

// Initialize Firebase only once to prevent duplicate app initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const db   = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Analytics only in production (not on localhost)
if (!window.location.hostname.includes('localhost')) {
  isSupported()
    .then((supported) => { if (supported) getAnalytics(app); })
    .catch(() => {});
}

export { app, auth, db, googleProvider };