// src/features/auth/useAuth.js
import { useEffect, useMemo, useState, useCallback } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState(null);      // Firebase user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginGoogle = useCallback(async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err?.message || 'Error al iniciar sesión con Google');
      throw err;
    }
  }, []);

  const loginEmail = useCallback(async (email, password) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err?.message || 'Error al iniciar sesión');
      throw err;
    }
  }, []);

  const signupEmail = useCallback(async (email, password) => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err?.message || 'Error al crear cuenta');
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err) {
      setError(err?.message || 'Error al cerrar sesión');
    }
  }, []);

  // Lo que usa tu app en services: user?.uid
  const value = useMemo(() => ({
    user,
    loading,
    error,
    loginGoogle,
    loginEmail,
    signupEmail,
    logout,
  }), [user, loading, error, loginGoogle, loginEmail, signupEmail, logout]);

  return value;
}