import React, { useMemo, useState } from 'react';
import { useGastosContext } from '../contexts/GastosContext';
import { useToast } from '../contexts/ToastContext';
import {
  validateGasto,
  getCategories,
  getPaymentMethods,
} from '../services/validationService';
import '../styles/Dashboard.css';

/* ─── Category metadata ───────────────────────────────────────────────────── */
const CATEGORY_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const CATEGORIES = getCategories();
const PAY_METHODS = getPaymentMethods();

const getCategoryIcon = (categoria) => {
  const icons = {
    Comida: '🍽️', Supermercado: '🛒', Transporte: '🚗', Hogar: '🏠',
    Salud: '🏥', Suscripciones: '📱', Ocio: '🎬', Ropa: '👕',
    Educación: '📚', Impuestos: '📋', Otros: '📦',
  };
  return icons[categoria] || '📦';
};

const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

const fmt = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(n);

/* ─── Sub-components (pure, no hooks) ────────────────────────────────────── */
const HeroStat = ({ label, value, colorClass, badge }) => (
  <div className="hero-stat">
    <span className="hero-stat-label">{label}</span>
    <span className={`hero-stat-value ${colorClass}`}>{value}</span>
    {badge && (
      <span className={`hero-stat-badge ${badge.dir}`}>
        {badge.dir === 'up' ? '↑' : '↓'} {badge.text}
      </span>
    )}
  </div>
);

