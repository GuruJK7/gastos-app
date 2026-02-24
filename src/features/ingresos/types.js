// src/features/ingresos/types.js
// ─── Ingreso Data Contract ───────────────────────────────────────────────
import { SUPPORTED_CURRENCIES, UYU_PER_USD } from '../../lib/constants';

/**
 * @typedef {'Salario'|'Freelance'|'Inversión'|'Regalo'|'Reembolso'|'Otro'} IngresoCategory
 */

/**
 * @typedef {'USD'|'UYU'} Currency
 */

/**
 * @typedef {Object} Ingreso
 * @property {string}           id           — Firestore document ID
 * @property {string}           userId       — Owner UID
 * @property {number}           monto        — Positive number > 0 (in selected currency)
 * @property {Currency}         currency     — 'USD' | 'UYU'
 * @property {number}           montoUsd     — Normalized amount in USD > 0
 * @property {number}           exchangeRate — UYU per USD used at creation/update
 * @property {string}           source       — Income source (e.g. "Sueldo", "Freelance")
 * @property {string}           fecha        — ISO-8601 date string
 * @property {IngresoCategory}  [categoria]  — Optional income category
 * @property {string}           [nota]       — Optional freeform note
 * @property {string}           [createdAt]  — ISO-8601 timestamp
 */

/** @type {readonly IngresoCategory[]} */
export const INGRESO_CATEGORIES = /** @type {const} */ ([
  'Salario',
  'Freelance',
  'Inversión',
  'Regalo',
  'Reembolso',
  'Otro',
]);

/** Common income sources for UI dropdowns / autocomplete */
export const INGRESO_SOURCES = /** @type {const} */ ([
  'Sueldo',
  'Freelance',
  'Venta',
  'Alquiler',
  'Dividendos',
  'Reembolso',
  'Otro',
]);

/** Re-export for convenience */
export { SUPPORTED_CURRENCIES };

/**
 * Build an empty Ingreso draft (for forms).
 * @param {string} userId
 * @returns {Omit<Ingreso, 'id' | 'createdAt'>}
 */
export function createIngresoDraft(userId) {
  return {
    userId,
    monto: 0,
    currency: 'UYU',
    montoUsd: 0,
    exchangeRate: UYU_PER_USD,
    source: '',
    fecha: new Date().toISOString().slice(0, 10),
    categoria: 'Otro',
    nota: '',
  };
}
