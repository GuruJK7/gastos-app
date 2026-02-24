// src/features/gastos/components/QuickExpenseForm.jsx
// ─── Quick Expense Form (modal version) ──────────────────────────────────
import React, { useState, useMemo } from 'react';
import { GASTO_CATEGORIES, PAYMENT_METHODS } from '../types';
import { SUPPORTED_CURRENCIES, UYU_PER_USD } from '../../../lib/constants';
import { toUsd } from '../../../lib/currency';
import { useAuthStore } from '../../../store/auth.store';
import { createGasto } from '../services/gastos.service';

/**
 * @param {{ onCreated: () => void, onClose: () => void }} props
 */
export default function QuickExpenseForm({ onCreated, onClose }) {
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    amount: '',
    currency: 'USD',
    exchangeRate: String(UYU_PER_USD),
    category: 'Otro',
    paymentMethod: 'Efectivo',
    note: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function update(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
    setError('');
  }

  const usdPreview = useMemo(() => {
    if (form.currency !== 'UYU') return null;
    const amt = parseFloat(form.amount);
    const rate = parseFloat(form.exchangeRate);
    if (!amt || amt <= 0 || !rate || rate <= 0) return null;
    return toUsd(amt, 'UYU', rate);
  }, [form.amount, form.currency, form.exchangeRate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user?.uid) { setError('Usuario no autenticado'); return; }
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) { setError('El monto debe ser mayor a 0'); return; }
    const rate = parseFloat(form.exchangeRate);
    if (form.currency === 'UYU' && (!rate || rate <= 0)) {
      setError('El tipo de cambio debe ser mayor a 0'); return;
    }
    if (!form.date) { setError('La fecha es requerida'); return; }
    setSubmitting(true);
    try {
      await createGasto({
        userId: user.uid,
        amount: amt,
        currency: form.currency,
        exchangeRate: form.currency === 'UYU' ? rate : 1,
        category: form.category,
        paymentMethod: form.paymentMethod,
        note: form.note.trim() || undefined,
        date: form.date,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err?.message || 'Error al crear gasto');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
        Gasto Rápido
      </h3>

      {error && (
        <p style={{
          fontSize: '0.75rem', color: 'var(--danger)',
          background: 'var(--danger-muted)', padding: '0.375rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
        }}>{error}</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <label className="expense-form__field">
          <span className="expense-form__label">Monto</span>
          <input type="number" min="0.01" step="0.01" placeholder="0.00"
            value={form.amount} onChange={(e) => update('amount', e.target.value)}
            className="expense-form__input" required autoFocus />
          {usdPreview !== null && (
            <span style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.25rem' }}>
              ≈ USD {usdPreview.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          )}
        </label>
        <label className="expense-form__field">
          <span className="expense-form__label">Moneda</span>
          <select value={form.currency} onChange={(e) => update('currency', e.target.value)}
            className="expense-form__input">
            {SUPPORTED_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        {form.currency === 'UYU' && (
          <label className="expense-form__field">
            <span className="expense-form__label">Tipo de cambio (UYU/USD)</span>
            <input type="number" min="0.01" step="0.01"
              value={form.exchangeRate} onChange={(e) => update('exchangeRate', e.target.value)}
              className="expense-form__input" required />
          </label>
        )}
        <label className="expense-form__field">
          <span className="expense-form__label">Fecha</span>
          <input type="date" value={form.date}
            onChange={(e) => update('date', e.target.value)}
            className="expense-form__input" required />
        </label>
        <label className="expense-form__field">
          <span className="expense-form__label">Categoría</span>
          <select value={form.category} onChange={(e) => update('category', e.target.value)}
            className="expense-form__input">
            {GASTO_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="expense-form__field">
          <span className="expense-form__label">Método de pago</span>
          <select value={form.paymentMethod} onChange={(e) => update('paymentMethod', e.target.value)}
            className="expense-form__input">
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="expense-form__field" style={{ gridColumn: '1 / -1' }}>
          <span className="expense-form__label">Nota (opcional)</span>
          <input type="text" placeholder="Descripción breve…" maxLength={120}
            value={form.note} onChange={(e) => update('note', e.target.value)}
            className="expense-form__input" />
        </label>
      </div>

      <button type="submit" className="expense-form__submit" disabled={submitting}>
        {submitting ? 'Guardando…' : '+ Agregar Gasto'}
      </button>
    </form>
  );
}
