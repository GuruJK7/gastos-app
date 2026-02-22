import React, { useMemo, useState } from 'react';
import { useGastosContext } from '../contexts/GastosContext';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart
} from 'recharts';
import '../styles/Estadisticas.css';

const EstadisticasPage = () => {
  const { gastos } = useGastosContext();
  const [vistaGrafico, setVistaGrafico] = useState('linea'); // linea, area, barra

  // Procesar datos
  const estadisticas = useMemo(() => {
    if (gastos.length === 0) return null;

    // Total por categoría
    const porCategoria = gastos.reduce((acc, g) => {
      acc[g.categoria] = (acc[g.categoria] || 0) + parseFloat(g.monto || 0);
      return acc;
    }, {});

    // Evolución temporal
    const porFecha = gastos.reduce((acc, g) => {
      const fecha = g.fecha;
      if (!acc[fecha]) acc[fecha] = 0;
      acc[fecha] += parseFloat(g.monto || 0);
      return acc;
    }, {});

    const evolucionTemporal = Object.entries(porFecha)
      .map(([fecha, monto]) => ({ fecha, monto }))
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    // Por método de pago
    const porMetodo = gastos.reduce((acc, g) => {
      acc[g.metodoPago] = (acc[g.metodoPago] || 0) + parseFloat(g.monto || 0);
      return acc;
    }, {});

    // Análisis por día de la semana
    const porDiaSemana = gastos.reduce((acc, g) => {
      const dia = new Date(g.fecha).toLocaleDateString('es', { weekday: 'long' });
      acc[dia] = (acc[dia] || 0) + parseFloat(g.monto || 0);
      return acc;
    }, {});

    // Comparativa mensual
    const porMes = gastos.reduce((acc, g) => {
      const mes = new Date(g.fecha).toLocaleDateString('es', { month: 'short', year: 'numeric' });
      acc[mes] = (acc[mes] || 0) + parseFloat(g.monto || 0);
      return acc;
    }, {});

    const totalGastado = gastos.reduce((acc, g) => acc + parseFloat(g.monto || 0), 0);
    const promedio = totalGastado / gastos.length;
    const gastoMax = Math.max(...gastos.map(g => parseFloat(g.monto || 0)));
    const gastoMin = Math.min(...gastos.map(g => parseFloat(g.monto || 0)));

    return {
      porCategoria,
      evolucionTemporal,
      porMetodo,
      porDiaSemana,
      porMes,
      totalGastado,
      promedio,
      gastoMax,
      gastoMin,
      cantidadGastos: gastos.length
    };
  }, [gastos]);

  if (!estadisticas) {
    return (
      <div className="estadisticas-empty">
        <span>📊</span>
        <h2>Sin datos para mostrar</h2>
        <p>Agrega algunos gastos para ver tus estadísticas</p>
      </div>
    );
  }

  // Datos para gráficos
  const dataCategorias = Object.entries(estadisticas.porCategoria).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  }));

  const dataMetodos = Object.entries(estadisticas.porMetodo).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  }));

  const dataDiasSemana = Object.entries(estadisticas.porDiaSemana).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  }));

  const dataMeses = Object.entries(estadisticas.porMes).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  }));

  const COLORS = ['#22d3ee', '#a78bfa', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

  return (
    <div className="estadisticas-page">
      {/* KPIs Resumen */}
      <div className="stats-kpi-grid">
        <div className="stats-kpi-card">
          <div className="stats-kpi-icon">💰</div>
          <div className="stats-kpi-content">
            <h3>Total Gastado</h3>
            <p className="stats-kpi-value">${estadisticas.totalGastado.toFixed(2)}</p>
            <span className="stats-kpi-label">{estadisticas.cantidadGastos} transacciones</span>
          </div>
        </div>

        <div className="stats-kpi-card">
          <div className="stats-kpi-icon">📊</div>
          <div className="stats-kpi-content">
            <h3>Promedio</h3>
            <p className="stats-kpi-value">${estadisticas.promedio.toFixed(2)}</p>
            <span className="stats-kpi-label">por transacción</span>
          </div>
        </div>

        <div className="stats-kpi-card">
          <div className="stats-kpi-icon">📈</div>
          <div className="stats-kpi-content">
            <h3>Gasto Máximo</h3>
            <p className="stats-kpi-value">${estadisticas.gastoMax.toFixed(2)}</p>
            <span className="stats-kpi-label">mayor transacción</span>
          </div>
        </div>

        <div className="stats-kpi-card">
          <div className="stats-kpi-icon">📉</div>
          <div className="stats-kpi-content">
            <h3>Gasto Mínimo</h3>
            <p className="stats-kpi-value">${estadisticas.gastoMin.toFixed(2)}</p>
            <span className="stats-kpi-label">menor transacción</span>
          </div>
        </div>
      </div>

      {/* Evolución Temporal */}
      <div className="stats-chart-card">
        <div className="stats-chart-header">
          <h3>📈 Evolución de Gastos</h3>
          <div className="stats-chart-controls">
            <select value={vistaGrafico} onChange={(e) => setVistaGrafico(e.target.value)}>
              <option value="linea">Línea</option>
              <option value="area">Área</option>
              <option value="barra">Barras</option>
            </select>
          </div>
        </div>
        <div className="stats-chart-container">
          <ResponsiveContainer width="100%" height={300}>
            {vistaGrafico === 'linea' ? (
              <LineChart data={estadisticas.evolucionTemporal}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.1)" />
                <XAxis dataKey="fecha" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(34, 211, 238, 0.2)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => `$${value.toFixed(2)}`}
                />
                <Legend />
                <Line type="monotone" dataKey="monto" stroke="#22d3ee" strokeWidth={3} name="Gasto ($)" />
              </LineChart>
            ) : vistaGrafico === 'area' ? (
              <AreaChart data={estadisticas.evolucionTemporal}>
                <defs>
                  <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.1)" />
                <XAxis dataKey="fecha" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(34, 211, 238, 0.2)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => `$${value.toFixed(2)}`}
                />
                <Area type="monotone" dataKey="monto" stroke="#22d3ee" fillOpacity={1} fill="url(#colorMonto)" name="Gasto ($)" />
              </AreaChart>
            ) : (
              <BarChart data={estadisticas.evolucionTemporal}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.1)" />
                <XAxis dataKey="fecha" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(34, 211, 238, 0.2)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => `$${value.toFixed(2)}`}
                />
                <Bar dataKey="monto" fill="#22d3ee" name="Gasto ($)" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráficos en Grid */}
      <div className="stats-charts-grid">
        {/* Distribución por Categoría */}
        <div className="stats-chart-card">
          <div className="stats-chart-header">
            <h3>🏷️ Por Categoría</h3>
          </div>
          <div className="stats-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataCategorias}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataCategorias.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(34, 211, 238, 0.2)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => `$${value.toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Por Método de Pago */}
        <div className="stats-chart-card">
          <div className="stats-chart-header">
            <h3>💳 Por Método de Pago</h3>
          </div>
          <div className="stats-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataMetodos}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(34, 211, 238, 0.2)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => `$${value.toFixed(2)}`}
                />
                <Bar dataKey="value" fill="#a78bfa" name="Total ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Por Día de la Semana */}
        <div className="stats-chart-card">
          <div className="stats-chart-header">
            <h3>📅 Por Día de la Semana</h3>
          </div>
          <div className="stats-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataDiasSemana}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(34, 211, 238, 0.2)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => `$${value.toFixed(2)}`}
                />
                <Bar dataKey="value" fill="#10b981" name="Total ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comparativa Mensual */}
        <div className="stats-chart-card">
          <div className="stats-chart-header">
            <h3>📊 Comparativa Mensual</h3>
          </div>
          <div className="stats-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataMeses}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(34, 211, 238, 0.2)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => `$${value.toFixed(2)}`}
                />
                <Bar dataKey="value" fill="#f59e0b" name="Total ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Gastos */}
      <div className="stats-chart-card">
        <div className="stats-chart-header">
          <h3>🏆 Top 10 Gastos Más Grandes</h3>
        </div>
        <div className="stats-top-list">
          {[...gastos]
            .sort((a, b) => parseFloat(b.monto) - parseFloat(a.monto))
            .slice(0, 10)
            .map((gasto, index) => (
              <div key={gasto.id} className="stats-top-item">
                <div className="stats-top-rank">#{index + 1}</div>
                <div className="stats-top-info">
                  <h4>{gasto.descripcion || gasto.categoria}</h4>
                  <p>{gasto.fecha} • {gasto.categoria}</p>
                </div>
                <div className="stats-top-amount">${parseFloat(gasto.monto).toFixed(2)}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default EstadisticasPage;
