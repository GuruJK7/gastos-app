// src/features/inversiones/validators.js
// ─── Inversion Runtime Validators ────────────────────────────────────────

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}/;

/**
 * Validate a single field. Returns error string or null.
 * @param {string} field
 * @param {*} value
 * @returns {string|null}
 */
function checkInversionField(field, value) {
  switch (field) {
    case 'userId':
      return typeof value === 'string' && value.length > 0
        ? null
        : 'userId es requerido';
    case 'name':
      return typeof value === 'string' && value.trim().length > 0
        ? null
        : 'name es requerido';
    case 'amount':
      return typeof value === 'number' && value > 0
        ? null
        : 'amount debe ser un número mayor a 0';
    case 'returnPct':
      return value == null || typeof value === 'number'
        ? null
        : 'returnPct debe ser un número o vacío';
    case 'date':
      return typeof value === 'string' && ISO_DATE_RE.test(value) && !isNaN(Date.parse(value))
        ? null
        : 'date debe ser ISO-8601 válido';
    case 'createdAt':
      return value == null || (typeof value === 'string' && !isNaN(Date.parse(value)))
        ? null
        : 'createdAt debe ser ISO-8601 válido';
    default:
      return null;
  }
}

const REQUIRED_FIELDS = ['userId', 'name', 'amount', 'date'];

/**
 * Validate a full or partial Inversion object.
 * @param {Record<string, *>} data
 * @param {{ partial?: boolean }} [opts]
 * @returns {{ ok: boolean, errors: Record<string, string> }}
 */
export function validateInversion(data, opts = {}) {
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
    const err = checkInversionField(key, value);
    if (err) errors[key] = err;
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

/**
 * Validate and return cleaned data or throw.
 * @param {Record<string, *>} data
 * @returns {import('./types').Inversion}
 */
export function parseInversion(data) {
  const result = validateInversion(data);
  if (!result.ok) {
    const msg = Object.values(result.errors).join('; ');
    throw new Error(`Inversión inválida: ${msg}`);
  }
  return /** @type {import('./types').Inversion} */ (data);
}
