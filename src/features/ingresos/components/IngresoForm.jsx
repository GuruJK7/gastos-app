// src/features/ingresos/components/IngresoForm.jsx
// ─── Ingreso Creation / Edit Form ───────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { INGRESO_CATEGORIES, INGRESO_SOURCES, SUPPORTED_CURRENCIES } from '../types';
import { UYU_PER_USD } from '../../../lib/constants';

/**
 * @param {{ onSubmit: (draft: object) => Promise<void>, submitting: boolean, editing?: import('../types').Ingreso|null, onCancelEdit?: () => void }} props
 */
export default function IngresoForm({ onSubmit, submitting, editing, onCancelEdit }) {
  const empty = {
    monto: '',
    fecha: new Date().toISOString().slice(0, 10),
    categoria: 'Otro',
    nota: '',
    currency: 'USD',
    source: 'Sueldo',
  };

  const [form, setForm] = useState(empty);
  const [fieldError, setFieldError] = useState('');

  // When editing changes, populate the form
  useEffect(() => {
    if (editing) {
      setForm({
        monto: String(editing.monto),
        fecha: editing.fecha,
        categoria: editing.categoria || 'Otro',
        nota: editing.nota || '',
        currency: editing.currency || 'USD',
        source: editing.source || 'Sueldo',
      });
    } else {
      setForm(empty);
    }
    setFieldError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const amt = parseFloat(form.monto);
    if (!amt || amt <= 0) {
      setFieldError('El monto debe ser mayor a 0');
      return;
    }
    if (!form.fecha) {
      setFieldError('La fecha es requerida');
      return;
    }
    try {
      await onSubmit({
        monto: amt,
        fecha: form.fecha,
        categoria: form.categoria || undefined,
        nota: form.nota.trim() || undefined,
        currency: form.currency,
        exchangeRate: UYU_PER_USD,
        source: form.source || form.categoria || 'Otro',
      });
      if (!editing) setForm(empty);
    } catch {
      // error handled by hook
    }
  }

  return (
    <form className="expense-form glass" onSubmit={handleSubmit}>
      <h3 className="expense-form__title">
        {editing ? 'Editar Ingreso' : 'Nuevo Ingreso'}
      </h3>

      {fieldError && <p className="expense-form__error">{fieldError}</p>}

      <div className="expense-form__grid">
        <label className="expense-form__field">
          <span className="expense-form__label">Monto ($)</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={form.monto}
            onChange={(e) => update('monto', e.target.value)}
            className="expense-form__input"
            required
          />
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

        <label className="expense-form__field">
          <span className="expense-form__label">Fecha</span>
          <input
            type="date"
            value={form.fecha}
            onChange={(e) => update('fecha', e.target.value)}
            className="expense-form__input"
            required
          />
        </label>

        <label className="expense-form__field">
          <span className="expense-form__label">Fuente</span>
          <select
            value={form.source}
            onChange={(e) => update('source', e.target.value)}
            className="expense-form__input"
          >
            {INGRESO_SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <label className="expense-form__field">
          <span className="expense-form__label">Categoría (opcional)</span>
          <select
            value={form.categoria}
            onChange={(e) => update('categoria', e.target.value)}
            className="expense-form__input"
          >
            {INGRESO_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="expense-form__field">
          <span className="expense-form__label">Nota (opcional)</span>
          <input
            type="text"
            placeholder="Descripción breve…"
            value={form.nota}
            onChange={(e) => update('nota', e.target.value)}
            className="expense-form__input"
            maxLength={120}
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="submit"
          className="expense-form__submit"
          disabled={submitting}
        >
          {submitting
            ? 'Guardando…'
            : editing
              ? '✓ Guardar Cambios'
              : '+ Agregar Ingreso'}
        </button>
        {editing && onCancelEdit && (
          <button
            type="button"
            className="expense-form__submit"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-default)' }}
            onClick={onCancelEdit}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
