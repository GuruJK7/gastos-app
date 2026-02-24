// src/features/gastos/services/gastos.service.js
// ─── Gastos Firestore Service ────────────────────────────────────────────
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
import { validateGasto } from '../validators';
import { toUsd } from '../../../lib/currency';

const COLLECTION = 'gastos';

/**
 * Map a Firestore doc snapshot → typed Gasto object.
 * @param {import('firebase/firestore').QueryDocumentSnapshot} snap
 * @returns {import('../types').Gasto}
 */
function docToGasto(snap) {
  return /** @type {import('../types').Gasto} */ ({
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
 * Create a new gasto document.
 * @param {Omit<import('../types').Gasto, 'id' | 'createdAt' | 'amountUsd'>} data
 * @returns {Promise<import('../types').Gasto>}
 */
export async function createGasto(data) {
  const amountUsd = toUsd(data.amount, data.currency, data.exchangeRate);
  const payload = stripUndefined({
    ...data,
    amountUsd,
    createdAt: new Date().toISOString(),
  });
  const result = validateGasto(payload);
  if (!result.ok) {
    throw new Error(`Gasto inválido: ${Object.values(result.errors).join('; ')}`);
  }
  const ref = await addDoc(collection(db, COLLECTION), payload);
  return /** @type {import('../types').Gasto} */ ({ id: ref.id, ...payload });
}

/**
 * List all gastos for a given user, newest first.
 * @param {string} userId
 * @returns {Promise<import('../types').Gasto[]>}
 */
export async function listGastos(userId) {
  if (!userId) throw new Error('userId es requerido');
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('date', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(docToGasto);
}

/**
 * Update an existing gasto (partial).
 * @param {string} gastoId
 * @param {string} userId  — must match document owner
 * @param {Partial<Omit<import('../types').Gasto, 'id' | 'userId'>>} data
 * @returns {Promise<void>}
 */
export async function updateGasto(gastoId, userId, data) {
  if (!gastoId || !userId) throw new Error('gastoId y userId son requeridos');

  // Recompute amountUsd when amount or currency changes
  const updated = { ...data };
  if (updated.amount != null && updated.currency && updated.exchangeRate) {
    updated.amountUsd = toUsd(updated.amount, updated.currency, updated.exchangeRate);
  }

  const result = validateGasto({ ...updated, userId }, { partial: true });
  if (!result.ok) {
    throw new Error(`Gasto inválido: ${Object.values(result.errors).join('; ')}`);
  }
  const ref = doc(db, COLLECTION, gastoId);
  await updateDoc(ref, updated);
}

/**
 * Delete a gasto document.
 * @param {string} gastoId
 * @returns {Promise<void>}
 */
export async function deleteGasto(gastoId) {
  if (!gastoId) throw new Error('gastoId es requerido');
  const ref = doc(db, COLLECTION, gastoId);
  await deleteDoc(ref);
}
