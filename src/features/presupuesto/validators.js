// src/features/presupuesto/validators.js
// ─── Presupuesto Runtime Validators ──────────────────────────────────────
import { isValidMonth } from './types';

/**
 * Validate a single field. Returns error string or null.
 * @param {string} field
 * @param {*} value
 * @returns {string|null}
 */
function checkField(field, value) {
  switch (field) {
    case 'userId':
      return typeof value === 'string' && value.length > 0
        ? null
        : 'userId es requerido';
    case 'month':
      return isValidMonth(value)
        ? null
        : 'month debe ser formato YYYY-MM';
    case 'budgetUsd':
      return typeof value === 'number' && value > 0
        ? null
        : 'budgetUsd debe ser un número mayor a 0';
    case 'createdAt':
    case 'updatedAt':
      return value == null || (typeof value === 'string' && !isNaN(Date.parse(value)))
        ? null
        : `${field} debe ser ISO-8601 válido`;
    default:
      return null;
  }
}

const REQUIRED_FIELDS = ['userId', 'month', 'budgetUsd'];

/**
 * Validate a full or partial Presupuesto object.
 * @param {Record<string, *>} data
 * @param {{ partial?: boolean }} [opts]
 * @returns {{ ok: boolean, errors: Record<string, string> }}
 */
export function validatePresupuesto(data, opts = {}) {
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
    const err = checkField(key, value);
    if (err) errors[key] = err;
  }

  return { ok: Object.keys(errors).length === 0, errors };
}
