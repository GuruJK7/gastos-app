// src/services/transactionService.js
// Transaction service - core financial engine for creating transactions
// UI must never touch Firestore directly; all financial logic lives here.

// NOTE:
// - Amounts and balances are currently stored as JavaScript numbers.
//   For production-grade financial accuracy, consider migrating to
//   integer minor units (e.g. cents) to avoid floating-point errors.
// - "saving" transactions currently behave like an expense from the
//   source account only. They do not automatically credit a destination
//   savings account or goal; that logic should be implemented explicitly
//   in a higher-level service when needed.

import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Supported transaction types
const TRANSACTION_TYPES = ['expense', 'income', 'transfer', 'saving'];

/**
 * Pure domain helper that defines how a transaction affects accounts.
 * It does NOT touch Firestore and is fully deterministic.
 *
 * Returns deltas to apply to account balances:
 *   fromDelta: how much to add to the source account (can be negative)
 *   toDelta:   how much to add to the destination account (if any)
 */
function calculateBalanceEffect(tx) {
  const amount = Number(tx.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  switch (tx.type) {
    case 'expense':
      // Expense decreases the source account balance.
      return { fromDelta: -amount };
    case 'income':
      // Income increases the source account balance.
      return { fromDelta: amount };
    case 'saving':
      // Saving behaves like an expense from the source account.
      // Optionally, you could also increase a savings account or goal, but
      // that is handled at a different layer to keep this function pure.
      return { fromDelta: -amount };
    case 'transfer':
      // Transfer moves money from one account to another.
      return { fromDelta: -amount, toDelta: amount };
    default:
      throw new Error(`Unsupported transaction type: ${tx.type}`);
  }
}

/**
 * Normalize date into analytics-friendly fields.
 */
function extractDateParts(date) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12
  const day = d.getDate();
  const yearMonth = `${year}-${String(month).padStart(2, '0')}`;

  // Simple week number approximation (ISO could be added later if needed)
  const oneJan = new Date(year, 0, 1);
  const week = Math.ceil(((d - oneJan) / 86400000 + oneJan.getDay() + 1) / 7);

  return { year, month, day, week, yearMonth };
}

/**
 * Create a financial transaction and atomically update affected account balances.
 *
 * This is the ONLY place where balances are modified in response to a transaction.
 * We rely on Firestore runTransaction to guarantee atomicity between:
 *   - the transaction document
 *   - the source account balance
 *   - the destination account balance (for transfers)
 */
export async function createTransaction(userId, data) {
  // ──────────────────────────────────────────────────────────────
  // 1. Basic input validation (cheap checks done before hitting Firestore)
  // ──────────────────────────────────────────────────────────────
  if (!userId) {
    throw new Error('userId is required');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Transaction data is required');
  }

  if (!TRANSACTION_TYPES.includes(data.type)) {
    throw new Error(`Invalid transaction type: ${data.type}`);
  }

  const amount = Number(data.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  if (!data.accountId) {
    throw new Error('accountId is required');
  }

  if (data.type === 'transfer') {
    if (!data.toAccountId) {
      throw new Error('toAccountId is required for transfer transactions');
    }
    if (data.toAccountId === data.accountId) {
      throw new Error('Source and destination accounts must be different for a transfer');
    }
  }

  const txDate = data.date instanceof Date ? data.date : new Date(data.date);
  if (Number.isNaN(txDate.getTime())) {
    throw new Error('Invalid date for transaction');
  }

  const dateParts = extractDateParts(txDate);

  // ──────────────────────────────────────────────────────────────
  // 2. Firestore transaction for atomic read/modify/write
  // ──────────────────────────────────────────────────────────────
  const userTransactionsCol = collection(db, `users/${userId}/transactions`);
  const newTxRef = doc(userTransactionsCol); // pre-generate id inside subcollection

  await runTransaction(db, async (transaction) => {
    // Prepare account references
    const fromAccountRef = doc(db, `users/${userId}/accounts/${data.accountId}`);
    const fromSnap = await transaction.get(fromAccountRef);
    if (!fromSnap.exists()) {
      throw new Error('Source account not found');
    }

    const fromData = fromSnap.data();

    // Enforce currency consistency for the source account
    if (data.currency && data.currency !== fromData.currency) {
      throw new Error('Transaction currency must match source account currency');
    }

    const toAccountRef = data.type === 'transfer' && data.toAccountId
      ? doc(db, `users/${userId}/accounts/${data.toAccountId}`)
      : null;

    const toSnap = toAccountRef ? await transaction.get(toAccountRef) : null;
    if (toAccountRef && !toSnap.exists()) {
      throw new Error('Destination account not found');
    }

    // Domain-level calculation of balance deltas (pure function)
    const { fromDelta, toDelta } = calculateBalanceEffect({
      type: data.type,
      amount,
    });

    const fromCurrent = Number(fromData.currentBalance) || 0;
    const nextFrom = fromCurrent + fromDelta;

    // Prevent negative balances for non-credit accounts
    if (fromData.type !== 'credit' && nextFrom < 0) {
      throw new Error('Insufficient funds in source account');
    }

    let nextTo = null;
    let toData = null;
    if (toAccountRef && toSnap && typeof toDelta === 'number') {
      toData = toSnap.data();

      // For now, block cross-currency transfers until proper FX handling is implemented
      if (toData.currency !== fromData.currency) {
        throw new Error('Transfers between accounts with different currencies are not supported yet');
      }

      const toCurrent = Number(toData.currentBalance) || 0;
      nextTo = toCurrent + toDelta;
      if (toData.type !== 'credit' && nextTo < 0) {
        throw new Error('Destination account would become negative');
      }
    }

    const timestamp = serverTimestamp();

    const txDoc = {
      type: data.type,
      amount,
      currency: data.currency || fromData.currency,
      accountId: data.accountId,
      toAccountId: data.toAccountId || null,
      categoryId: data.categoryId || null,
      goalId: data.goalId || null,
      description: data.description || null,
      notes: data.notes || null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      date: txDate,
      ...dateParts,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Write transaction document
    transaction.set(newTxRef, txDoc);

    // Update source account balance
    transaction.update(fromAccountRef, {
      currentBalance: nextFrom,
      updatedAt: timestamp,
    });

    // Update destination account balance for transfers
    if (toAccountRef && nextTo != null) {
      transaction.update(toAccountRef, {
        currentBalance: nextTo,
        updatedAt: timestamp,
      });
    }
  });

  // Note: we return a lightweight representation; callers that need
  // realtime updates should subscribe to the collection instead of
  // relying on this return value as the single source of truth.
  return {
    id: newTxRef.id,
    ...data,
    amount,
    date: txDate,
    ...dateParts,
  };
}

// Export internal helpers for testing if needed
export const __internal = {
  calculateBalanceEffect,
  extractDateParts,
};
