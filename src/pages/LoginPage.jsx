import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export default function LoginPage() {
  const { user, loading, login } = useAuthStore();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  return (
    <div style={{ maxWidth: '24rem', margin: '4rem auto', padding: '0 1rem' }}>
      <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Bienvenido
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Iniciá sesión para acceder a tu cuenta.
        </p>
        <button
          type="button"
          onClick={login}
          className="expense-form__submit"
          style={{ width: '100%' }}
        >
          Continuar con Google
        </button>
      </div>
    </div>
  );
}
