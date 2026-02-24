// src/features/presupuesto/types.js
// ─── Presupuesto Data Contract ───────────────────────────────────────────

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * @typedef {Object} Presupuesto
 * @property {string}  id         — Firestore document ID (userId_YYYY-MM)
 * @property {string}  userId     — Owner UID
 * @property {string}  month      — YYYY-MM format
 * @property {number}  budgetUsd  — Budget amount in USD > 0
 * @property {string}  [createdAt] — ISO-8601 timestamp
 * @property {string}  [updatedAt] — ISO-8601 timestamp
 */

/**
 * Build the deterministic document ID.
 * @param {string} userId
 * @param {string} month — YYYY-MM
 * @returns {string}
 */
export function presupuestoDocId(userId, month) {
  return `${userId}_${month}`;
}

/**
 * Get current month string.
 * @returns {string} YYYY-MM
 */
export function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

/**
 * Validate month format.
 * @param {string} month
 * @returns {boolean}
 */
export function isValidMonth(month) {
  return typeof month === 'string' && MONTH_RE.test(month);
}
