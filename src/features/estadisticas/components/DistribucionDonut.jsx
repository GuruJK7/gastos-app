import React, { useMemo, useState } from 'react';
import './estadisticas.css';

const COLORS = [
  '#22d3ee', '#a78bfa', '#f472b6', '#fb923c',
  '#34d399', '#facc15', '#60a5fa', '#f87171',
];

const SIZE = 180;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 70;
const SW = 16;
const MAX_ITEMS = 6;
const CIRC = 2 * Math.PI * R;

const fmt = (n) => `$${(Number(n) || 0).toFixed(2)}`;

export default function DistribucionDonut({ data = [] }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  const { segments, legendItems, total } = useMemo(() => {
    const sorted = [...data].filter((d) => d.usd > 0).sort((a, b) => b.usd - a.usd);
    const total = sorted.reduce((s, d) => s + d.usd, 0);
    if (!sorted.length || total === 0) return { segments: [], legendItems: [], total: 0 };

    let items;
    if (sorted.length <= MAX_ITEMS) {
      items = sorted;
    } else {
      const visible = sorted.slice(0, MAX_ITEMS - 1);
      const rest = sorted.slice(MAX_ITEMS - 1);
      const otrosUsd = rest.reduce((s, r) => s + r.usd, 0);
      items = [...visible, { category: 'Otros', usd: otrosUsd }];
    }

    let offset = 0;
    const GAP = 0.01;
    const totalGap = GAP * items.length;
    const usable = 1 - totalGap;

    const segments = items.map((d, i) => {
      const frac = (d.usd / total) * usable;
      const dashLen = frac * CIRC;
      const gapLen = CIRC - dashLen;
      const seg = {
        category: d.category,
        usd: d.usd,
        pct: (d.usd / total) * 100,
        color: COLORS[i % COLORS.length],
        dasharray: `${dashLen} ${gapLen}`,
        dashoffset: -offset * CIRC,
      };
      offset += frac + GAP;
      return seg;
    });

    return { segments, legendItems: segments, total };
  }, [data]);

  if (!segments.length) {
    return (
      <div>
        <h3 className="est-section-title">Distribución</h3>
        <div className="est-empty" style={{ padding: '4rem 0' }}>
          <p>Sin gastos por categoría</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="est-section-title">Distribución</h3>

      <div className="donut__layout">
        {/* Donut SVG */}
        <div className="donut__chart-wrap" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={SW}
            />
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx={CX} cy={CY} r={R}
                fill="none"
                stroke={seg.color}
                strokeWidth={hoverIdx === i ? SW + 3 : SW}
                strokeDasharray={seg.dasharray}
                strokeDashoffset={seg.dashoffset}
                strokeLinecap="butt"
                opacity={hoverIdx != null && hoverIdx !== i ? 0.25 : 1}
                transform={`rotate(-90 ${CX} ${CY})`}
                style={{ transition: 'opacity 0.2s, stroke-width 0.2s' }}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
              />
            ))}
          </svg>

          <div className="donut__center">
            {hoverIdx != null && segments[hoverIdx] ? (
              <>
                <span className="donut__center-pct">
                  {segments[hoverIdx].pct.toFixed(1)}%
                </span>
                <span className="donut__center-cat">
                  {segments[hoverIdx].category}
                </span>
              </>
            ) : (
              <>
                <span className="donut__center-label">Total</span>
                <span className="donut__center-total">{fmt(total)}</span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <ul className="donut__legend">
          {legendItems.map((item, i) => {
            const dimmed = hoverIdx != null && hoverIdx !== i;
            return (
              <li
                key={i}
                className={`donut__legend-item${dimmed ? ' donut__legend-item--dimmed' : ''}`}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
              >
                <span className="donut__legend-dot" style={{ backgroundColor: item.color }} />
                <span className="donut__legend-name">{item.category}</span>
                <span className="donut__legend-value">{fmt(item.usd)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
