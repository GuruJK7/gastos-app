// src/contexts/GastosContext.js
//
// Single source of truth for the gastos collection.
// One Firestore onSnapshot listener for the entire app lifetime.
// All components read from this context — no component ever calls
// useGastos() in isolation and creates a duplicate listener.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import {
  subscribeToGastos,
  addGastoToFirestore,
  updateGastoInFirestore,
  deleteGastoFromFirestore,
  deleteAllGastosForUser,
} from '../../shared/services/firestoreService';

// ─── Context ─────────────────────────────────────────────────────────────────

const GastosContext = createContext(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export const GastosProvider = ({ children }) => {
  const { user: authUser, isAuthInitialized } = useAuth();

  const [gastos, setGastos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // ── One subscription for the whole app ───────────────────────
  useEffect(() => {
    if (!isAuthInitialized) {
      setLoading(true);
      return;
    }

    if (!authUser) {
      // Auth is ready but no user is signed in — nothing to subscribe to.
      setGastos([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToGastos(
      authUser.uid,
      (data) => {
        setGastos(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        if (err.code === 'permission-denied') {
          setError('Sin permisos para acceder a los gastos. Verifica las reglas de Firestore.');
        } else if (err.code === 'failed-precondition') {
          setError('Firestore no está configurado correctamente. Verifica las reglas.');
        } else {
          setError(null);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authUser, isAuthInitialized]);

  // ── Mutations ─────────────────────────────────────────────────
  // useCallback prevents child components from re-rendering when
  // the provider re-renders for unrelated reasons.

  const addGasto = useCallback(async (nuevoGasto) => {
    if (!authUser) throw new Error('Usuario no autenticado');
    const id = await addGastoToFirestore(authUser.uid, nuevoGasto);
    return { id, ...nuevoGasto };
  }, [authUser]);

  const updateGasto = useCallback(async (gastoId, datosActualizados) => {
    if (!authUser) throw new Error('Usuario no autenticado');
    await updateGastoInFirestore(gastoId, datosActualizados);
  }, [authUser]);

  const deleteGasto = useCallback(async (gastoId) => {
    if (!authUser) throw new Error('Usuario no autenticado');
    await deleteGastoFromFirestore(gastoId);
    // Optimistic update — confirmed by onSnapshot.
    setGastos((prev) => prev.filter((g) => g.id !== gastoId));
  }, [authUser]);

  const clearAllGastos = useCallback(async () => {
    if (!authUser) throw new Error('Usuario no autenticado');
    await deleteAllGastosForUser(authUser.uid);
    setGastos([]);
  }, [authUser]);

  // ── Derived user shape (same as useGastos exposed before) ─────
  const user = authUser
    ? {
        id: authUser.uid,
        firstName:
          authUser.displayName?.split(' ')[0] ||
          (authUser.isAnonymous ? 'Usuario' : 'Admin'),
        email: authUser.email || 'anonymous',
        isAnonymous: authUser.isAnonymous,
      }
    : null;

  const value = {
    gastos,
    loading,
    error,
    user,
    addGasto,
    updateGasto,
    deleteGasto,
    clearAllGastos,
  };

  return (
    <GastosContext.Provider value={value}>
      {children}
    </GastosContext.Provider>
  );
};

// ─── Consumer hook ────────────────────────────────────────────────────────────

export const useGastosContext = () => {
  const context = useContext(GastosContext);
  if (!context) {
    throw new Error('useGastosContext must be used within a GastosProvider');
  }
  return context;
};
