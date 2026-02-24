// src/features/auth/auth.service.js
// ─── Firebase Auth Service ───────────────────────────────────────────────
import { signInAnonymously, signOut as fbSignOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

/**
 * Sign in anonymously. Called once on app start.
 * If already signed in, Firebase returns the existing user.
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export function loginAnonymously() {
  return signInAnonymously(auth);
}

/**
 * Sign out the current user.
 * @returns {Promise<void>}
 */
export function logout() {
  return fbSignOut(auth);
}

/**
 * Extract a serialisable user object from a Firebase User.
 * @param {import('firebase/auth').User | null} fbUser
 * @returns {{ uid: string, displayName: string, isAnonymous: boolean } | null}
 */
export function serializeUser(fbUser) {
  if (!fbUser) return null;
  return {
    uid: fbUser.uid,
    displayName: fbUser.isAnonymous
      ? 'Usuario Anónimo'
      : fbUser.displayName || 'Usuario',
    isAnonymous: fbUser.isAnonymous,
  };
}
