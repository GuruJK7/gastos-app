// src/services/accountService.js
// Account service - domain logic for financial accounts

import { collection, doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const ACCOUNT_TYPES = ['cash', 'bank', 'credit', 'investment', 'wallet', 'other'];

export const createAccount = async (userId, data) => {
  if (!userId) throw new Error('userId is required');
  if (!data?.name) throw new Error('account name is required');
  if (!ACCOUNT_TYPES.includes(data.type)) {
    throw new Error(`Invalid account type. Must be one of: ${ACCOUNT_TYPES.join(', ')}`);
  }

  const accountRef = doc(collection(db, `users/${userId}/accounts`));

  const now = serverTimestamp();
  const initialBalance = Number(data.initialBalance) || 0;

  await runTransaction(db, async (tx) => {
    tx.set(accountRef, {
      name: data.name,
      type: data.type,
      currency: data.currency || 'USD',
      initialBalance,
      currentBalance: initialBalance,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  });

  const snap = await getDoc(accountRef);
  return { id: accountRef.id, ...snap.data() };
};

export const getAccount = async (userId, accountId) => {
  if (!userId || !accountId) throw new Error('userId and accountId are required');
  const ref = doc(db, `users/${userId}/accounts/${accountId}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const adjustAccountBalance = async (userId, accountId, delta) => {
  if (!userId || !accountId) throw new Error('userId and accountId are required');
  if (!Number.isFinite(delta)) throw new Error('delta must be a finite number');

  const ref = doc(db, `users/${userId}/accounts/${accountId}`);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Account not found');

    const current = Number(snap.data().currentBalance) || 0;
    tx.update(ref, {
      currentBalance: current + delta,
      updatedAt: serverTimestamp(),
    });
  });
};

export const transferBetweenAccounts = async (userId, fromAccountId, toAccountId, amount) => {
  if (!userId) throw new Error('userId is required');
  if (!fromAccountId || !toAccountId) throw new Error('Both accounts are required');
  if (fromAccountId === toAccountId) throw new Error('Source and destination accounts must be different');

  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) throw new Error('Amount must be a positive number');

  const fromRef = doc(db, `users/${userId}/accounts/${fromAccountId}`);
  const toRef   = doc(db, `users/${userId}/accounts/${toAccountId}`);

  await runTransaction(db, async (tx) => {
    const fromSnap = await tx.get(fromRef);
    const toSnap   = await tx.get(toRef);

    if (!fromSnap.exists()) throw new Error('Source account not found');
    if (!toSnap.exists())   throw new Error('Destination account not found');

    const fromData = fromSnap.data();
    const toData   = toSnap.data();

    if (fromData.currency !== toData.currency) {
      throw new Error('Transfers between accounts with different currencies are not supported yet');
    }

    const fromBalance = Number(fromData.currentBalance) || 0;
    const toBalance   = Number(toData.currentBalance)   || 0;

    if (fromData.type !== 'credit' && fromBalance < value) {
      throw new Error('Insufficient funds in source account');
    }

    const now = serverTimestamp();
    tx.update(fromRef, { currentBalance: fromBalance - value, updatedAt: now });
    tx.update(toRef,   { currentBalance: toBalance   + value, updatedAt: now });
  });
};