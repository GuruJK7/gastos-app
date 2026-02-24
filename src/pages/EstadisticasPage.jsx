import React, { useState } from 'react';
import { useGastos } from '../features/gastos/hooks/useGastos';
import { useIngresosMes } from '../features/ingresos/hooks/useIngresosMes';
import { useEstadisticas } from '../features/estadisticas/hooks/useEstadisticas';
import TendenciaChart from '../features/estadisticas/components/TendenciaChart';
import ResumenCard from '../features/estadisticas/components/ResumenCard';
import DistribucionDonut from '../features/estadisticas/components/DistribucionDonut';
import IngresosVsGastosChart from '../features/estadisticas/components/IngresosVsGastosChart';
import './EstadisticasPage.css';

const PERIODS = [
  { value: 'month', label: 'Mensual' },
  { value: 'quarter', label: 'Trimestral' },
  { value: 'year', label: 'Anual' },
];

export default function EstadisticasPage() {
  const { gastos } = useGastos();
  const { ingresos } = useIngresosMes();
  const [period, setPeriod] = useState('month');

  const { dailyPoints, categoryTotals, summary, comparisonSeries } = useEstadisticas({
    gastos,
    ingresos,
    period,
  });

  return (
    <div className="estadisticas-page">
      {/* Header row */}
      <div className="estadisticas-header">
        <h1 className="estadisticas-header__title">Estadísticas</h1>

        <div className="estadisticas-period glass">
          {PERIODS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`estadisticas-period__btn${
                period === value ? ' estadisticas-period__btn--active' : ''
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="estadisticas-grid">
        {/* Tendencia – top left, span 8 */}
        <div className="estadisticas-grid__wide">
          <div className="glass estadisticas-card">
            <TendenciaChart points={dailyPoints} title="Tendencia de gastos" />
          </div>
        </div>

        {/* Resumen – top right, span 4 */}
        <div className="estadisticas-grid__narrow">
          <div className="glass estadisticas-card">
            <ResumenCard summary={summary} />
          </div>
        </div>

        {/* Ingresos vs Gastos – bottom left, span 8 */}
        <div className="estadisticas-grid__wide">
          <div className="glass estadisticas-card">
            <IngresosVsGastosChart data={comparisonSeries} />
          </div>
        </div>

        {/* Distribución donut – bottom right, span 4 */}
        <div className="estadisticas-grid__narrow">
          <div className="glass estadisticas-card">
            <DistribucionDonut data={categoryTotals} />
          </div>
        </div>
      </div>
    </div>
  );
}