const MetricCard = ({ accent, label, value, footer, progress }) => (
  <div className="metric-card" style={{ '--metric-accent': accent }}>
    <div className="metric-body">
      <span className="metric-label">{label}</span>
      <div className="metric-value">{value}</div>
      {footer && <div className="metric-footer">{footer}</div>}
      {progress !== undefined && (
        <div className="metric-progress">
          <div
            className={`metric-progress-fill${progress > 100 ? ' over' : ''}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  </div>
);

const ActivityItem = ({ gasto, index }) => (
  <div className="activity-item">
    <span className="activity-icon">{getCategoryIcon(gasto.categoria)}</span>
    <div className="activity-info">
      <h4>{gasto.descripcion || gasto.categoria}</h4>
      <p>{gasto.fecha}{gasto.hora ? ` · ${gasto.hora}` : ''}{gasto.metodoPago ? ` · ${gasto.metodoPago}` : ''}</p>
    </div>
    <span className="activity-amount expense">
      −{fmt(parseFloat(gasto.monto))}
    </span>
  </div>
);

const CategoryItem = ({ name, amount, max, idx }) => {
  const pct = max > 0 ? (amount / max) * 100 : 0;
  const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
  return (
    <div className="category-item">
      <div className="category-row">
        <span className="category-dot" style={{ background: color }} />
        <span className="category-name">{name}</span>
        <span className="category-pct">{pct.toFixed(0)}%</span>
        <span className="category-amount">{fmt(amount)}</span>
      </div>
      <div className="category-bar">
        <div className="category-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

/* ─── Dashboard ───────────────────────────────────────────────────────────── */
const BUDGET = 2500;

const Dashboard = ({ setActiveView }) => {
  const { gastos, loading, addGasto } = useGastosContext();
  const toast = useToast();

  // Quick-add expense modal state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [autoTime, setAutoTime] = useState(true);
  const [quickGasto, setQuickGasto] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora: getCurrentTime(),
    monto: '',
    categoria: '',
    subcategoria: '',
    metodoPago: '',
    descripcion: '',
  });

  const resetQuickForm = () => {
    setQuickGasto({
      fecha: new Date().toISOString().split('T')[0],
      hora: getCurrentTime(),
      monto: '',
      categoria: '',
      subcategoria: '',
      metodoPago: '',
      descripcion: '',
    });
    setAutoTime(true);
    setShowQuickAdd(false);
  };

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    const gastoToSubmit = {
      ...quickGasto,
      hora: autoTime ? getCurrentTime() : quickGasto.hora,
    };

    const { isValid, errors } = validateGasto(gastoToSubmit);
    if (!isValid) {
      toast.error(errors[0]);
      return;
    }

    try {
      await addGasto(gastoToSubmit);
      toast.success('✓ Gasto registrado exitosamente');
      resetQuickForm();
    } catch (err) {
      toast.error('Error al guardar el gasto: ' + err.message);
    }
  };

  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const totalGastado  = gastos.reduce((s, g) => s + parseFloat(g.monto || 0), 0);
    const gastosHoy     = gastos.filter(g => g.fecha === today);
    const totalHoy      = gastosHoy.reduce((s, g) => s + parseFloat(g.monto || 0), 0);
    const diasUnicos    = new Set(gastos.map(g => g.fecha)).size;
    const promedioDiario = diasUnicos > 0 ? totalGastado / diasUnicos : 0;
    const budgetPct     = (totalGastado / BUDGET) * 100;

    const porCategoria = gastos.reduce((acc, g) => {
      acc[g.categoria] = (acc[g.categoria] || 0) + parseFloat(g.monto || 0);
      return acc;
    }, {});
    const topCategorias = Object.entries(porCategoria).sort(([, a], [, b]) => b - a).slice(0, 5);
    const ultimosGastos = [...gastos].reverse().slice(0, 6);

    return { totalGastado, totalHoy, gastosHoy, promedioDiario, diasUnicos, budgetPct, topCategorias, ultimosGastos };
  }, [gastos]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <span>Cargando datos…</span>
      </div>
    );
  }

  const { totalGastado, totalHoy, gastosHoy, promedioDiario, diasUnicos, budgetPct, topCategorias, ultimosGastos } = metrics;
  const remainingBudget = BUDGET - totalGastado;

  return (
    <div className="dashboard">

      {/* ── HERO ── */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-left">
          <span className="dashboard-hero-label">Balance total gastado</span>
          <span className={`dashboard-hero-value${totalGastado > BUDGET ? ' negative' : ''}`}>
            {fmt(totalGastado)}
          </span>
          <span className="dashboard-hero-sub">
            {gastos.length} transacciones · {diasUnicos} días activos
          </span>
        </div>
        <div className="dashboard-hero-right">
          <HeroStat
            label="Ingresos"
            value={fmt(BUDGET)}
            colorClass="income"
            badge={{ dir: 'up', text: 'Presupuesto' }}
          />
          <HeroStat
            label="Disponible"
            value={fmt(remainingBudget)}
            colorClass={remainingBudget < 0 ? 'expense' : 'income'}
          />
        </div>
      </div>

      {/* ── SECONDARY METRICS ── */}
      <div className="dashboard-metrics">
        <MetricCard
          accent="var(--accent)"
          label="Gasto hoy"
          value={fmt(totalHoy)}
          footer={`${gastosHoy.length} transacción${gastosHoy.length !== 1 ? 'es' : ''}`}
        />
        <MetricCard
          accent="var(--warning)"
          label="Promedio diario"
          value={fmt(promedioDiario)}
          footer={`en ${diasUnicos} día${diasUnicos !== 1 ? 's' : ''}`}
        />
        <MetricCard
          accent={budgetPct > 100 ? 'var(--danger)' : 'var(--success)'}
          label="Presupuesto mensual"
          value={`${Math.min(budgetPct, 100).toFixed(0)}%`}
          footer={budgetPct > 100 ? `Excedido en ${fmt(totalGastado - BUDGET)}` : `Quedan ${fmt(remainingBudget)}`}
          progress={budgetPct}
        />
      </div>

      {/* ── CONTENT GRID ── */}
      <div className="dashboard-content-grid">

        {/* Activity panel */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3>Actividad reciente</h3>
            <button className="dash-panel-action" onClick={() => setActiveView('gastos')}>
              Ver todo →
            </button>
          </div>
          <div className="dash-panel-body">
            {ultimosGastos.length > 0 ? (
              <div className="activity-list">
                {ultimosGastos.map((gasto, i) => (
                  <ActivityItem key={gasto.id || i} gasto={gasto} index={i} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-state-icon">💸</span>
                <span className="empty-state-title">Sin actividad reciente</span>
                <span className="empty-state-body">Registra tu primer gasto para empezar.</span>
              </div>
            )}
          </div>
        </div>

        {/* Category breakdown panel */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3>Por categoría</h3>
            <button className="dash-panel-action" onClick={() => setActiveView('estadisticas')}>
              Detalle →
            </button>
          </div>
          <div className="dash-panel-body">
            {topCategorias.length > 0 ? (
              <div className="category-list">
                {topCategorias.map(([cat, monto], i) => (
                  <CategoryItem
                    key={cat}
                    name={cat}
                    amount={monto}
                    max={topCategorias[0][1]}
                    idx={i}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-state-icon">📊</span>
                <span className="empty-state-title">Sin datos de categorías</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── FAB (floating action button) ── */}
      <button
        className="dashboard-quick-add"
        onClick={() => {
          resetQuickForm();
          setShowQuickAdd(true);
        }}
        aria-label="Agregar gasto"
      >
        <span className="fab-icon">+</span>
        <span className="fab-label">Agregar Gasto Rápido</span>
      </button>

      {/* ── QUICK ADD MODAL ── */}
      {showQuickAdd && (
        <div className="modal-overlay" onClick={resetQuickForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚡ Gasto Rápido</h2>
              <button onClick={resetQuickForm}>✕</button>
            </div>
            <form onSubmit={handleQuickSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Fecha *</label>
                  <input
                    type="date"
                    value={quickGasto.fecha}
                    onChange={(e) =>
                      setQuickGasto({ ...quickGasto, fecha: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hora</label>
                  <div className="time-field-wrapper">
                    <div className="time-toggle">
                      <button
                        type="button"
                        className={`time-toggle-btn${autoTime ? ' active' : ''}`}
                        onClick={() => {
                          setAutoTime(true);
                          setQuickGasto({ ...quickGasto, hora: getCurrentTime() });
                        }}
                      >
                        🕐 Auto
                      </button>
                      <button
                        type="button"
                        className={`time-toggle-btn${!autoTime ? ' active' : ''}`}
                        onClick={() => setAutoTime(false)}
                      >
                        ✏️ Manual
                      </button>
                    </div>
                    <input
                      type="time"
                      value={autoTime ? getCurrentTime() : quickGasto.hora}
                      onChange={(e) =>
                        setQuickGasto({ ...quickGasto, hora: e.target.value })
                      }
                      disabled={autoTime}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Monto ($) *</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    value={quickGasto.monto}
                    onChange={(e) =>
                      setQuickGasto({ ...quickGasto, monto: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Categoría *</label>
                  <select
                    value={quickGasto.categoria}
                    onChange={(e) =>
                      setQuickGasto({ ...quickGasto, categoria: e.target.value })
                    }
                    required
                  >
                    <option value="">Selecciona...</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {getCategoryIcon(cat)} {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Método de Pago *</label>
                  <select
                    value={quickGasto.metodoPago}
                    onChange={(e) =>
                      setQuickGasto({ ...quickGasto, metodoPago: e.target.value })
                    }
                    required
                  >
                    <option value="">Selecciona...</option>
                    {PAY_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Descripción</label>
                  <input
                    type="text"
                    placeholder="Detalles adicionales"
                    value={quickGasto.descripcion}
                    onChange={(e) =>
                      setQuickGasto({ ...quickGasto, descripcion: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetQuickForm}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  ✓ Guardar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;