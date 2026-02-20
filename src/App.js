import React, { useState, useEffect } from 'react';
import './App.css';
import { 
  PieChart, Pie, LineChart, Line, CartesianGrid, XAxis, YAxis, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { CSVLink } from 'react-csv';
import { useGastos } from './hooks/useGastos';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { CONFIG } from './config';

function App() {
  const { gastos, loading, error, addGasto, clearAllGastos, user } = useGastos();
  const [newGasto, setNewGasto] = useState({
    fecha: new Date().toISOString().split('T')[0],
    monto: '',
    categoria: '',
    subcategoria: '',
    metodoPago: '',
    descripcion: ''
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Manejar cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewGasto({ ...newGasto, [name]: value });
  };

  // Registrar nuevo gasto
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newGasto.monto || !newGasto.categoria || !newGasto.metodoPago) {
      alert('Por favor completa los campos requeridos');
      return;
    }
    try {
      await addGasto(newGasto);
      setNewGasto({
        fecha: new Date().toISOString().split('T')[0],
        monto: '',
        categoria: '',
        subcategoria: '',
        metodoPago: '',
        descripcion: ''
      });
    } catch (err) {
      alert('Error al registrar el gasto: ' + err.message);
    }
  };

  // Cargar datos de demostración
  const handleDemoData = async () => {
    const demoGastos = [
      { fecha: '2026-02-10', monto: 50, categoria: 'Comida', metodoPago: 'Efectivo', subcategoria: 'Restaurante', descripcion: 'Almuerzo' },
      { fecha: '2026-02-10', monto: 30, categoria: 'Transporte', metodoPago: 'Débito', subcategoria: 'Taxi', descripcion: 'Viaje al trabajo' },
      { fecha: '2026-02-15', monto: 80, categoria: 'Suscripciones', metodoPago: 'Crédito', subcategoria: 'Streaming', descripcion: 'Netflix Premium' },
      { fecha: '2026-02-17', monto: 15, categoria: 'Hogar', metodoPago: 'Transferencia', subcategoria: 'Limpieza', descripcion: 'Productos de limpieza' },
      { fecha: '2026-02-18', monto: 120, categoria: 'Supermercado', metodoPago: 'Débito', subcategoria: 'Alimentos', descripcion: 'Compra semanal' },
      { fecha: '2026-02-19', monto: 45, categoria: 'Ocio', metodoPago: 'Efectivo', subcategoria: 'Cine', descripcion: 'Entrada cine' }
    ];
    for (const gasto of demoGastos) {
      try {
        await addGasto(gasto);
      } catch (err) {
        console.error('Error agregando demo data:', err);
      }
    }
  };

  // Limpiar todos los datos
  const clearData = async () => {
    if (window.confirm('¿Estás seguro de que deseas limpiar todos los gastos?')) {
      try {
        await clearAllGastos();
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  // Calcular métricas
  const totalGastado = gastos.reduce((acc, gasto) => acc + parseFloat(gasto.monto || 0), 0);
  const diasUnicos = new Set(gastos.map(g => g.fecha)).size;
  const promedioDiario = diasUnicos > 0 ? totalGastado / diasUnicos : 0;
  const gastoPromedio = gastos.length > 0 ? totalGastado / gastos.length : 0;

  // Preparar datos para gráficos
  const historialPorFechas = gastos.reduce((acc, gasto) => {
    const fecha = gasto.fecha;
    if (!acc[fecha]) acc[fecha] = 0;
    acc[fecha] += parseFloat(gasto.monto || 0);
    return acc;
  }, {});

  const dataFechas = Object.entries(historialPorFechas)
    .map(([fecha, monto]) => ({ fecha, monto }))
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const datoCategorias = Object.entries(
    gastos.reduce((acc, gasto) => {
      if (!acc[gasto.categoria]) acc[gasto.categoria] = 0;
      acc[gasto.categoria] += parseFloat(gasto.monto || 0);
      return acc;
    }, {})
  ).map(([categoria, monto]) => ({ name: categoria, value: monto }));

  const COLORS = ['#22d3ee', '#a78bfa', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

  // Configuración de gráficos responsive
  const chartHeight = isMobile ? 250 : 300;
  const pieRadius = isMobile ? 60 : 80;

  if (loading) {
    return (
      <div className="App" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</p>
          <h2 style={{ color: '#22d3ee' }}>Cargando...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* ════════════════════════════════════════════════════════════
          HEADER PRINCIPAL
          ════════════════════════════════════════════════════════════ */}
      <header className="header-container">
        <div className="header-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>💰 Gestor de Gastos Premium</h1>
            <p>Dashboard financiero inteligente | Sigue tus gastos en tiempo real</p>
            {CONFIG.DEV_MODE && (
              <p style={{ fontSize: '0.85rem', color: '#a78bfa', marginTop: '0.5rem' }}>
                🔧 Modo desarrollo activado - Usuario: {user?.firstName || user?.id}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {CONFIG.DEV_MODE ? (
              // En modo desarrollo, mostrar usuario mock sin opciones de Clerk
              <div style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(167, 139, 250, 0.1)',
                border: '1px solid rgba(167, 139, 250, 0.3)',
                borderRadius: '0.5rem',
                color: '#a78bfa',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                ✅ Admin conectado
              </div>
            ) : (
              // En producción, usar Clerk
              <>
                <SignedOut>
                  <SignInButton mode="modal" />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════
          CONTENEDOR PRINCIPAL
          ════════════════════════════════════════════════════════════ */}
      <main className="dashboard-container">

        {error && (
          <section className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <p style={{ color: '#ef4444', margin: 0 }}>⚠️ {error}</p>
          </section>
        )}

        {/* ────────────────────────────────────────────────────────────
            SECCIÓN 1: FORMULARIO DE REGISTRO
            ──────────────────────────────────────────────────────────── */}
        <section className="card">
          <h2 className="card-title">📝 Registrar Nuevo Gasto</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="fecha">Fecha</label>
                <input
                  id="fecha"
                  type="date"
                  name="fecha"
                  value={newGasto.fecha}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="monto">Monto ($)</label>
                <input
                  id="monto"
                  type="number"
                  name="monto"
                  value={newGasto.monto}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="categoria">Categoría</label>
                <select
                  id="categoria"
                  name="categoria"
                  value={newGasto.categoria}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="Comida">🍽️ Comida</option>
                  <option value="Supermercado">🛒 Supermercado</option>
                  <option value="Transporte">🚗 Transporte</option>
                  <option value="Hogar">🏠 Hogar</option>
                  <option value="Salud">🏥 Salud</option>
                  <option value="Suscripciones">📱 Suscripciones</option>
                  <option value="Ocio">🎬 Ocio</option>
                  <option value="Ropa">👕 Ropa</option>
                  <option value="Educación">📚 Educación</option>
                  <option value="Impuestos">📋 Impuestos</option>
                  <option value="Otros">📦 Otros</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="subcategoria">Subcategoría</label>
                <input
                  id="subcategoria"
                  type="text"
                  name="subcategoria"
                  placeholder="Ej: Restaurante, Taxi, etc."
                  value={newGasto.subcategoria}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="metodoPago">Método de Pago</label>
                <select
                  id="metodoPago"
                  name="metodoPago"
                  value={newGasto.metodoPago}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona método</option>
                  <option value="Efectivo">💵 Efectivo</option>
                  <option value="Débito">💳 Débito</option>
                  <option value="Crédito">💎 Crédito</option>
                  <option value="Transferencia">🏦 Transferencia</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <input
                  id="descripcion"
                  type="text"
                  name="descripcion"
                  placeholder="Detalles adicionales"
                  value={newGasto.descripcion}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="btn-group">
              <button type="submit" className="btn-primary">
                ✓ Registrar Gasto
              </button>
              <button type="button" className="btn-secondary" onClick={handleDemoData}>
                📊 Cargar Datos Demo
              </button>
              <button type="button" className="btn-danger" onClick={clearData}>
                🗑️ Limpiar Todo
              </button>
            </div>
          </form>
        </section>

        {/* ────────────────────────────────────────────────────────────
            SECCIÓN 2: MÉTRICAS PRINCIPALES (KPI)
            ──────────────────────────────────────────────────────────── */}
        <section className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Total Gastado</div>
            <div className="metric-value">${totalGastado.toFixed(2)}</div>
            <p>en {gastos.length} {gastos.length === 1 ? 'transacción' : 'transacciones'}</p>
          </div>

          <div className="metric-card">
            <div className="metric-label">Promedio Diario</div>
            <div className="metric-value">${promedioDiario.toFixed(2)}</div>
            <p>en {diasUnicos} {diasUnicos === 1 ? 'día' : 'días'}</p>
          </div>

          <div className="metric-card">
            <div className="metric-label">Gasto Promedio</div>
            <div className="metric-value">${gastoPromedio.toFixed(2)}</div>
            <p>por transacción</p>
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────
            SECCIÓN 3: GRÁFICOS
            ──────────────────────────────────────────────────────────── */}
        
        {dataFechas.length > 0 && (
          <section className="card">
            <h2 className="card-title">📈 Evolución Diaria de Gastos</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={chartHeight}>
                <LineChart 
                  data={dataFechas} 
                  margin={{ 
                    top: 5, 
                    right: isMobile ? 10 : 30, 
                    left: isMobile ? 0 : 0, 
                    bottom: isMobile ? 0 : 5 
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.1)" />
                  <XAxis 
                    dataKey="fecha" 
                    stroke="#94a3b8"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    angle={isMobile ? -45 : 0}
                    height={isMobile ? 60 : 30}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(34, 211, 238, 0.2)',
                      borderRadius: '0.5rem',
                      padding: '8px'
                    }}
                    labelStyle={{ color: '#22d3ee' }}
                    formatter={(value) => `$${value.toFixed(2)}`}
                  />
                  {!isMobile && <Legend />}
                  <Line 
                    type="monotone" 
                    dataKey="monto" 
                    stroke="#22d3ee" 
                    strokeWidth={isMobile ? 2 : 3}
                    dot={{ fill: '#22d3ee', r: isMobile ? 3 : 5 }}
                    activeDot={{ r: isMobile ? 5 : 7 }}
                    name="Gasto ($)"
                    isAnimationActive={!isMobile}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {datoCategorias.length > 0 && (
          <section className="card">
            <h2 className="card-title">🎯 Distribución por Categoría</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={chartHeight}>
                <PieChart>
                  <Pie
                    data={datoCategorias}
                    cx="50%"
                    cy="50%"
                    labelLine={!isMobile}
                    label={!isMobile ? ({ name, value }) => `${name}: $${value.toFixed(2)}` : false}
                    outerRadius={pieRadius}
                    fill="#22d3ee"
                    dataKey="value"
                  >
                    {datoCategorias.map((entry, index) => (
                      <circle key={`color-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(34, 211, 238, 0.2)',
                      borderRadius: '0.5rem',
                      padding: '8px'
                    }}
                    formatter={(value) => `$${value.toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* ────────────────────────────────────────────────────────────
            SECCIÓN 4: TABLA DE GASTOS
            ──────────────────────────────────────────────────────────── */}
        {gastos.length > 0 && (
          <section className="card">
            <h2 className="card-title">📋 Historial de Gastos</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>📅 Fecha</th>
                    <th>💰 Monto</th>
                    <th>🏷️ Categoría</th>
                    <th>📝 Subcategoría</th>
                    <th>💳 Método</th>
                    <th>📄 Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {gastos
                    .slice()
                    .reverse()
                    .map((gasto, index) => (
                      <tr key={gasto.id || index}>
                        <td>{gasto.fecha}</td>
                        <td className="amount">${parseFloat(gasto.monto).toFixed(2)}</td>
                        <td>{gasto.categoria}</td>
                        <td>{gasto.subcategoria || '—'}</td>
                        <td>{gasto.metodoPago}</td>
                        <td>{gasto.descripcion || '—'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="btn-group" style={{ marginTop: '1.5rem' }}>
              <CSVLink 
                data={gastos} 
                filename={`gastos-${new Date().toISOString().split('T')[0]}.csv`}
                style={{ textDecoration: 'none', flex: 1 }}
              >
                <button type="button" className="btn-secondary" style={{ width: '100%' }}>
                  📥 Exportar a CSV
                </button>
              </CSVLink>
            </div>
          </section>
        )}

        {/* ────────────────────────────────────────────────────────────
            ESTADO VACÍO
            ──────────────────────────────────────────────────────────── */}
        {gastos.length === 0 && (
          <section className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</p>
            <h3 style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '1.1rem' }}>
              Sin gastos registrados
            </h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Registra tu primer gasto o carga los datos de demostración para comenzar
            </p>
            <button type="button" className="btn-secondary" onClick={handleDemoData}>
              📊 Cargar Datos Demo
            </button>
          </section>
        )}

      </main>
    </div>
  );
}

export default App;
