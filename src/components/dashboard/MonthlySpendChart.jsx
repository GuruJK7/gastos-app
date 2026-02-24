// src/components/dashboard/MonthlySpendChart.jsx
// ─── Monthly Spending SVG Line Chart (USD-normalized) ────────────────────
import React, { useMemo, useState, useCallback } from 'react';
import './MonthlySpendChart.css';

const CHART_W = 540;
const CHART_H = 160;
const PAD = { top: 24, right: 16, bottom: 28, left: 44 };
const INNER_W = CHART_W - PAD.left - PAD.right;
const INNER_H = CHART_H - PAD.top - PAD.bottom;

const fmtUsd = (n) =>
  `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * @param {{ gastos: Array<{ amount: number, amountUsd?: number, date: string }>, loading: boolean }} props
 */
export default function MonthlySpendChart({ gastos = [], loading }) {
  const [hover, setHover] = useState(null);

  const { points, total, min, max } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;

    // Aggregate by day using amountUsd (fallback to amount)
    const daily = new Array(daysInMonth).fill(0);
    for (const g of gastos) {
      if (g.date && g.date.startsWith(prefix)) {
        const day = parseInt(g.date.slice(8, 10), 10);
        if (day >= 1 && day <= daysInMonth) {
          daily[day - 1] += g.amountUsd ?? g.amount;
        }
      }
    }

    const today = now.getDate();
    const vals = daily.slice(0, today);
    const total = vals.reduce((s, v) => s + v, 0);
    const maxVal = Math.max(...vals, 1);
    const minVal = Math.min(...vals);

    const pts = vals.map((v, i) => ({
      x: PAD.left + (vals.length > 1 ? (i / (vals.length - 1)) * INNER_W : INNER_W / 2),
      y: PAD.top + INNER_H - (v / maxVal) * INNER_H,
      day: i + 1,
      value: v,
    }));

    return { points: pts, total, min: minVal, max: maxVal };
  }, [gastos]);

  const onDotEnter = useCallback((pt) => setHover(pt), []);
  const onDotLeave = useCallback(() => setHover(null), []);

  if (loading) {
    return (
      <div className="month-chart glass">
        <div className="month-chart__header">
          <h3 className="month-chart__title">Gastos Diarios (USD)</h3>
        </div>
        <p className="month-chart__empty">Cargando gráfico…</p>
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div className="month-chart glass">
        <div className="month-chart__header">
          <h3 className="month-chart__title">Gastos Diarios (USD)</h3>
        </div>
        <p className="month-chart__empty">Sin gastos este mes.</p>
      </div>
    );
  }

  // SVG paths
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${PAD.top + INNER_H} L${points[0].x},${PAD.top + INNER_H} Z`;

  // Y-axis ticks
  const yTicks = [0, 0.33, 0.66, 1].map((pct) => ({
    value: Math.round(max * pct),
    y: PAD.top + INNER_H - pct * INNER_H,
  }));

  return (
    <div className="month-chart glass">
      <div className="month-chart__header">
        <h3 className="month-chart__title">Gastos Diarios (USD)</h3>
        <div className="month-chart__stats">
          <span className="month-chart__stat">Total <strong>{fmtUsd(total)}</strong></span>
          <span className="month-chart__stat-sep">·</span>
          <span className="month-chart__stat">Máx <strong>{fmtUsd(max)}</strong></span>
          <span className="month-chart__stat-sep">·</span>
          <span className="month-chart__stat">Mín <strong>{fmtUsd(min)}</strong></span>
        </div>
      </div>

      <div className="month-chart__wrap">
        <svg
          className="month-chart__svg"
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(34,211,238,0.18)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0.01)" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((t) => (
            <line
              key={t.value}
              x1={PAD.left} y1={t.y}
              x2={CHART_W - PAD.right} y2={t.y}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="3,4"
            />
          ))}

          {/* Y-axis labels */}
          {yTicks.map((t) => (
            <text
              key={`lbl-${t.value}`}
              x={PAD.left - 8}
              y={t.y + 3}
              textAnchor="end"
              fill="rgba(255,255,255,0.3)"
              fontSize="9"
              fontFamily="inherit"
            >
              {fmtUsd(t.value)}
            </text>
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#areaGrad)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots with hover hit areas */}
          {points.map((p) => (
            <g key={p.day}>
              {/* Invisible wider hit area */}
              <circle
                cx={p.x} cy={p.y} r="10"
                fill="transparent"
                onMouseEnter={() => onDotEnter(p)}
                onMouseLeave={onDotLeave}
              />
              <circle
                cx={p.x} cy={p.y} r="3"
                fill={hover?.day === p.day ? '#22d3ee' : '#0f1729'}
                stroke="#22d3ee"
                strokeWidth="1.5"
                style={{ pointerEvents: 'none', transition: 'fill 0.15s' }}
              />
            </g>
          ))}

          {/* X-axis day labels */}
          {points
            .filter((p) => p.day === 1 || p.day % 5 === 0 || p.day === points.length)
            .map((p) => (
              <text
                key={`x-${p.day}`}
                x={p.x}
                y={CHART_H - 6}
                textAnchor="middle"
                fill="rgba(255,255,255,0.3)"
                fontSize="9"
                fontFamily="inherit"
              >
                {p.day}
              </text>
            ))}
        </svg>

        {/* Tooltip */}
        {hover && (
          <div
            className="month-chart__tooltip"
            style={{
              left: `${(hover.x / CHART_W) * 100}%`,
              top: `${(hover.y / CHART_H) * 100}%`,
            }}
          >
            <span className="month-chart__tooltip-day">Día {hover.day}</span>
            <span className="month-chart__tooltip-val">{fmtUsd(hover.value)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
