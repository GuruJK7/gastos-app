import React from 'react';
import '../../styles/MobileNav.css';

const MobileNav = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Inicio' },
    { id: 'gastos', icon: '💰', label: 'Gastos' },
    { id: 'estadisticas', icon: '📈', label: 'Stats' },
    { id: 'categorias', icon: '⚙️', label: 'Más' },
  ];

  return (
    <nav className="mobile-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`mobile-nav-item ${activeView === item.id ? 'active' : ''}`}
          onClick={() => setActiveView(item.id)}
        >
          <span className="mobile-nav-icon">{item.icon}</span>
          <span className="mobile-nav-label">{item.label}</span>
          {activeView === item.id && <span className="mobile-nav-indicator"></span>}
        </button>
      ))}
    </nav>
  );
};

export default MobileNav;
