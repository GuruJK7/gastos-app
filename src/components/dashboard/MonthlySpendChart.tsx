import React, { useRef, useState, useCallback, useMemo } from 'react';

interface Point {
  day: number;
  usd: number;
}

interface Props {
  points: Point[];
  monthLabel?: string;
}

const W = 600;
const H = 200;
const PAD = { top: 16, right: 16, bottom: 24, left: 16 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

export default function MonthlySpendChart({ points, monthLabel }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{ x: number; y: number; point: Point } | null>(null);

  const sorted = useMemo(() => [...points].sort((a, b) => a.day - b.day), [points]);

  const maxUsd = useMemo(() => Math.max(...sorted.map((p) => p.usd), 1), [sorted]);
  const minDay = sorted.length ? sorted[0].day : 1;
  const maxDay = sorted.length ? sorted[sorted.length - 1].day : 30;
  const daySpan = Math.max(maxDay - minDay, 1);

  const toX = useCallback((day: number) => PAD.left + ((day - minDay) / daySpan) * INNER_W, [minDay, daySpan]);
  const toY = useCallback((usd: number) => PAD.top + INNER_H - (usd / maxUsd) * INNER_H, [maxUsd]);

  const pathD = useMemo(() => {
    if (!sorted.length) return '';
    return sorted.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.day)},${toY(p.usd)}`).join(' ');
  }, [sorted, toX, toY]);

  const dots = useMemo(
    () => sorted.filter((_, i) => i === 0 || i === sorted.length - 1 || (i + 1) % 5 === 0),
    [sorted],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!sorted.length || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * W;
      let nearest = sorted[0];
      let bestDist = Infinity;
      for (const p of sorted) {
        const d = Math.abs(toX(p.day) - mouseX);
        if (d < bestDist) { bestDist = d; nearest = p; }
      }
      setHover({ x: toX(nearest.day), y: toY(nearest.usd), point: nearest });
    },
    [sorted, toX, toY],
  );

  const handleMouseLeave = useCallback(() => setHover(null), []);

  if (!sorted.length) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
        {monthLabel && <h3 style={{ margin: '0 0 8px', fontSize: 14 }}>{monthLabel}</h3>}
        Sin datos para graficar.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: W }}>
      {monthLabel && (
        <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
          {monthLabel}
        </h3>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* grid line at max */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left + INNER_W} y2={PAD.top} stroke="#334155" strokeDasharray="4 4" />
        {/* grid line at zero */}
        <line x1={PAD.left} y1={PAD.top + INNER_H} x2={PAD.left + INNER_W} y2={PAD.top + INNER_H} stroke="#334155" />

        {/* area fill */}
        {pathD && (
          <path
            d={`${pathD} L${toX(sorted[sorted.length - 1].day)},${PAD.top + INNER_H} L${toX(sorted[0].day)},${PAD.top + INNER_H} Z`}
            fill="rgba(99,102,241,0.12)"
          />
        )}

        {/* line */}
        <path d={pathD} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

        {/* dots every 5th + first/last */}
        {dots.map((p) => (
          <circle key={p.day} cx={toX(p.day)} cy={toY(p.usd)} r={3.5} fill="#6366f1" stroke="#1e1b4b" strokeWidth={1.5} />
        ))}

        {/* hover crosshair */}
        {hover && (
          <>
            <line x1={hover.x} y1={PAD.top} x2={hover.x} y2={PAD.top + INNER_H} stroke="#6366f1" strokeWidth={1} opacity={0.4} />
            <circle cx={hover.x} cy={hover.y} r={5} fill="#a5b4fc" stroke="#6366f1" strokeWidth={2} />
          </>
        )}
      </svg>

      {/* tooltip */}
      {hover && (
        <div
          style={{
            position: 'absolute',
            left: `${(hover.x / W) * 100}%`,
            top: `${(hover.y / H) * 100}%`,
            transform: 'translate(-50%, -140%)',
            background: '#1e293b',
            color: '#f1f5f9',
            fontSize: 12,
            padding: '4px 8px',
            borderRadius: 6,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            border: '1px solid #334155',
            boxShadow: '0 2px 8px rgba(0,0,0,.4)',
          }}
        >
          Day {hover.point.day} — ${hover.point.usd.toFixed(2)}
        </div>
      )}
    </div>
  );
}
