import React from 'react';

export function ChartsSection({ gastos }) {
  const gastosPorCategoria = {};
  gastos.forEach(g => {
    gastosPorCategoria[g.categoria] = (gastosPorCategoria[g.categoria] || 0) + parseFloat(g.monto || 0);
  });

  const gastosPorMetodo = {};
  gastos.forEach(g => {
    gastosPorMetodo[g.metodoPago] = (gastosPorMetodo[g.metodoPago] || 0) + parseFloat(g.monto || 0);
  });

  const getBarChart = (data, title) => {
    const maxValue = Math.max(...Object.values(data), 1);
    return (
      <div className="chart">
        <h3>{title}</h3>
        <div className="chart-bars">
          {Object.entries(data).map(([label, value]) => (
            <div key={label} className="bar-item">
              <div className="bar-label">{label}</div>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ width: `${(value / maxValue) * 100}%` }}
                >
                  ${value.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="card">
      <h2 className="card-title">📈 Análisis por Gráficos</h2>
      <div className="charts-container">
        {Object.keys(gastosPorCategoria).length > 0 ? (
          getBarChart(gastosPorCategoria, 'Gastos por Categoría')
        ) : (
          <p className="no-data">No hay datos para mostrar</p>
        )}
        {Object.keys(gastosPorMetodo).length > 0 ? (
          getBarChart(gastosPorMetodo, 'Gastos por Método de Pago')
        ) : (
          <p className="no-data">No hay datos para mostrar</p>
        )}
      </div>
    </section>
  );
}
