import React, { useState } from 'react';
import StatCard from './StatCard';
import RecentActivity from './RecentActivity';
import CategoryDonut from './CategoryDonut';
import MonthlySpendChart from './MonthlySpendChart';
import QuickAddExpenseButton from './QuickAddExpenseButton';
import Modal from '../ui/Modal';
import QuickExpenseForm from '../../features/gastos/components/QuickExpenseForm';
import EditPresupuestoModal from '../../features/presupuesto/components/EditPresupuestoModal';
import './DashboardGrid.css';

export default function DashboardGrid({ stats, loading, onRefresh, presupuesto, onEditPresupuesto, gastos, onNavigateIngresos, monthlySpendPoints, monthLabel }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const fmt = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <div className="dashboard-grid">
      <StatCard
        title="Gastos del Mes"
        value={loading ? '—' : fmt(stats.totalSpent)}
        subtitle={loading ? 'Cargando…' : `${stats.txCount} transacciones · ${stats.uniqueDays} días activos`}
        sparkline={stats.spentSpark}
      />
      <StatCard
        title="Ingresos del Mes"
        value={loading ? '—' : fmt(stats.ingresosDelMes)}
        trend={loading ? null : { value: 'Mensual', positive: true }}
        sparkline={[stats.ingresosDelMes, stats.ingresosDelMes]}
        onClick={onNavigateIngresos}
      />
      <StatCard
        title="Presupuesto"
        value={loading ? '—' : fmt(stats.budget)}
        trend={loading ? null : { value: 'Mensual', positive: true }}
        sparkline={[stats.budget, stats.budget]}
        onEdit={() => setBudgetModalOpen(true)}
      />
      <StatCard
        title="Disponible"
        value={loading ? '—' : fmt(stats.available)}
        trend={loading ? null : { value: stats.available >= 0 ? 'Positivo' : 'Negativo', positive: stats.available >= 0 }}
        sparkline={stats.availSpark}
      />

      <div className="dashboard-grid__bottom-left">
        <MonthlySpendChart points={loading ? [] : monthlySpendPoints} monthLabel={monthLabel} />
      </div>
      <div className="dashboard-grid__bottom-right">
        <CategoryDonut categories={loading ? [] : stats.categories} loading={loading} />
      </div>
      <div className="dashboard-grid__full-width">
        <RecentActivity transactions={loading ? [] : stats.recent} loading={loading} />
      </div>

      <QuickAddExpenseButton onClick={() => setModalOpen(true)} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <QuickExpenseForm
          onCreated={onRefresh}
          onClose={() => setModalOpen(false)}
        />
      </Modal>

      <EditPresupuestoModal
        open={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        currentAmount={presupuesto.amount}
        onSave={onEditPresupuesto}
      />
    </div>
  );
}
