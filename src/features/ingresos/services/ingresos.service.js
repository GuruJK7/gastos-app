// src/features/ingresos/services/ingresos.service.js
// ─── Ingresos Firestore Service ──────────────────────────────────────────
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { validateIngreso } from '../validators';
import { toUsd } from '../../../lib/currency';

const COLLECTION = 'ingresos';

/**
 * Map a Firestore doc snapshot → typed Ingreso object.
 * @param {import('firebase/firestore').QueryDocumentSnapshot} snap
 * @returns {import('../types').Ingreso}
 */
function docToIngreso(snap) {
  return /** @type {import('../types').Ingreso} */ ({
    id: snap.id,
    ...snap.data(),
  });
}

/**
 * Remove keys with undefined values so Firestore never sees them.
 * @param {Record<string, *>} obj
 * @returns {Record<string, *>}
 */
function stripUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

/**
 * Create a new ingreso document.
 * @param {Omit<import('../types').Ingreso, 'id' | 'createdAt' | 'userId' | 'montoUsd'>} input
 * @param {string} userId
 * @returns {Promise<import('../types').Ingreso>}
 */
export async function createIngreso(input, userId) {
  if (!userId) throw new Error('userId es requerido');
  const montoUsd = toUsd(input.monto, input.currency, input.exchangeRate);
  const payload = stripUndefined({
    ...input,
    montoUsd,
    userId,
    createdAt: new Date().toISOString(),
  });
  const result = validateIngreso(payload);
  if (!result.ok) {
    throw new Error(`Ingreso inválido: ${Object.values(result.errors).join('; ')}`);
  }
  const ref = await addDoc(collection(db, COLLECTION), payload);
  return /** @type {import('../types').Ingreso} */ ({ id: ref.id, ...payload });
}

/**
 * List all ingresos for a given user, newest first.
 * @param {string} userId
 * @returns {Promise<import('../types').Ingreso[]>}
 */
export async function listIngresos(userId) {
  if (!userId) throw new Error('userId es requerido');
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('fecha', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(docToIngreso);
}

/**
 * List ingresos for a given user filtered by month (YYYY-MM).
 * Uses range query on `fecha` field: >= YYYY-MM-01 and < next month.
 * @param {string} userId
 * @param {string} monthStr — YYYY-MM format
 * @returns {Promise<import('../types').Ingreso[]>}
 */
export async function listIngresosByMonth(userId, monthStr) {
  if (!userId) throw new Error('userId es requerido');
  if (!monthStr || !/^\d{4}-(0[1-9]|1[0-2])$/.test(monthStr)) {
    throw new Error('monthStr debe ser formato YYYY-MM');
  }

  const startDate = `${monthStr}-01`;
  // Compute first day of next month
  const [y, m] = monthStr.split('-').map(Number);
  const nextMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;

  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('fecha', '>=', startDate),
    where('fecha', '<', nextMonth),
    orderBy('fecha', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(docToIngreso);
}

/**
 * Update an existing ingreso document.
 * @param {string} ingresoId
 * @param {Partial<Omit<import('../types').Ingreso, 'id' | 'userId' | 'createdAt'>>} changes
 * @returns {Promise<void>}
 */
export async function updateIngreso(ingresoId, changes) {
  if (!ingresoId) throw new Error('ingresoId es requerido');

  // Recompute montoUsd when monto/currency/exchangeRate are provided
  const updated = { ...changes };
  if (updated.monto != null && updated.currency && updated.exchangeRate) {
    updated.montoUsd = toUsd(updated.monto, updated.currency, updated.exchangeRate);
  }

  const payload = stripUndefined({
    ...updated,
    updatedAt: new Date().toISOString(),
  });
  const ref = doc(db, COLLECTION, ingresoId);
  await updateDoc(ref, payload);
}

/**
 * Delete an ingreso document.
 * @param {string} ingresoId
 * @returns {Promise<void>}
 */
export async function deleteIngreso(ingresoId) {
  if (!ingresoId) throw new Error('ingresoId es requerido');
  const ref = doc(db, COLLECTION, ingresoId);
  await deleteDoc(ref);
}
