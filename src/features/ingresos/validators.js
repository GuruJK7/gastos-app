// src/features/ingresos/validators.js
// ─── Ingreso Runtime Validators ──────────────────────────────────────────
import { INGRESO_CATEGORIES, SUPPORTED_CURRENCIES } from './types';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}/;

/**
 * Validate a single field. Returns error string or null.
 * @param {string} field
 * @param {*} value
 * @returns {string|null}
 */
function checkIngresoField(field, value) {
  switch (field) {
    case 'userId':
      return typeof value === 'string' && value.length > 0
        ? null
        : 'userId es requerido';
    case 'monto':
      return typeof value === 'number' && value > 0
        ? null
        : 'monto debe ser un número mayor a 0';
    case 'currency':
      return SUPPORTED_CURRENCIES.includes(value)
        ? null
        : `currency inválida: ${value}. Usa: ${SUPPORTED_CURRENCIES.join(', ')}`;
    case 'montoUsd':
      return typeof value === 'number' && value > 0
        ? null
        : 'montoUsd debe ser un número mayor a 0';
    case 'exchangeRate':
      return typeof value === 'number' && value > 0
        ? null
        : 'exchangeRate debe ser un número mayor a 0';
    case 'source':
      return typeof value === 'string' && value.trim().length > 0
        ? null
        : 'source es requerido';
    case 'fecha':
      return typeof value === 'string' && ISO_DATE_RE.test(value) && !isNaN(Date.parse(value))
        ? null
        : 'fecha debe ser ISO-8601 válido';
    case 'categoria':
      return value == null || INGRESO_CATEGORIES.includes(value)
        ? null
        : `categoria inválida: ${value}`;
    case 'nota':
      return value == null || typeof value === 'string'
        ? null
        : 'nota debe ser string o vacío';
    case 'createdAt':
      return value == null || (typeof value === 'string' && !isNaN(Date.parse(value)))
        ? null
        : 'createdAt debe ser ISO-8601 válido';
    default:
      return null;
  }
}

const REQUIRED_FIELDS = ['userId', 'monto', 'currency', 'montoUsd', 'exchangeRate', 'source', 'fecha'];

/**
 * Validate a full or partial Ingreso object.
 * @param {Record<string, *>} data
 * @param {{ partial?: boolean }} [opts]
 * @returns {{ ok: boolean, errors: Record<string, string> }}
 */
export function validateIngreso(data, opts = {}) {
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
    const err = checkIngresoField(key, value);
    if (err) errors[key] = err;
  }

  return { ok: Object.keys(errors).length === 0, errors };
}
