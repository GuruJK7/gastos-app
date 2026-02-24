import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import './Sidebar.css';

const MAIN_NAV = [
  { to: '/',             label: 'Dashboard',   icon: '📊' },
  { to: '/gastos',       label: 'Gastos',      icon: '💳' },
  { to: '/ingresos',     label: 'Ingresos',    icon: '💵' },
  { to: '/estadisticas', label: 'Estadísticas', icon: '📈' },
  { to: '/categorias',   label: 'Categorías',  icon: '🏷️' },
  { to: '/presupuesto',  label: 'Presupuesto', icon: '🎯' },
];

const GESTION_NAV = [
  { to: '/transacciones', label: 'Transacciones', icon: '📋' },
  { to: '/reportes',      label: 'Reportes',      icon: '📄' },
  { to: '/ajustes',       label: 'Ajustes',       icon: '⚙️' },
];

function NavSection({ title, items }) {
  return (
    <div className="sidebar__section">
      <span className="sidebar__section-title">{title}</span>
      <nav className="sidebar__nav">
        {items.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <span className="sidebar__link-icon">{icon}</span>
            <span className="sidebar__link-label">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuthStore();

  return (
    <aside className="sidebar glass-elevated">
      {/* Logo */}
      <div className="sidebar__logo">
        <span className="sidebar__logo-icon">💰</span>
        <span className="sidebar__logo-text">FinTracker</span>
      </div>

      {/* User mini card */}
      <div className="sidebar__user">
        <div className="sidebar__avatar">{user?.isAnonymous ? '👤' : '🧑'}</div>
        <div className="sidebar__user-info">
          <span className="sidebar__user-name">{user?.displayName ?? 'Sin sesión'}</span>
          <span className="sidebar__user-role">
            {user?.isAnonymous ? 'Sesión temporal' : 'Cuenta vinculada'}
          </span>
        </div>
      </div>

      <div className="sidebar__separator" />

      {/* Navigation sections */}
      <div className="sidebar__sections">
        <NavSection title="MENÚ PRINCIPAL" items={MAIN_NAV} />
        <div className="sidebar__separator" />
        <NavSection title="GESTIÓN" items={GESTION_NAV} />
      </div>

      {/* Footer */}
      <div className="sidebar__footer">
        <button className="sidebar__logout" type="button" onClick={logout}>
          <span className="sidebar__link-icon">🚪</span>
          <span>Cerrar Sesión</span>
        </button>
        <span className="sidebar__version">v 1.0.0 · 2025 FinTracker</span>
      </div>
    </aside>
  );
}
