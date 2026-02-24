// src/features/ingresos/hooks/useIngresos.js
// ─── Ingresos CRUD Hook ─────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../store/auth.store';
import {
  listIngresos,
  createIngreso as createIngresoSvc,
  updateIngreso as updateIngresoSvc,
  deleteIngreso as deleteIngresoSvc,
} from '../services/ingresos.service';

/**
 * Manages ingresos state: fetch, create, update, delete with loading/error.
 * @returns {{ ingresos: import('../types').Ingreso[], loading: boolean, error: string|null, submitting: boolean, create: (draft: object) => Promise<void>, update: (id: string, changes: object) => Promise<void>, remove: (id: string) => Promise<void>, refresh: () => Promise<void> }}
 */
export function useIngresos() {
  const { user } = useAuthStore();
  const userId = user?.uid;

  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    listIngresos(userId)
      .then((data) => { if (!cancelled) setIngresos(data); })
      .catch((err) => { if (!cancelled) setError(err?.message || 'Error al cargar ingresos'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listIngresos(userId);
      setIngresos(data);
    } catch (err) {
      setError(err?.message || 'Error al cargar ingresos');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const create = useCallback(async (draft) => {
    if (!userId) throw new Error('Usuario no autenticado');
    if (!draft.monto || !draft.fecha) {
      throw new Error('Faltan campos requeridos');
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await createIngresoSvc(draft, userId);
      setIngresos((prev) => [created, ...prev]);
    } catch (err) {
      setError(err?.message || 'Error al crear ingreso');
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [userId]);

  const update = useCallback(async (ingresoId, changes) => {
    if (!userId) throw new Error('Usuario no autenticado');
    if (!ingresoId) throw new Error('ingresoId es requerido');
    setSubmitting(true);
    setError(null);
    try {
      await updateIngresoSvc(ingresoId, changes);
      setIngresos((prev) =>
        prev.map((i) => (i.id === ingresoId ? { ...i, ...changes } : i)),
      );
    } catch (err) {
      setError(err?.message || 'Error al actualizar ingreso');
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [userId]);

  const remove = useCallback(async (ingresoId) => {
    if (!ingresoId) return;
    setError(null);
    try {
      await deleteIngresoSvc(ingresoId);
      setIngresos((prev) => prev.filter((i) => i.id !== ingresoId));
    } catch (err) {
      setError(err?.message || 'Error al eliminar ingreso');
    }
  }, []);

  return { ingresos, loading, error, submitting, create, update, remove, refresh };
}
