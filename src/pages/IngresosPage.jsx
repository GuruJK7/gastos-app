// src/pages/IngresosPage.jsx
import React, { useState, useCallback } from 'react';
import { useIngresos } from '../features/ingresos/hooks/useIngresos';
import IngresoForm from '../features/ingresos/components/IngresoForm';
import IngresoList from '../features/ingresos/components/IngresoList';
import './GastosPage.css';

export default function IngresosPage() {
  const { ingresos, loading, error, submitting, create, update, remove } = useIngresos();
  const [editing, setEditing] = useState(null);

  const handleSubmit = useCallback(async (draft) => {
    if (editing) {
      await update(editing.id, draft);
      setEditing(null);
    } else {
      await create(draft);
    }
  }, [editing, update, create]);

  const handleCancelEdit = useCallback(() => {
    setEditing(null);
  }, []);

  return (
    <section className="page gastos-page">
      <div className="gastos-page__header">
        <h1 className="gastos-page__title">Ingresos</h1>
        <p className="gastos-page__subtitle">Registra y gestiona tus ingresos</p>
      </div>

      {error && (
        <div className="gastos-page__error">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="gastos-page__grid">
        <IngresoForm
          onSubmit={handleSubmit}
          submitting={submitting}
          editing={editing}
          onCancelEdit={handleCancelEdit}
        />
        <IngresoList
          ingresos={ingresos}
          onDelete={remove}
          onEdit={setEditing}
          loading={loading}
        />
      </div>
    </section>
  );
}
