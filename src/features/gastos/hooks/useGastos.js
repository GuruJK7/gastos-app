// src/hooks/useGastos.js
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeToGastos,
  addGastoToFirestore,
  updateGastoInFirestore,
  deleteGastoFromFirestore,
  deleteAllGastosForUser,
} from '../services/firestoreService';

/**
 * useGastos
 *
 * Owns React state for the gastos collection.
 * All Firestore I/O is delegated to firestoreService — this hook
 * never imports `db` directly.
 */
export const useGastos = () => {
  const { user: authUser, isAuthInitialized } = useAuth();
  const [gastos, setGastos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // ─── Real-time subscription ───────────────────────────────────
  useEffect(() => {
    if (!isAuthInitialized) {
      setLoading(true);
      return;
    }

    if (!authUser) {
      // Auth is ready but no user — nothing to subscribe to.
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

  // ─── Mutations ────────────────────────────────────────────────

  const addGasto = async (nuevoGasto) => {
    if (!authUser) throw new Error('Usuario no autenticado');
    const id = await addGastoToFirestore(authUser.uid, nuevoGasto);
    return { id, ...nuevoGasto };
  };

  const updateGasto = async (gastoId, datosActualizados) => {
    if (!authUser) throw new Error('Usuario no autenticado');
    await updateGastoInFirestore(gastoId, datosActualizados);
  };

  const deleteGasto = async (gastoId) => {
    if (!authUser) throw new Error('Usuario no autenticado');
    await deleteGastoFromFirestore(gastoId);
    // Optimistic local removal — onSnapshot will confirm.
    setGastos((prev) => prev.filter((g) => g.id !== gastoId));
  };

  const clearAllGastos = async () => {
    if (!authUser) throw new Error('Usuario no autenticado');
    await deleteAllGastosForUser(authUser.uid);
    setGastos([]);
  };

  return {
    gastos,
    loading,
    error,
    user: authUser
      ? {
          id: authUser.uid,
          firstName:
            authUser.displayName?.split(' ')[0] ||
            (authUser.isAnonymous ? 'Usuario' : 'Admin'),
          email: authUser.email || 'anonymous',
          isAnonymous: authUser.isAnonymous,
        }
      : null,
    addGasto,
    updateGasto,
    deleteGasto,
    clearAllGastos,
  };
};