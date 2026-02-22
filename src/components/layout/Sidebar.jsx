import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Sidebar.css';

const Sidebar = ({ activeView, setActiveView, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', description: 'Vista general' },
    { id: 'gastos', icon: '💰', label: 'Gastos', description: 'Gestionar gastos' },
    { id: 'estadisticas', icon: '📈', label: 'Estadísticas', description: 'Análisis detallado' },
    { id: 'categorias', icon: '🏷️', label: 'Categorías', description: 'Personalizar' },
  ];

  const handleMenuClick = (viewId) => {
    setActiveView(viewId);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'sidebar-mobile-open' : ''}`}>
        {/* Header del Sidebar */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="sidebar-logo-icon">💰</span>
            <div className="sidebar-logo-text">
              <h1>FinTracker</h1>
              <p>Control Total</p>
            </div>
          </div>
          <button 
            className="sidebar-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* User Info */}
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.isAnonymous ? '👤' : '👨‍💼'}
          </div>
          <div className="sidebar-user-info">
            <h3>{user?.isAnonymous ? 'Usuario Anónimo' : user?.email}</h3>
            <p>{user?.isAnonymous ? 'Sesión temporal' : 'Cuenta verificada'}</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-section-label">MENÚ PRINCIPAL</div>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.id)}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <div className="sidebar-nav-content">
                <span className="sidebar-nav-label-text">{item.label}</span>
                <span className="sidebar-nav-description">{item.description}</span>
              </div>
              {activeView === item.id && (
                <span className="sidebar-nav-indicator"></span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer con acciones */}
        <div className="sidebar-footer">
          <button className="sidebar-footer-btn" onClick={logout}>
            <span className="sidebar-footer-icon">🚪</span>
            <span>Cerrar Sesión</span>
          </button>
          <div className="sidebar-footer-info">
            <small>v1.0.0 © 2026 FinTracker</small>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
