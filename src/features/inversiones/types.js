// src/features/inversiones/types.js
// ─── Inversion Data Contract ─────────────────────────────────────────────

/**
 * @typedef {Object} Inversion
 * @property {string}  id         — Firestore document ID
 * @property {string}  userId     — Owner UID
 * @property {string}  name       — Investment name / label
 * @property {number}  amount     — Positive number > 0
 * @property {number}  [returnPct] — Expected return %, optional
 * @property {string}  date       — ISO-8601 date string
 * @property {string}  [createdAt] — ISO-8601 timestamp, set by server
 */

/**
 * Build an empty Inversion draft (for forms).
 * @param {string} userId
 * @returns {Omit<Inversion, 'id' | 'createdAt'>}
 */
export function createInversionDraft(userId) {
  return {
    userId,
    name: '',
    amount: 0,
    returnPct: undefined,
    date: new Date().toISOString().slice(0, 10),
  };
}
