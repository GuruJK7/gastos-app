// src/features/gastos/types.js
// ─── Gasto Data Contract ─────────────────────────────────────────────────
import { SUPPORTED_CURRENCIES, UYU_PER_USD } from '../../lib/constants';

/**
 * @typedef {'Efectivo'|'Débito'|'Crédito'|'Transferencia'} PaymentMethod
 */

/**
 * @typedef {'Comida'|'Supermercado'|'Transporte'|'Entretenimiento'|'Farmacia'|'Servicios'|'Educación'|'Otro'} GastoCategory
 */

/**
 * @typedef {'USD'|'UYU'} Currency
 */

/**
 * @typedef {Object} Gasto
 * @property {string}         id            — Firestore document ID
 * @property {string}         userId        — Owner UID
 * @property {number}         amount        — Positive number > 0 (in selected currency)
 * @property {Currency}       currency      — 'USD' | 'UYU'
 * @property {number}         amountUsd     — Normalized amount in USD > 0
 * @property {number}         exchangeRate  — UYU per USD used at creation/update
 * @property {GastoCategory}  category      — Spending category
 * @property {PaymentMethod}  paymentMethod — How it was paid
 * @property {string}         [note]        — Optional freeform note
 * @property {string}         date          — ISO-8601 date string
 * @property {string}         [createdAt]   — ISO-8601 timestamp, set by server
 */

/** @type {readonly PaymentMethod[]} */
export const PAYMENT_METHODS = /** @type {const} */ ([
  'Efectivo',
  'Débito',
  'Crédito',
  'Transferencia',
]);

/** @type {readonly GastoCategory[]} */
export const GASTO_CATEGORIES = /** @type {const} */ ([
  'Comida',
  'Supermercado',
  'Transporte',
  'Entretenimiento',
  'Farmacia',
  'Servicios',
  'Educación',
  'Otro',
]);

/** Re-export for convenience */
export { SUPPORTED_CURRENCIES };

/**
 * Build an empty Gasto draft (for forms).
 * @param {string} userId
 * @returns {Omit<Gasto, 'id' | 'createdAt'>}
 */
export function createGastoDraft(userId) {
  return {
    userId,
    amount: 0,
    currency: 'UYU',
    amountUsd: 0,
    exchangeRate: UYU_PER_USD,
    category: 'Otro',
    paymentMethod: 'Efectivo',
    note: '',
    date: new Date().toISOString().slice(0, 10),
  };
}
