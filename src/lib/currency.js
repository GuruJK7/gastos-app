// src/lib/currency.js
// ─── Multi-Currency Foundation (USD / UYU) ───────────────────────────────
// Pure helpers for formatting, converting, and rounding money.
// No external deps — works with the constants in ./constants.js.

import { UYU_PER_USD, SUPPORTED_CURRENCIES } from './constants';

// ── Locale map for Intl.NumberFormat ──
const CURRENCY_LOCALE = /** @type {const} */ ({
  USD: 'en-US',
  UYU: 'es-UY',
});

// ── Cached formatters (one per currency) ──
/** @type {Record<string, Intl.NumberFormat>} */
const _fmtCache = {};

/**
 * Return a cached Intl.NumberFormat for the given currency code.
 * @param {string} currency
 * @returns {Intl.NumberFormat}
 */
function getFormatter(currency) {
  if (!_fmtCache[currency]) {
    _fmtCache[currency] = new Intl.NumberFormat(
      CURRENCY_LOCALE[currency] || 'en-US',
      { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 },
    );
  }
  return _fmtCache[currency];
}

// ─── Public API ──────────────────────────────────────────────────────────

/**
 * Round a number to 2 decimal places (banker-safe).
 * @param {number} n
 * @returns {number}
 *
 * // round2(10.256)  → 10.26
 * // round2(10.254)  → 10.25
 * // round2(-3.555)  → -3.56
 * // round2(0)       → 0
 */
export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Format an amount with its currency symbol using the browser's Intl API.
 * @param {number} amount
 * @param {string} [currency='USD'] — 'USD' | 'UYU'
 * @returns {string}
 *
 * // formatMoney(1234.5, 'USD')  → "$1,234.50"
 * // formatMoney(1234.5, 'UYU')  → "$ 1.234,50" (Uruguayan locale)
 * // formatMoney(0, 'USD')       → "$0.00"
 */
export function formatMoney(amount, currency = 'USD') {
  if (typeof amount !== 'number' || !isFinite(amount)) return getFormatter(currency).format(0);
  return getFormatter(currency).format(round2(amount));
}

/**
 * Convert an amount in any supported currency to USD.
 * If already USD, returns the amount rounded to 2 decimals.
 * @param {number} amount
 * @param {string} currency — 'USD' | 'UYU'
 * @param {number} [uyuPerUsd=UYU_PER_USD] — exchange rate override
 * @returns {number}
 *
 * // toUsd(100, 'USD')          → 100
 * // toUsd(4000, 'UYU')         → 100       (4000 / 40)
 * // toUsd(4000, 'UYU', 50)     → 80        (4000 / 50)
 * // toUsd(1, 'UYU', 40)        → 0.03      (1 / 40 ≈ 0.025 → 0.03)
 */
export function toUsd(amount, currency, uyuPerUsd = UYU_PER_USD) {
  if (currency === 'USD') return round2(amount);
  if (currency === 'UYU') return round2(amount / uyuPerUsd);
  throw new Error(`Moneda no soportada: ${currency}. Usa: ${SUPPORTED_CURRENCIES.join(', ')}`);
}

/**
 * Convert a USD amount to a target currency.
 * If target is USD, returns the amount rounded to 2 decimals.
 * @param {number} usdAmount
 * @param {string} currency — 'USD' | 'UYU'
 * @param {number} [uyuPerUsd=UYU_PER_USD] — exchange rate override
 * @returns {number}
 *
 * // fromUsd(100, 'USD')        → 100
 * // fromUsd(100, 'UYU')        → 4000      (100 * 40)
 * // fromUsd(100, 'UYU', 50)    → 5000      (100 * 50)
 * // fromUsd(0.03, 'UYU', 40)   → 1.2
 */
export function fromUsd(usdAmount, currency, uyuPerUsd = UYU_PER_USD) {
  if (currency === 'USD') return round2(usdAmount);
  if (currency === 'UYU') return round2(usdAmount * uyuPerUsd);
  throw new Error(`Moneda no soportada: ${currency}. Usa: ${SUPPORTED_CURRENCIES.join(', ')}`);
}

/**
 * Check whether a currency code is supported.
 * @param {string} code
 * @returns {boolean}
 *
 * // isSupportedCurrency('USD') → true
 * // isSupportedCurrency('EUR') → false
 */
export function isSupportedCurrency(code) {
  return SUPPORTED_CURRENCIES.includes(code);
}
