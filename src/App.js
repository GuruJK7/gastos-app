import React, { useState } from 'react';
import './App.css';
import { useGastosContext } from './contexts/GastosContext';
import { useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import GastosPage from './pages/GastosPage';
import EstadisticasPage from './pages/EstadisticasPage';

function App() {
  const { loading, error } = useGastosContext();
  const { signInWithGoogle, authLoading, user } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Error con Google Sign-In:', err);
    }
  };

  // Mostrar pantalla de login para usuarios no autenticados
  if (!user && !authLoading) {
    return (
      <div className="login-screen">
        <div className="login-container">
          <div className="login-logo">
            <span>💰</span>
            <h1>FinTracker</h1>
            <p>Gestiona tus finanzas de forma inteligente</p>
          </div>
          <div className="login-content">
            <h2>Bienvenido de vuelta</h2>
            <p>Inicia sesión para continuar con tu control financiero</p>
            <button 
              className="btn-google-signin"
              onClick={handleGoogleSignIn}
            >
              <span>🔗</span>
              Continuar con Google
            </button>
            <div className="login-divider">
              <span>o</span>
            </div>
            <button 
              className="btn-anonymous"
              onClick={handleGoogleSignIn}
            >
              <span>🔓</span>
              Continuar sin cuenta
            </button>
          </div>
          <div className="login-footer">
            <p>✨ Sincronización automática en la nube</p>
            <p>🔒 Tus datos están seguros y encriptados</p>
            <p>📊 Dashboard inteligente con análisis avanzado</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading || authLoading) {
    return (
      <div className="app-loading">
        <div className="loading-animation">
          <div className="loading-spinner"></div>
          <h2>Cargando FinTracker...</h2>
          <p>Preparando tu dashboard financiero</p>
        </div>
      </div>
    );
  }

  // Renderizar contenido según la vista activa
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard setActiveView={setActiveView} />;
      case 'gastos':
        return <GastosPage />;
      case 'estadisticas':
        return <EstadisticasPage />;
      case 'categorias':
        return (
          <div className="coming-soon">
            <span>🏷️</span>
            <h2>Gestión de Categorías</h2>
            <p>Esta función estará disponible próximamente</p>
          </div>
        );
      default:
        return <Dashboard setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="App">
      {error && (
        <div className="global-error">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}
      
      <AppLayout activeView={activeView} setActiveView={setActiveView}>
        {renderContent()}
      </AppLayout>
    </div>
  );
}

export default App;
