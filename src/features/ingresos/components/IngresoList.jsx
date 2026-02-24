// src/features/ingresos/components/IngresoList.jsx
// ─── Ingreso List with Delete ────────────────────────────────────────────
import React from 'react';

const CATEGORY_ICONS = {
  Salario: '💼', Freelance: '💻', Inversión: '📈',
  Regalo: '🎁', Reembolso: '🔄', Otro: '💰',
};

/**
 * @param {{ ingresos: import('../types').Ingreso[], onDelete: (id: string) => void, onEdit: (ingreso: import('../types').Ingreso) => void, loading: boolean }} props
 */
export default function IngresoList({ ingresos, onDelete, onEdit, loading }) {
  if (loading) {
    return (
      <div className="expense-list glass">
        <h3 className="expense-list__title">Historial de Ingresos</h3>
        <p className="expense-list__empty">Cargando ingresos…</p>
      </div>
    );
  }

  return (
    <div className="expense-list glass">
      <div className="expense-list__header">
        <h3 className="expense-list__title">Historial de Ingresos</h3>
        <span className="expense-list__count">{ingresos.length} registro{ingresos.length !== 1 ? 's' : ''}</span>
      </div>

      {ingresos.length === 0 ? (
        <p className="expense-list__empty">No hay ingresos registrados aún.</p>
      ) : (
        <ul className="expense-list__items">
          {ingresos.map((i) => (
            <li key={i.id} className="expense-list__item">
              <span className="expense-list__icon">
                {CATEGORY_ICONS[i.categoria] || '💰'}
              </span>
              <div className="expense-list__info">
                <span className="expense-list__category">{i.categoria || 'Ingreso'}</span>
                <span className="expense-list__meta">
                  {i.fecha}
                  {i.nota ? ` · ${i.nota}` : ''}
                </span>
              </div>
              <span className="expense-list__amount" style={{ color: '#4ade80' }}>
                +${(i.monto ?? 0).toFixed(2)}
              </span>
              <button
                type="button"
                className="expense-list__delete"
                onClick={() => onEdit(i)}
                title="Editar ingreso"
                style={{ marginRight: '-0.25rem' }}
              >
                ✎
              </button>
              <button
                type="button"
                className="expense-list__delete"
                onClick={() => onDelete(i.id)}
                title="Eliminar ingreso"
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
