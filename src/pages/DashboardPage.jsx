import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/auth.store';
import { listGastos } from '../features/gastos/services/gastos.service';
import { usePresupuesto } from '../features/presupuesto/hooks/usePresupuesto';
import { useIngresosMes } from '../features/ingresos/hooks/useIngresosMes';
import DashboardGrid from '../components/dashboard/DashboardGrid';
import { useNavigate } from 'react-router-dom';

const DEFAULT_BUDGET = 2500;

const CATEGORY_COLORS = {
  Comida:          { color: '#22d3ee', colorEnd: '#06b6d4' },
  Supermercado:    { color: '#a78bfa', colorEnd: '#8b5cf6' },
  Transporte:      { color: '#4ade80', colorEnd: '#16a34a' },
  Entretenimiento: { color: '#fbbf24', colorEnd: '#d97706' },
  Farmacia:        { color: '#f87171', colorEnd: '#dc2626' },
  Servicios:       { color: '#60a5fa', colorEnd: '#2563eb' },
  Educación:       { color: '#f472b6', colorEnd: '#db2777' },
  Otro:            { color: '#94a3b8', colorEnd: '#64748b' },
};

const CATEGORY_ICONS = {
  Comida: '🍔', Supermercado: '🛒', Transporte: '🚗',
  Entretenimiento: '🎬', Farmacia: '💊', Servicios: '🔧',
  Educación: '📚', Otro: '📦',
};

function getUsdValue(item) {
  return Number(item.amountUsd ?? item.amount ?? item.monto ?? 0);
}

function parseExpenseDate(item) {
  const raw = item.fecha ?? item.date ?? item.createdAt;
  if (raw == null) return null;
  if (typeof raw === 'object' && typeof raw.toDate === 'function') {
    const d = raw.toDate();
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof raw === 'string') {
    if (raw.includes('/')) {
      const parts = raw.split('/');
      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
        return isNaN(d.getTime()) ? null : d;
      }
      return null;
    }
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof raw === 'number') {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { budgetUsd, loading: budgetLoading, setBudgetUsd } = usePresupuesto();
  const budget = budgetUsd ?? DEFAULT_BUDGET;

  const { ingresosMesUsd, loading: ingresosLoading, refresh: refreshIngresos } = useIngresosMes();

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    listGastos(user.uid)
      .then((data) => { if (!cancelled) setGastos(data); })
      .catch((err) => { if (!cancelled) setError(err?.message || 'Error al cargar gastos'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.uid, refreshKey]);

  // Also refresh ingresos when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0) {
      refreshIngresos().catch(() => {});
    }
  }, [refreshKey, refreshIngresos]);

  const stats = useMemo(() => {
    const totalSpent = gastos.reduce((s, g) => s + (g.amountUsd || g.amount), 0);
    const available = ingresosMesUsd - totalSpent;

    // Unique active days
    const uniqueDays = new Set(gastos.map((g) => g.date)).size;

    // Running totals for sparklines (oldest → newest, reversed slice)
    const reversed = [...gastos].reverse();
    const spentSpark = [];
    let runSum = 0;
    for (const g of reversed) {
      runSum += (g.amountUsd || g.amount);
      spentSpark.push(runSum);
    }
    const availSpark = spentSpark.map((v) => ingresosMesUsd - v);

    // Category totals
    const catMap = {};
    for (const g of gastos) {
      catMap[g.category] = (catMap[g.category] || 0) + (g.amountUsd || g.amount);
    }
    const categories = Object.entries(catMap)
      .map(([name, amount]) => ({
        name,
        amount,
        ...(CATEGORY_COLORS[name] || CATEGORY_COLORS.Otro),
      }))
      .sort((a, b) => b.amount - a.amount);

    // Recent activity (top 5)
    const recent = gastos.slice(0, 5).map((g) => ({
      id: g.id,
      category: g.category,
      icon: CATEGORY_ICONS[g.category] || '📦',
      method: g.paymentMethod,
      datetime: g.date,
      amount: -(g.amountUsd || g.amount),
    }));

    return {
      totalSpent, available, uniqueDays, categories, recent,
      ingresosDelMes: ingresosMesUsd,
      spentSpark: spentSpark.length >= 2 ? spentSpark : [0, 0],
      availSpark: availSpark.length >= 2 ? availSpark : [ingresosMesUsd, ingresosMesUsd],
      txCount: gastos.length,
      budget,
    };
  }, [gastos, budget, ingresosMesUsd]);

  const { monthlySpendPoints, monthLabel } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const monthIndex = now.getMonth();
    const start = new Date(year, monthIndex, 1);
    const end = new Date(year, monthIndex + 1, 0); // last day of month
    const daysInMonth = end.getDate();
    const dailyTotals = new Array(daysInMonth).fill(0);

    for (const gasto of gastos) {
      const d = parseExpenseDate(gasto);
      if (
        d &&
        d.getFullYear() === year &&
        d.getMonth() === monthIndex
      ) {
        dailyTotals[d.getDate() - 1] += getUsdValue(gasto);
      }
    }

    const monthlySpendPoints = dailyTotals.map((usd, i) => ({ day: i + 1, usd }));
    const monthLabel = `${start.toLocaleString('es-UY', { month: 'long' })} ${year}`;

    return { monthlySpendPoints, monthLabel };
  }, [gastos]);

  const isLoading = loading || budgetLoading || ingresosLoading;

  return (
    <section className="page">
      {error && (
        <div style={{
          padding: '0.625rem 1rem', marginBottom: '1rem',
          borderRadius: 'var(--radius-md)', background: 'var(--danger-muted)',
          color: 'var(--danger)', fontSize: '0.8125rem', fontWeight: 500,
        }}>
          ⚠️ {error}
        </div>
      )}
      <DashboardGrid
        stats={stats}
        loading={isLoading}
        gastos={gastos}
        onRefresh={() => setRefreshKey((k) => k + 1)}
        presupuesto={{ amount: budgetUsd }}
        onEditPresupuesto={setBudgetUsd}
        onNavigateIngresos={() => navigate('/ingresos')}
        monthlySpendPoints={monthlySpendPoints}
        monthLabel={monthLabel}
      />
    </section>
  );
}
