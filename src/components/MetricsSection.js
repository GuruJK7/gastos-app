import React, { useMemo } from 'react';

export function MetricsSection({ gastos = [], isMobile }) {
  // Memoizar cálculos para evitar recálculos innecesarios
  const metrics = useMemo(() => {
    if (!Array.isArray(gastos) || gastos.length === 0) {
      return {
        totalGastos: 0,
        promedio: 0,
        gastosMaximo: 0,
        gastoMinimo: 0,
        categoriaMaxima: { cat: 'N/A', monto: 0 },
        totalRegistros: 0
      };
    }

    const totalGastos = gastos.reduce((sum, g) => {
      const monto = parseFloat(g.monto) || 0;
      return sum + monto;
    }, 0);

    const promedio = gastos.length > 0 ? totalGastos / gastos.length : 0;

    // Calcular gastos por categoría
    const gastosPorCategoria = gastos.reduce((acc, g) => {
      const categoria = g.categoria || 'Sin categoría';
      const monto = parseFloat(g.monto) || 0;
      acc[categoria] = (acc[categoria] || 0) + monto;
      return acc;
    }, {});

    const categoriaMaxima = Object.entries(gastosPorCategoria).length > 0
      ? Object.entries(gastosPorCategoria).reduce((max, [cat, monto]) => 
          monto > max.monto ? { cat, monto } : max
        )
      : { cat: 'N/A', monto: 0 };

    const montos = gastos.map(g => parseFloat(g.monto) || 0);
    const gastosMaximo = montos.length > 0 ? Math.max(...montos) : 0;
    const gastoMinimo = montos.length > 0 ? Math.min(...montos) : 0;

    return {
      totalGastos,
      promedio,
      gastosMaximo,
      gastoMinimo,
      categoriaMaxima,
      totalRegistros: gastos.length
    };
  }, [gastos]);

  return (
    <section className="card">
      <h2 className="card-title">📊 Resumen de Gastos</h2>
      <div className={isMobile ? 'metrics-grid-mobile' : 'metrics-grid'}>
        <div className="metric">
          <div className="metric-label">Total Gastos</div>
          <div className="metric-value">${metrics.totalGastos.toFixed(2)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Promedio</div>
          <div className="metric-value">${metrics.promedio.toFixed(2)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Máximo</div>
          <div className="metric-value">${metrics.gastosMaximo.toFixed(2)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Mínimo</div>
          <div className="metric-value">${metrics.gastoMinimo.toFixed(2)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Categoría Mayor</div>
          <div className="metric-value">{metrics.categoriaMaxima.cat}</div>
          <div className="metric-sublabel">${metrics.categoriaMaxima.monto.toFixed(2)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Total Registros</div>
          <div className="metric-value">{metrics.totalRegistros}</div>
        </div>
      </div>
    </section>
  );
}
