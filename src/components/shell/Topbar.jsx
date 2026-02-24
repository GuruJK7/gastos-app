import React from 'react';
import { useAuthStore } from '../../store/auth.store';
import './Topbar.css';

function getUserLabel(user) {
  if (!user) return 'Sin sesión';
  if (user.isAnonymous) return 'Sesión temporal';
  return user.email || user.uid;
}

export default function Topbar() {
  const { user } = useAuthStore();

  return (
    <header className="topbar">
      {/* Left: title + subtitle */}
      <div className="topbar__left">
        <h2 className="topbar__title">📊 Dashboard</h2>
        <span className="topbar__subtitle">Vista general de tus finanzas</span>
      </div>

      {/* Center: search pill */}
      <div className="topbar__center">
        <div className="topbar__search">
          <span className="topbar__search-icon">🔍</span>
          <input
            className="topbar__search-input"
            type="text"
            placeholder="Buscar..."
            aria-label="Buscar"
          />
        </div>
      </div>

      {/* Right: action icons */}
      <div className="topbar__right">
        <span className="topbar__user-label">{getUserLabel(user)}</span>
        <button className="topbar__icon-btn" type="button" aria-label="Notificaciones">
          🔔
        </button>
        <button className="topbar__icon-btn" type="button" aria-label="Ayuda">
          ❓
        </button>
        <button className="topbar__avatar" type="button" aria-label="Perfil">
          <span className="topbar__avatar-inner">👤</span>
        </button>
      </div>
    </header>
  );
}
