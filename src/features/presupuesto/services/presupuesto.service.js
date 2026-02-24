// src/features/presupuesto/services/presupuesto.service.js
// ─── Presupuesto Firestore Service ───────────────────────────────────────
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { presupuestoDocId } from '../types';
import { validatePresupuesto } from '../validators';

const COLLECTION = 'presupuestos';

/**
 * Get the budget for a given user + month.
 * @param {string} userId
 * @param {string} month — YYYY-MM
 * @returns {Promise<import('../types').Presupuesto | null>}
 */
export async function getPresupuesto(userId, month) {
  if (!userId || !month) throw new Error('userId y month son requeridos');
  const id = presupuestoDocId(userId, month);
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return /** @type {import('../types').Presupuesto} */ ({ id: snap.id, ...snap.data() });
}

/**
 * Create or update the budget for a given user + month.
 * Uses setDoc with merge so it creates if missing, updates if exists.
 * @param {string} userId
 * @param {string} month — YYYY-MM
 * @param {number} budgetUsd — must be > 0 (always stored in USD)
 * @returns {Promise<import('../types').Presupuesto>}
 */
export async function upsertPresupuesto(userId, month, budgetUsd) {
  if (!userId || !month) throw new Error('userId y month son requeridos');

  const id = presupuestoDocId(userId, month);
  const now = new Date().toISOString();

  // Check if doc already exists to decide createdAt vs updatedAt
  const existing = await getDoc(doc(db, COLLECTION, id));
  const isNew = !existing.exists();

  const payload = {
    userId,
    month,
    budgetUsd,
    ...(isNew ? { createdAt: now } : { updatedAt: now }),
  };

  const result = validatePresupuesto(payload);
  if (!result.ok) {
    throw new Error(`Presupuesto inválido: ${Object.values(result.errors).join('; ')}`);
  }

  await setDoc(doc(db, COLLECTION, id), payload, { merge: true });
  return /** @type {import('../types').Presupuesto} */ ({ id, ...payload });
}
