// src/features/gastos/components/ExpenseForm.jsx
// ─── Expense Creation Form ───────────────────────────────────────────────
import React, { useState, useMemo } from 'react';
import { GASTO_CATEGORIES, PAYMENT_METHODS } from '../types';
import { SUPPORTED_CURRENCIES, UYU_PER_USD } from '../../../lib/constants';
import { toUsd } from '../../../lib/currency';

/**
 * @param {{ onSubmit: (draft: object) => Promise<void>, submitting: boolean }} props
 */
export default function ExpenseForm({ onSubmit, submitting }) {
  const [form, setForm] = useState(() => ({
    amount: '',
    currency: 'USD',
    exchangeRate: String(UYU_PER_USD),
    category: 'Otro',
    paymentMethod: 'Efectivo',
    note: '',
    date: new Date().toISOString().slice(0, 10),
  }));
  const [fieldError, setFieldError] = useState('');

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldError('');
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
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) {
      setFieldError('El monto debe ser mayor a 0');
      return;
    }
    const rate = parseFloat(form.exchangeRate);
    if (form.currency === 'UYU' && (!rate || rate <= 0)) {
      setFieldError('El tipo de cambio debe ser mayor a 0');
      return;
    }
    if (!form.date) {
      setFieldError('La fecha es requerida');
      return;
    }
    try {
      await onSubmit({
        amount: amt,
        currency: form.currency,
        exchangeRate: form.currency === 'UYU' ? rate : 1,
        category: form.category,
        paymentMethod: form.paymentMethod,
        note: form.note.trim() || undefined,
        date: form.date,
      });
      setForm({
        amount: '',
        currency: 'USD',
        exchangeRate: String(UYU_PER_USD),
        category: 'Otro',
        paymentMethod: 'Efectivo',
        note: '',
        date: new Date().toISOString().slice(0, 10),
      });
    } catch {
      // error handled by hook
    }
  }

  return (
    <form className="expense-form glass" onSubmit={handleSubmit}>
      <h3 className="expense-form__title">Nuevo Gasto</h3>

      {fieldError && <p className="expense-form__error">{fieldError}</p>}

      <div className="expense-form__grid">
        {/* ── Amount + Currency row ── */}
        <label className="expense-form__field">
          <span className="expense-form__label">Monto</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => update('amount', e.target.value)}
            className="expense-form__input"
            required
          />
          {usdPreview !== null && (
            <span style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.25rem' }}>
              ≈ USD {usdPreview.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          )}
        </label>

        <label className="expense-form__field">
          <span className="expense-form__label">Moneda</span>
          <select
            value={form.currency}
            onChange={(e) => update('currency', e.target.value)}
            className="expense-form__input"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        {form.currency === 'UYU' && (
          <label className="expense-form__field">
            <span className="expense-form__label">Tipo de cambio (UYU/USD)</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.exchangeRate}
              onChange={(e) => update('exchangeRate', e.target.value)}
              className="expense-form__input"
              required
            />
          </label>
        )}

        <label className="expense-form__field">
          <span className="expense-form__label">Fecha</span>
          <input
            type="date"
            value={form.date}
            onChange={(e) => update('date', e.target.value)}
            className="expense-form__input"
            required
          />
        </label>

        <label className="expense-form__field">
          <span className="expense-form__label">Categoría</span>
          <select
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            className="expense-form__input"
          >
            {GASTO_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="expense-form__field">
          <span className="expense-form__label">Método de pago</span>
          <select
            value={form.paymentMethod}
            onChange={(e) => update('paymentMethod', e.target.value)}
            className="expense-form__input"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>

        <label className="expense-form__field expense-form__field--full">
          <span className="expense-form__label">Nota (opcional)</span>
          <input
            type="text"
            placeholder="Descripción breve…"
            value={form.note}
            onChange={(e) => update('note', e.target.value)}
            className="expense-form__input"
            maxLength={120}
          />
        </label>
      </div>

      <button
        type="submit"
        className="expense-form__submit"
        disabled={submitting}
      >
        {submitting ? 'Guardando…' : '+ Agregar Gasto'}
      </button>
    </form>
  );
}
