import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import '../../styles/AppLayout.css';

const AppLayout = ({ children, activeView, setActiveView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Sidebar Desktop */}
      <Sidebar 
        activeView={activeView}
        setActiveView={setActiveView}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="app-main">
        {/* Top Bar */}
        <header className="app-topbar">
          <button 
            className="app-menu-toggle"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="app-topbar-title">
            <h2>{getViewTitle(activeView)}</h2>
            <p>{getViewDescription(activeView)}</p>
          </div>
          <div className="app-topbar-actions">
            <button className="app-topbar-btn">
              <span>🔔</span>
            </button>
            <button className="app-topbar-btn">
              <span>❓</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="app-content">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

// Helper functions
const getViewTitle = (view) => {
  const titles = {
    dashboard: '📊 Dashboard',
    gastos: '💰 Gestión de Gastos',
    estadisticas: '📈 Estadísticas Avanzadas',
    categorias: '🏷️ Categorías',
  };
  return titles[view] || '📊 Dashboard';
};

const getViewDescription = (view) => {
  const descriptions = {
    dashboard: 'Vista general de tus finanzas',
    gastos: 'Administra y registra tus gastos',
    estadisticas: 'Análisis detallado de tus finanzas',
    categorias: 'Personaliza tus categorías',
  };
  return descriptions[view] || 'Vista general de tus finanzas';
};

export default AppLayout;
