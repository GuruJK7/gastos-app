// src/features/gastos/components/ExpenseList.jsx
// ─── Expense List with Delete ────────────────────────────────────────────
import React from 'react';

const CATEGORY_ICONS = {
  Comida: '🍔', Supermercado: '🛒', Transporte: '🚗',
  Entretenimiento: '🎬', Farmacia: '💊', Servicios: '🔧',
  Educación: '📚', Otro: '📦',
};

/**
 * @param {{ gastos: import('../types').Gasto[], onDelete: (id: string) => void, loading: boolean }} props
 */
export default function ExpenseList({ gastos, onDelete, loading }) {
  if (loading) {
    return (
      <div className="expense-list glass">
        <h3 className="expense-list__title">Historial de Gastos</h3>
        <p className="expense-list__empty">Cargando gastos…</p>
      </div>
    );
  }

  return (
    <div className="expense-list glass">
      <div className="expense-list__header">
        <h3 className="expense-list__title">Historial de Gastos</h3>
        <span className="expense-list__count">{gastos.length} registro{gastos.length !== 1 ? 's' : ''}</span>
      </div>

      {gastos.length === 0 ? (
        <p className="expense-list__empty">No hay gastos registrados aún.</p>
      ) : (
        <ul className="expense-list__items">
          {gastos.map((g) => (
            <li key={g.id} className="expense-list__item">
              <span className="expense-list__icon">
                {CATEGORY_ICONS[g.category] || '📦'}
              </span>
              <div className="expense-list__info">
                <span className="expense-list__category">{g.category}</span>
                <span className="expense-list__meta">
                  {g.paymentMethod} · {g.date}
                  {g.note ? ` · ${g.note}` : ''}
                </span>
              </div>
              <span className="expense-list__amount">
                −${(g.amount ?? 0).toFixed(2)}
              </span>
              <button
                type="button"
                className="expense-list__delete"
                onClick={() => onDelete(g.id)}
                title="Eliminar gasto"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
