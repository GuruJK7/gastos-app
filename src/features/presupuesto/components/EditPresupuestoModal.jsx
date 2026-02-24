// src/features/presupuesto/components/EditPresupuestoModal.jsx
// ─── Edit Presupuesto Modal ──────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';

/**
 * @param {{ open: boolean, onClose: () => void, currentAmount: number|null, onSave: (amount: number) => Promise<void> }} props
 */
export default function EditPresupuestoModal({ open, onClose, currentAmount, onSave }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValue(currentAmount != null ? String(currentAmount) : '');
      setError('');
    }
  }, [open, currentAmount]);

  async function handleSubmit(e) {
    e.preventDefault();
    const amt = parseFloat(value);
    if (!amt || amt <= 0) {
      setError('El monto debe ser mayor a $0');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(amt);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar presupuesto');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Editar Presupuesto Mensual
        </h3>

        {error && (
          <p style={{
            fontSize: '0.75rem', color: 'var(--danger)',
            background: 'var(--danger-muted)', padding: '0.375rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
          }}>{error}</p>
        )}

        <label className="expense-form__field">
          <span className="expense-form__label">Monto mensual ($)</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="2500.00"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(''); }}
            className="expense-form__input"
            required
            autoFocus
          />
        </label>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 500,
              color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button type="submit" className="expense-form__submit" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
