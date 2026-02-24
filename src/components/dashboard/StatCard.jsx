import React, { useId } from 'react';
import './StatCard.css';

/**
 * Reusable glass stat card — premium fintech style.
 *
 * @param {string}    title       — e.g. "Balance Total Gastado"
 * @param {string}    value       — e.g. "$450.00"
 * @param {string}   [subtitle]   — e.g. "2 transacciones · 1 días activos"
 * @param {object}   [trend]      — { value: "+12%", positive: true }
 * @param {React.ReactNode} [rightSlot] — custom element (badge, icon, etc.)
 * @param {number[]} [sparkline]  — array of 7–12 values for mini sparkline
 * @param {function} [onEdit]     — callback function for edit button
 * @param {function} [onClick]    — callback when card is clicked (navigable)
 */
export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  rightSlot,
  sparkline,
  onEdit,
  onClick,
}) {
  return (
    <div
      className={`stat-card glass${onClick ? ' stat-card--clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {/* Subtle top-left highlight overlay */}
      <div className="stat-card__highlight" />
      {/* Right-side gradient fade */}
      <div className="stat-card__fade" />

      <div className="stat-card__body">
        {/* Left content */}
        <div className="stat-card__left">
          <span className="stat-card__title">
            {title}
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                style={{
                  marginLeft: '0.375rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-muted)',
                  fontSize: '0.6875rem',
                  cursor: 'pointer',
                  padding: '0.125rem 0.3rem',
                  lineHeight: 1,
                  verticalAlign: 'middle',
                  transition: 'color 0.15s, background 0.15s',
                }}
                title="Editar"
              >
                ✎
              </button>
            )}
          </span>
          <span className="stat-card__value">{value}</span>
          {subtitle && <span className="stat-card__subtitle">{subtitle}</span>}
          {trend && (
            <span
              className={`stat-card__trend ${
                trend.positive ? 'stat-card__trend--up' : 'stat-card__trend--down'
              }`}
            >
              {trend.positive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>

        {/* Right slot: custom element OR sparkline */}
        <div className="stat-card__right">
          {rightSlot || (sparkline && <Sparkline data={sparkline} />)}
        </div>
      </div>
    </div>
  );
}

/** Tiny animated SVG sparkline — no chart library needed */
function Sparkline({ data }) {
  const uid = useId();

  if (!data || data.length < 2) return null;

  const w = 88;
  const h = 40;
  const pad = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - pad * 2) - pad;
      return `${x},${y}`;
    })
    .join(' ');

  /* Approximate total polyline length for stroke animation */
  const pathLength = data.reduce((sum, v, i) => {
    if (i === 0) return 0;
    const dx = w / (data.length - 1);
    const dy =
      ((data[i] - data[i - 1]) / range) * (h - pad * 2);
    return sum + Math.sqrt(dx * dx + dy * dy);
  }, 0);

  const gradId = `sf-${uid}`;
  const glowId = `sg-${uid}`;

  return (
    <svg
      className="stat-card__sparkline"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Fill area */}
      <polygon
        className="stat-card__spark-area"
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#${gradId})`}
      />
      {/* Glow line (behind) */}
      <polyline
        points={points}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.25"
        filter={`url(#${glowId})`}
      />
      {/* Main line — draw-on animation */}
      <polyline
        className="stat-card__spark-line"
        points={points}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLength}
        strokeDashoffset={pathLength}
        style={{ '--spark-len': pathLength }}
      />
      {/* End dot */}
      {(() => {
        const last = data[data.length - 1];
        const cx = w;
        const cy = h - ((last - min) / range) * (h - pad * 2) - pad;
        return (
          <circle
            className="stat-card__spark-dot"
            cx={cx}
            cy={cy}
            r="2.5"
            fill="var(--accent)"
          />
        );
      })()}
    </svg>
  );
}
