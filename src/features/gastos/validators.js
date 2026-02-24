// src/features/gastos/validators.js
// ─── Gasto Runtime Validators ────────────────────────────────────────────
import { PAYMENT_METHODS, GASTO_CATEGORIES, SUPPORTED_CURRENCIES } from './types';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}/;

/**
 * Validate a single field. Returns error string or null.
 * @param {string} field
 * @param {*} value
 * @returns {string|null}
 */
function checkGastoField(field, value) {
  switch (field) {
    case 'userId':
      return typeof value === 'string' && value.length > 0
        ? null
        : 'userId es requerido';
    case 'amount':
      return typeof value === 'number' && value > 0
        ? null
        : 'amount debe ser un número mayor a 0';
    case 'currency':
      return SUPPORTED_CURRENCIES.includes(value)
        ? null
        : `currency inválida: ${value}. Usa: ${SUPPORTED_CURRENCIES.join(', ')}`;
    case 'amountUsd':
      return typeof value === 'number' && value > 0
        ? null
        : 'amountUsd debe ser un número mayor a 0';
    case 'exchangeRate':
      return typeof value === 'number' && value > 0
        ? null
        : 'exchangeRate debe ser un número mayor a 0';
    case 'category':
      return GASTO_CATEGORIES.includes(value)
        ? null
        : `category inválida: ${value}`;
    case 'paymentMethod':
      return PAYMENT_METHODS.includes(value)
        ? null
        : `paymentMethod inválido: ${value}`;
    case 'date':
      return typeof value === 'string' && ISO_DATE_RE.test(value) && !isNaN(Date.parse(value))
        ? null
        : 'date debe ser ISO-8601 válido';
    case 'note':
      return value == null || typeof value === 'string'
        ? null
        : 'note debe ser string o vacío';
    case 'createdAt':
      return value == null || (typeof value === 'string' && !isNaN(Date.parse(value)))
        ? null
        : 'createdAt debe ser ISO-8601 válido';
    default:
      return null;
  }
}

const REQUIRED_FIELDS = ['userId', 'amount', 'currency', 'amountUsd', 'exchangeRate', 'category', 'paymentMethod', 'date'];

/**
 * Validate a full or partial Gasto object.
 * @param {Record<string, *>} data
 * @param {{ partial?: boolean }} [opts]
 * @returns {{ ok: boolean, errors: Record<string, string> }}
 */
export function validateGasto(data, opts = {}) {
  const errors = {};

  if (!opts.partial) {
    for (const key of REQUIRED_FIELDS) {
      if (data[key] == null || data[key] === '') {
        errors[key] = `${key} es requerido`;
      }
    }
  }

  for (const [key, value] of Object.entries(data)) {
    if (value == null && opts.partial) continue;
    const err = checkGastoField(key, value);
    if (err) errors[key] = err;
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

/**
 * Validate and return cleaned data or throw.
 * @param {Record<string, *>} data
 * @returns {import('./types').Gasto}
 */
export function parseGasto(data) {
  const result = validateGasto(data);
  if (!result.ok) {
    const msg = Object.values(result.errors).join('; ');
    throw new Error(`Gasto inválido: ${msg}`);
  }
  return /** @type {import('./types').Gasto} */ (data);
}
