import React from 'react';
import { useGastos } from '../features/gastos/hooks/useGastos';
import ExpenseForm from '../features/gastos/components/ExpenseForm';
import ExpenseList from '../features/gastos/components/ExpenseList';
import './GastosPage.css';

export default function GastosPage() {
  const { gastos, loading, error, submitting, create, remove } = useGastos();

  return (
    <section className="page gastos-page">
      <div className="gastos-page__header">
        <h1 className="gastos-page__title">Gastos</h1>
        <p className="gastos-page__subtitle">Registra y gestiona tus gastos diarios</p>
      </div>

      {error && (
        <div className="gastos-page__error">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="gastos-page__grid">
        <ExpenseForm onSubmit={create} submitting={submitting} />
        <ExpenseList gastos={gastos} onDelete={remove} loading={loading} />
      </div>
    </section>
  );
}
