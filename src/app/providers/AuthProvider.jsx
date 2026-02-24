import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../../lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, signInWithEmailAndPassword } from 'firebase/auth';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

const isDev = process.env.NODE_ENV !== 'production';
const DEV_EMAIL = process.env.REACT_APP_DEV_ADMIN_EMAIL;
const DEV_PASSWORD = process.env.REACT_APP_DEV_ADMIN_PASSWORD;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setLoading(false);
      } else if (isDev && DEV_EMAIL && DEV_PASSWORD) {
        signInWithEmailAndPassword(auth, DEV_EMAIL, DEV_PASSWORD).catch(() => {
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const login = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
