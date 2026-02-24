import React, { useMemo, useState, useCallback, useRef } from 'react';
import './estadisticas.css';

const W = 620;
const H = 240;
const PAD = { top: 18, right: 16, bottom: 28, left: 36 };
const IW = W - PAD.left - PAD.right;
const IH = H - PAD.top - PAD.bottom;

const fmtAxis = (n) =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(Math.round(n));
const fmtTip = (n) =>
  `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function smoothPath(pts) {
  if (pts.length < 2) return `M${pts[0].x},${pts[0].y}`;
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const curr = pts[i];
    const next = pts[i + 1];
    const cpx = (curr.x + next.x) / 2;
    d += ` Q${cpx},${curr.y} ${cpx},${(curr.y + next.y) / 2}`;
    d += ` Q${cpx},${next.y} ${next.x},${next.y}`;
  }
  return d;
}

function pickXTicks(mapped, max) {
  if (mapped.length <= 6) return mapped;
  const step = Math.max(1, Math.floor((mapped.length - 1) / 5));
  const ticks = [];
  for (let i = 0; i < mapped.length; i++) {
    if (i === 0 || i === mapped.length - 1 || i % step === 0) {
      if (ticks.length < max) ticks.push(mapped[i]);
    }
  }
  return ticks;
}

export default function TendenciaChart({ points = [], title = 'Tendencia' }) {
  const [hover, setHover] = useState(null);
  const wrapRef = useRef(null);
  const onEnter = useCallback((pt) => setHover(pt), []);
  const onLeave = useCallback(() => setHover(null), []);

  const allZero = points.length > 0 && points.every((p) => !p.usd);
  const empty = !points.length || allZero;

  const { mapped, yTicks, xTicks, linePath, areaPath } = useMemo(() => {
    if (empty) return { mapped: [], yTicks: [], xTicks: [], linePath: '', areaPath: '' };

    const maxVal = Math.max(...points.map((p) => p.usd), 1);
    const count = points.length;

    const mapped = points.map((p, i) => ({
      x: PAD.left + (count > 1 ? (i / (count - 1)) * IW : IW / 2),
      y: PAD.top + IH - (p.usd / maxVal) * IH,
      day: p.day,                 // tooltip (ej: 2026-02-22 o 2026-02)
      label: p.label ?? p.day,    // ✅ eje X (ej: 1..31 / dd/mm / Ene..Dic)
      value: p.usd,
      idx: i,
    }));

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
      label: fmtAxis(maxVal * pct),
      y: PAD.top + IH - pct * IH,
    }));

    const xTicks = pickXTicks(mapped, 6);

    const linePath = smoothPath(mapped);
    const last = mapped[mapped.length - 1];
    const first = mapped[0];
    const areaPath = `${linePath} L${last.x},${PAD.top + IH} L${first.x},${PAD.top + IH} Z`;

    return { mapped, yTicks, xTicks, linePath, areaPath };
  }, [points, empty]);

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
      <h3 className="est-section-title">{title}</h3>

      <div className="tendencia-wrap" ref={wrapRef}>
        <svg viewBox={`0 0 ${W} ${H}`} className="tendencia-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="tc-lg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#67e8f9" />
            </linearGradient>
            <linearGradient id="tc-ag" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(34,211,238,0.18)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0)" />
            </linearGradient>
          </defs>

          {/* 4 horizontal grid lines (skip bottom = 0%) */}
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

          {/* Area fill */}
          <path d={areaPath} fill="url(#tc-ag)" />

          {/* Smooth line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#tc-lg)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover vertical guide */}
          {hover && (
            <line
              x1={hover.x} y1={PAD.top}
              x2={hover.x} y2={PAD.top + IH}
              stroke="rgba(34,211,238,0.15)"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          )}

          {/* Invisible hit areas + visible dot only on hover */}
          {mapped.map((p) => (
            <g key={p.idx}>
              <circle
                cx={p.x} cy={p.y} r="14"
                fill="transparent"
                onMouseEnter={() => onEnter(p)}
                onMouseLeave={onLeave}
              />
              {hover?.idx === p.idx && (
                <>
                  <circle cx={p.x} cy={p.y} r="6" fill="rgba(34,211,238,0.15)" />
                  <circle
                    cx={p.x} cy={p.y} r="3.5"
                    fill="#22d3ee"
                    stroke="#0e1525"
                    strokeWidth="1.5"
                  />
                </>
              )}
            </g>
          ))}

          {/* X-axis labels */}
          {xTicks.map((p) => (
            <text
              key={`x-${p.idx}`}
              x={p.x}
              y={H - 8}
              textAnchor="middle"
              fill="rgba(255,255,255,0.22)"
              fontSize="9"
              fontFamily="inherit"
            >
              {p.label}
            </text>
          ))}
        </svg>

        {/* Tooltip */}
        {hover && (
          <div
            className="tendencia-tooltip"
            style={{
              left: `${(hover.x / W) * 100}%`,
              top: `${Math.max(0, ((hover.y - 12) / H) * 100)}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <span className="tendencia-tooltip__day">{hover.day}</span>
            <span className="tendencia-tooltip__value">{fmtTip(hover.value)}</span>
          </div>
        )}
      </div>
    </div>
  );
}