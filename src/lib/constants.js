// src/lib/constants.js
// Design system constants — single source of truth for JS-side tokens.
// CSS variables in index.css are the runtime authority;
// this file mirrors them for component logic (inline styles, chart colors, etc.)

// ── Spacing scale (4px grid) ──
// Use these values in style props and layout calculations.
// In CSS, use rem values directly (e.g. padding: 1rem).
export const SPACING = {
  xs:   '0.25rem',  //  4px
  sm:   '0.5rem',   //  8px
  md:   '0.75rem',  // 12px
  lg:   '1rem',     // 16px
  xl:   '1.25rem',  // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '2rem',    // 32px
  '4xl': '2.5rem',  // 40px
  '5xl': '3rem',    // 48px
  '6xl': '4rem',    // 64px
};

// ── Color palette (mirrors CSS vars) ──
export const COLORS = {
  bg: {
    base:     '#09090b',
    surface:  '#111113',
    elevated: '#1a1a1f',
    panel:    'rgba(255, 255, 255, 0.03)',
  },
  text: {
    primary:   '#fafafa',
    secondary: '#a1a1aa',
    muted:     '#52525b',
    inverse:   '#09090b',
  },
  accent: {
    DEFAULT: '#22d3ee',
    50:      '#ecfeff',
    200:     '#a5f3fc',
    400:     '#22d3ee',
    500:     '#06b6d4',
    600:     '#0891b2',
    muted:   'rgba(34, 211, 238, 0.12)',
  },
  success:     '#4ade80',
  successMuted:'rgba(74, 222, 128, 0.12)',
  danger:      '#f87171',
  dangerMuted: 'rgba(248, 113, 113, 0.12)',
  warning:     '#fbbf24',
  warningMuted:'rgba(251, 191, 36, 0.12)',
  info:        '#60a5fa',
  infoMuted:   'rgba(96, 165, 250, 0.12)',
};

// ── Chart colors (ordered for Recharts pie/bar fills) ──
export const CHART_COLORS = [
  '#22d3ee', // cyan
  '#a78bfa', // violet
  '#4ade80', // green
  '#fbbf24', // amber
  '#f87171', // red
  '#60a5fa', // blue
  '#f472b6', // pink
  '#34d399', // emerald
];

// ── Border radii ──
export const RADII = {
  xs:   '0.25rem',
  sm:   '0.375rem',
  md:   '0.5rem',
  lg:   '0.75rem',
  xl:   '1rem',
  '2xl':'1.25rem',
};

// ── Z-index layers ──
export const Z_INDEX = {
  sidebar: 100,
  header:  200,
  modal:   500,
  toast:   9999,
};

// ── Layout ──
export const LAYOUT = {
  sidebarWidth:     240,
  sidebarCollapsed:  64,
  headerHeight:      56,
  maxContentWidth: 1280,
  cardPadding:    SPACING['2xl'],  // 24px default card padding
  sectionGap:     SPACING['3xl'],  // 32px between dashboard sections
};

// ── Currency ──
/** @type {readonly ['USD', 'UYU']} */
export const SUPPORTED_CURRENCIES = /** @type {const} */ (['USD', 'UYU']);

/** Default exchange rate: 1 USD = 40 UYU */
export const UYU_PER_USD = 40;
