// src/features/presupuesto/hooks/usePresupuesto.js
// ─── Presupuesto Hook ────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../store/auth.store';
import { currentMonth } from '../types';
import {
  getPresupuesto,
  upsertPresupuesto,
} from '../services/presupuesto.service';

/**
 * Manages presupuesto state for the current month.
 * @param {string} [month] — YYYY-MM, defaults to current month
 * @returns {{ budgetUsd: number | null, loading: boolean, error: string | null, setBudgetUsd: (budgetUsd: number) => Promise<void> }}
 */
export function usePresupuesto(month) {
  const { user } = useAuthStore();
  const userId = user?.uid;
  const targetMonth = month || currentMonth();

  const [budgetUsd, setBudgetUsdState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getPresupuesto(userId, targetMonth)
      .then((data) => { if (!cancelled) setBudgetUsdState(data ? data.budgetUsd : null); })
      .catch((err) => { if (!cancelled) setError(err?.message || 'Error al cargar presupuesto'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId, targetMonth]);

  const setBudgetUsd = useCallback(async (amount) => {
    if (!userId) throw new Error('Usuario no autenticado');
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('El presupuesto debe ser un número mayor a 0');
    }
    setError(null);
    try {
      const result = await upsertPresupuesto(userId, targetMonth, amount);
      setBudgetUsdState(result.budgetUsd);
    } catch (err) {
      setError(err?.message || 'Error al guardar presupuesto');
      throw err;
    }
  }, [userId, targetMonth]);

  return { budgetUsd, loading, error, setBudgetUsd };
}
