import React from 'react';
import './estadisticas.css';

const fmt = (n) => `$${(Number(n) || 0).toFixed(2)}`;
const pct = (n) => `${(Number(n) || 0).toFixed(1)}%`;

const ROWS = [
  { key: 'ingresosUsd', label: 'Ingresos' },
  { key: 'gastosUsd', label: 'Gastos' },
  { key: 'balanceUsd', label: 'Balance Neto' },
];

function valClass(val, key) {
  if (key === 'gastosUsd') return 'resumen__row-value resumen__row-value--expense';
  return val >= 0
    ? 'resumen__row-value resumen__row-value--positive'
    : 'resumen__row-value resumen__row-value--negative';
}

export default function ResumenCard({ summary }) {
  const {
    balanceUsd = 0,
    ahorroPct = 0,
  } = summary || {};

  const positive = balanceUsd >= 0;

  return (
    <div className="resumen">
      {/* Header */}
      <div className="resumen__header">
        <div>
          <h3 className="resumen__title">Resumen</h3>
          <p className="resumen__subtitle">Totales del período</p>
        </div>
        <span className={`resumen__pill ${ahorroPct >= 0 ? 'resumen__pill--positive' : 'resumen__pill--negative'}`}>
          {ahorroPct >= 0 ? '↑' : '↓'} {pct(Math.abs(ahorroPct))}
        </span>
      </div>

      {/* Big balance number */}
      <div className="resumen__balance-section">
        <p className="resumen__balance-label">Balance Neto</p>
        <p className={`resumen__balance-value ${positive ? 'resumen__balance-value--positive' : 'resumen__balance-value--negative'}`}>
          {fmt(balanceUsd)}
        </p>
      </div>

      {/* Divider */}
      <hr className="resumen__divider" />

      {/* Detail rows */}
      <div className="resumen__rows">
        {ROWS.map(({ key, label }) => {
          const val = summary?.[key] ?? 0;
          return (
            <div key={key} className="resumen__row">
              <span className="resumen__row-label">{label}</span>
              <span className={valClass(val, key)}>
                {fmt(val)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
