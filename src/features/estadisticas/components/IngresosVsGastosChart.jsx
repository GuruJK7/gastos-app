import React, { useMemo, useState, useCallback } from 'react';
import './estadisticas.css';

const W = 620;
const H = 240;
const PAD = { top: 18, right: 16, bottom: 28, left: 44 };
const IW = W - PAD.left - PAD.right;
const IH = H - PAD.top - PAD.bottom;

const fmtAxis = (n) =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(Math.round(n));
const fmtTip = (n) =>
  `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function pickXTicks(items, max) {
  if (items.length <= max) return items.map((_, i) => i);
  const step = Math.max(1, Math.floor((items.length - 1) / (max - 1)));
  const ticks = [];
  for (let i = 0; i < items.length; i++) {
    if (i === 0 || i === items.length - 1 || i % step === 0) {
      if (ticks.length < max) ticks.push(i);
    }
  }
  return ticks;
}

export default function IngresosVsGastosChart({ data = [], title = 'Ingresos vs Gastos' }) {
  const [hover, setHover] = useState(null);
  const onEnter = useCallback((idx) => setHover(idx), []);
  const onLeave = useCallback(() => setHover(null), []);

  const allZero = data.length > 0 && data.every((d) => !d.ingresos && !d.gastos);
  const empty = !data.length || allZero;

  const { bars, yTicks, xTickIdxs } = useMemo(() => {
    if (empty) return { bars: [], yTicks: [], xTickIdxs: [], maxVal: 0 };

    const maxVal = Math.max(...data.map((d) => Math.max(d.ingresos, d.gastos)), 1);
    const count = data.length;

    // Each bucket gets a slot; inside the slot we draw two bars side-by-side
    const slotW = IW / count;
    const barW = Math.max(2, Math.min(12, slotW * 0.35));
    const gap = Math.max(1, barW * 0.15);

    const bars = data.map((d, i) => {
      const cx = PAD.left + slotW * i + slotW / 2;
      const iH = (d.ingresos / maxVal) * IH;
      const gH = (d.gastos / maxVal) * IH;
      return {
        idx: i,
        label: d.label,
        key: d.key,
        ingresos: d.ingresos,
        gastos: d.gastos,
        // ingreso bar (left)
        ix: cx - gap / 2 - barW,
        iy: PAD.top + IH - iH,
        iw: barW,
        ih: iH,
        // gasto bar (right)
        gx: cx + gap / 2,
        gy: PAD.top + IH - gH,
        gw: barW,
        gh: gH,
        // hit area center
        cx,
      };
    });

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
      label: fmtAxis(maxVal * pct),
      y: PAD.top + IH - pct * IH,
    }));

    const xTickIdxs = pickXTicks(data, 8);

    return { bars, yTicks, xTickIdxs, maxVal };
  }, [data, empty]);

  if (empty) {
    return (
      <div>
        <h3 className="est-section-title">{title}</h3>
        <div className="est-empty" style={{ height: H }}>
          <p>Sin datos en este período</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="ivg-header">
        <h3 className="est-section-title">{title}</h3>
        <div className="ivg-legend">
          <span className="ivg-legend__item">
            <span className="ivg-legend__dot ivg-legend__dot--ingresos" />
            Ingresos
          </span>
          <span className="ivg-legend__item">
            <span className="ivg-legend__dot ivg-legend__dot--gastos" />
            Gastos
          </span>
        </div>
      </div>

      <div className="tendencia-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} className="tendencia-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="ivg-ig" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="ivg-gg" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#f87171" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#fb923c" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.slice(1).map((t, i) => (
            <line
              key={i}
              x1={PAD.left} y1={t.y}
              x2={W - PAD.right} y2={t.y}
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="3,4"
            />
          ))}

          {/* Y-axis labels */}
          {yTicks.map((t, i) => (
            <text
              key={`y-${i}`}
              x={PAD.left - 6}
              y={t.y + 3}
              textAnchor="end"
              fill="rgba(255,255,255,0.22)"
              fontSize="9"
              fontFamily="inherit"
            >
              {t.label}
            </text>
          ))}

          {/* Bars */}
          {bars.map((b) => (
            <g key={b.idx}>
              {/* Ingreso bar */}
              {b.ih > 0 && (
                <rect
                  x={b.ix} y={b.iy}
                  width={b.iw} height={b.ih}
                  rx={Math.min(2, b.iw / 2)}
                  fill="url(#ivg-ig)"
                  opacity={hover != null && hover !== b.idx ? 0.25 : 1}
                  style={{ transition: 'opacity 0.15s' }}
                />
              )}
              {/* Gasto bar */}
              {b.gh > 0 && (
                <rect
                  x={b.gx} y={b.gy}
                  width={b.gw} height={b.gh}
                  rx={Math.min(2, b.gw / 2)}
                  fill="url(#ivg-gg)"
                  opacity={hover != null && hover !== b.idx ? 0.25 : 1}
                  style={{ transition: 'opacity 0.15s' }}
                />
              )}
              {/* Invisible hit area */}
              <rect
                x={b.cx - (IW / bars.length) / 2}
                y={PAD.top}
                width={IW / bars.length}
                height={IH}
                fill="transparent"
                onMouseEnter={() => onEnter(b.idx)}
                onMouseLeave={onLeave}
              />
            </g>
          ))}

          {/* Hover vertical guide */}
          {hover != null && bars[hover] && (
            <line
              x1={bars[hover].cx} y1={PAD.top}
              x2={bars[hover].cx} y2={PAD.top + IH}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          )}

          {/* X-axis labels */}
          {xTickIdxs.map((i) => (
            <text
              key={`x-${i}`}
              x={bars[i].cx}
              y={H - 8}
              textAnchor="middle"
              fill="rgba(255,255,255,0.22)"
              fontSize="9"
              fontFamily="inherit"
            >
              {bars[i].label}
            </text>
          ))}
        </svg>

        {/* Tooltip */}
        {hover != null && bars[hover] && (
          <div
            className="tendencia-tooltip"
            style={{
              left: `${(bars[hover].cx / W) * 100}%`,
              top: `${Math.max(0, ((Math.min(bars[hover].iy, bars[hover].gy) - 12) / H) * 100)}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <span className="tendencia-tooltip__day">{bars[hover].key}</span>
            <span className="ivg-tooltip__row ivg-tooltip__row--ingresos">
              Ingresos: {fmtTip(bars[hover].ingresos)}
            </span>
            <span className="ivg-tooltip__row ivg-tooltip__row--gastos">
              Gastos: {fmtTip(bars[hover].gastos)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
