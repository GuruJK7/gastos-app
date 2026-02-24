import React from 'react';
import './CategoryDonut.css';

export default function CategoryDonut({ categories = [], loading }) {
  if (loading) {
    return (
      <div className="cat-donut glass">
        <div className="cat-donut__header">
          <h3 className="cat-donut__title">Gastos por Categoría</h3>
        </div>
        <p className="cat-donut__empty">Cargando categorías…</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="cat-donut glass">
        <div className="cat-donut__header">
          <h3 className="cat-donut__title">Gastos por Categoría</h3>
        </div>
        <p className="cat-donut__empty">Sin datos aún.</p>
      </div>
    );
  }

  const total = categories.reduce((s, c) => s + c.amount, 0);
  const count = categories.length;

  /* Build conic-gradient stops with per-segment gradients and tiny gaps */
  let acc2 = 0;
  const gapStops = categories.flatMap((cat, i) => {
    const start = acc2;
    const pct = (cat.amount / total) * 100;
    acc2 += pct;
    const gapSize = 1.2;
    const mid = start + pct * 0.5;
    const parts = [];
    if (i > 0) {
      parts.push(`rgba(0,0,0,0.35) ${start}%, rgba(0,0,0,0.35) ${start + gapSize}%`);
      parts.push(`${cat.color} ${start + gapSize}%, ${cat.colorEnd} ${mid}%, ${cat.color} ${acc2}%`);
    } else {
      parts.push(`${cat.color} ${start}%, ${cat.colorEnd} ${mid}%, ${cat.color} ${acc2}%`);
    }
    return parts;
  }).join(', ');

  const donutStyle = { background: `conic-gradient(${gapStops})` };
  const shadowColor = categories[0].color;

  return (
    <div className="cat-donut glass">
      {/* Header */}
      <div className="cat-donut__header">
        <h3 className="cat-donut__title">Gastos por Categoría</h3>
        <button className="cat-donut__filter">
          Este mes <span className="cat-donut__chevron">⌄</span>
        </button>
      </div>

      {/* Body: info left + donut right */}
      <div className="cat-donut__body">
        <div className="cat-donut__info">
          <span className="cat-donut__total">${total.toFixed(2)}</span>
          <span className="cat-donut__label">Total gastado</span>

          <ul className="cat-donut__legend">
            {categories.map((cat) => (
              <li key={cat.name} className="cat-donut__legend-item">
                <span
                  className="cat-donut__dot"
                  style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.colorEnd})` }}
                />
                <span className="cat-donut__cat-name">{cat.name}</span>
                <span className="cat-donut__cat-amount">
                  ${cat.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="cat-donut__ring-wrap" style={{ '--ring-glow': shadowColor }}>
          <div className="cat-donut__ring" style={donutStyle}>
            <div className="cat-donut__hole">
              <span className="cat-donut__hole-value">{count}</span>
              <span className="cat-donut__hole-label">Categorías</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
