// src/features/ingresos/hooks/useIngresosMes.js
// ─── Ingresos del Mes Hook ──────────────────────────────────────────────
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '../../../store/auth.store';
import { listIngresosByMonth } from '../services/ingresos.service';

/**
 * Fetches ingresos for a given month and computes the monthly total.
 * @param {string} [month] — YYYY-MM, defaults to current month
 * @returns {{ ingresosDelMes: number, ingresosMesUsd: number, ingresos: import('../types').Ingreso[], loading: boolean, error: string|null, refresh: () => Promise<void> }}
 */
export function useIngresosMes(month) {
  const { user } = useAuthStore();
  const userId = user?.uid;
  const targetMonth = month || new Date().toISOString().slice(0, 7);

  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    listIngresosByMonth(userId, targetMonth)
      .then((data) => { if (!cancelled) setIngresos(data); })
      .catch((err) => { if (!cancelled) setError(err?.message || 'Error al cargar ingresos'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId, targetMonth]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listIngresosByMonth(userId, targetMonth);
      setIngresos(data);
    } catch (err) {
      setError(err?.message || 'Error al cargar ingresos');
    } finally {
      setLoading(false);
    }
  }, [userId, targetMonth]);

  const ingresosDelMes = useMemo(
    () => ingresos.reduce((sum, i) => sum + (i.monto ?? 0), 0),
    [ingresos],
  );

  const ingresosMesUsd = useMemo(
    () => ingresos.reduce((sum, i) => sum + (i.montoUsd ?? 0), 0),
    [ingresos],
  );

  return { ingresosDelMes, ingresosMesUsd, ingresos, loading, error, refresh };
}
