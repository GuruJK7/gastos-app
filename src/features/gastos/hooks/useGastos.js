// src/features/gastos/hooks/useGastos.js
// ─── Gastos CRUD Hook ────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../store/auth.store';
import {
  listGastos,
  createGasto as createGastoSvc,
  deleteGasto as deleteGastoSvc,
} from '../services/gastos.service';

/**
 * Manages gastos state: fetch, create, delete with loading/error.
 * @returns {{ gastos: import('../types').Gasto[], loading: boolean, error: string|null, submitting: boolean, create: (draft: object) => Promise<void>, remove: (gastoId: string) => Promise<void>, refresh: () => Promise<void> }}
 */
export function useGastos() {
  const { user } = useAuthStore();
  const userId = user?.uid;

  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listGastos(userId);
      setGastos(data);
    } catch (err) {
      setError(err?.message || 'Error al cargar gastos');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    if (userId) {
      setLoading(true);
      setError(null);
      listGastos(userId)
        .then((data) => { if (!cancelled) setGastos(data); })
        .catch((err) => { if (!cancelled) setError(err?.message || 'Error al cargar gastos'); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }
    return () => { cancelled = true; };
  }, [userId]);

  const create = useCallback(async (draft) => {
    if (!userId) throw new Error('Usuario no autenticado');
    if (!draft.amount || !draft.category || !draft.date || !draft.paymentMethod) {
      throw new Error('Faltan campos requeridos');
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await createGastoSvc({
        ...draft,
        currency: draft.currency || 'USD',
        exchangeRate: draft.exchangeRate || 1,
        userId,
      });
      setGastos((prev) => [created, ...prev]);
    } catch (err) {
      setError(err?.message || 'Error al crear gasto');
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [userId]);

  const remove = useCallback(async (gastoId) => {
    if (!gastoId) return;
    setError(null);
    try {
      await deleteGastoSvc(gastoId);
      setGastos((prev) => prev.filter((g) => g.id !== gastoId));
    } catch (err) {
      setError(err?.message || 'Error al eliminar gasto');
    }
  }, []);

  return { gastos, loading, error, submitting, create, remove, refresh: fetch };
}
