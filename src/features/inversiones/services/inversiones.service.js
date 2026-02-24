// src/features/inversiones/services/inversiones.service.js
// ─── Inversiones Firestore Service ───────────────────────────────────────
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
import { validateInversion } from '../validators';

const COLLECTION = 'inversiones';

/**
 * Map a Firestore doc snapshot → typed Inversion object.
 * @param {import('firebase/firestore').QueryDocumentSnapshot} snap
 * @returns {import('../types').Inversion}
 */
function docToInversion(snap) {
  return /** @type {import('../types').Inversion} */ ({
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
 * Create a new inversion document.
 * @param {Omit<import('../types').Inversion, 'id' | 'createdAt'>} data
 * @returns {Promise<import('../types').Inversion>}
 */
export async function createInversion(data) {
  const payload = stripUndefined({ ...data, createdAt: new Date().toISOString() });
  const result = validateInversion(payload);
  if (!result.ok) {
    throw new Error(`Inversión inválida: ${Object.values(result.errors).join('; ')}`);
  }
  const ref = await addDoc(collection(db, COLLECTION), payload);
  return /** @type {import('../types').Inversion} */ ({ id: ref.id, ...payload });
}

/**
 * List all inversiones for a given user, newest first.
 * @param {string} userId
 * @returns {Promise<import('../types').Inversion[]>}
 */
export async function listInversiones(userId) {
  if (!userId) throw new Error('userId es requerido');
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('date', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(docToInversion);
}

/**
 * Update an existing inversion (partial).
 * @param {string} inversionId
 * @param {string} userId — must match document owner
 * @param {Partial<Omit<import('../types').Inversion, 'id' | 'userId'>>} data
 * @returns {Promise<void>}
 */
export async function updateInversion(inversionId, userId, data) {
  if (!inversionId || !userId) throw new Error('inversionId y userId son requeridos');
  const result = validateInversion({ ...data, userId }, { partial: true });
  if (!result.ok) {
    throw new Error(`Inversión inválida: ${Object.values(result.errors).join('; ')}`);
  }
  const ref = doc(db, COLLECTION, inversionId);
  await updateDoc(ref, data);
}

/**
 * Delete an inversion document.
 * @param {string} inversionId
 * @returns {Promise<void>}
 */
export async function deleteInversion(inversionId) {
  if (!inversionId) throw new Error('inversionId es requerido');
  const ref = doc(db, COLLECTION, inversionId);
  await deleteDoc(ref);
}
