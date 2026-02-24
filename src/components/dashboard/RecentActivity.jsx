import React from 'react';
import './RecentActivity.css';

export default function RecentActivity({ transactions = [], loading }) {
  return (
    <div className="recent-activity glass">
      {/* Header */}
      <div className="recent-activity__header">
        <h3 className="recent-activity__title">Actividad Reciente</h3>
        <button className="recent-activity__btn">
          Ver todo <span className="recent-activity__arrow">→</span>
        </button>
      </div>

      {/* Transaction list */}
      {loading ? (
        <p className="recent-activity__empty">Cargando actividad…</p>
      ) : transactions.length === 0 ? (
        <p className="recent-activity__empty">Sin gastos registrados aún.</p>
      ) : (
        <ul className="recent-activity__list">
          {transactions.map((tx) => (
            <li key={tx.id} className="recent-activity__item">
              <div className="recent-activity__icon">{tx.icon}</div>
              <div className="recent-activity__info">
                <span className="recent-activity__category">{tx.category}</span>
                <span className="recent-activity__meta">
                  <span className="recent-activity__method">{tx.method}</span>
                  <span className="recent-activity__sep">·</span>
                  <span className="recent-activity__datetime">{tx.datetime}</span>
                </span>
              </div>
              <span className="recent-activity__amount">
                −${Math.abs(tx.amount).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
