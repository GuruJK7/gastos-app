// src/components/AuthModal.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * ═══════════════════════════════════════════════════════════════
 * COMPONENTE: AuthModal
 * Modal para login y registro de usuarios
 * ═══════════════════════════════════════════════════════════════
 */

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, signup, error } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      // Cerrar modal al éxito
      setEmail('');
      setPassword('');
      onClose();
    } catch (err) {
      setLocalError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #0f172a 0%, #1a1f3a 100%)',
        border: '1px solid rgba(34, 211, 238, 0.2)',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Título */}
        <h2 style={{
          color: '#f1f5f9',
          marginBottom: '1.5rem',
          fontSize: '1.5rem',
          fontWeight: 600
        }}>
          {isLogin ? '🔐 Iniciar Sesión' : '📝 Registrarse'}
        </h2>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#cbd5e1',
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              style={{
                background: 'rgba(71, 85, 105, 0.08)',
                border: '1px solid rgba(34, 211, 238, 0.15)',
                color: '#f1f5f9',
                padding: '0.75rem 0.95rem',
                borderRadius: '0.625rem',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#22d3ee';
                e.target.style.background = 'rgba(71, 85, 105, 0.12)';
                e.target.style.boxShadow = '0 0 0 3px rgba(34, 211, 238, 0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(34, 211, 238, 0.15)';
                e.target.style.background = 'rgba(71, 85, 105, 0.08)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Contraseña */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#cbd5e1',
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={{
                background: 'rgba(71, 85, 105, 0.08)',
                border: '1px solid rgba(34, 211, 238, 0.15)',
                color: '#f1f5f9',
                padding: '0.75rem 0.95rem',
                borderRadius: '0.625rem',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#22d3ee';
                e.target.style.background = 'rgba(71, 85, 105, 0.12)';
                e.target.style.boxShadow = '0 0 0 3px rgba(34, 211, 238, 0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(34, 211, 238, 0.15)';
                e.target.style.background = 'rgba(71, 85, 105, 0.08)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Mensajes de error */}
          {(localError || error) && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.85rem'
            }}>
              ⚠️ {localError || error}
            </div>
          )}

          {/* Botón submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#22d3ee',
              color: '#0f172a',
              border: 'none',
              padding: '0.8rem 1.5rem',
              borderRadius: '0.625rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.35s ease',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 2px 8px rgba(34, 211, 238, 0.25)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = '#06b6d4';
                e.target.style.boxShadow = '0 6px 16px rgba(34, 211, 238, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.background = '#22d3ee';
                e.target.style.boxShadow = '0 2px 8px rgba(34, 211, 238, 0.25)';
              }
            }}
          >
            {loading ? '⏳ Cargando...' : (isLogin ? '✓ Iniciar Sesión' : '✓ Registrarse')}
          </button>

          {/* Cambiar entre login y signup */}
          <p style={{
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '0.85rem',
            marginTop: '0.5rem'
          }}>
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: 'none',
                border: 'none',
                color: '#22d3ee',
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline'
              }}
            >
              {isLogin ? 'Registrarse' : 'Iniciar Sesión'}
            </button>
          </p>
        </form>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(71, 85, 105, 0.2)',
            border: 'none',
            color: '#cbd5e1',
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '1.25rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(71, 85, 105, 0.4)';
            e.target.style.color = '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(71, 85, 105, 0.2)';
            e.target.style.color = '#cbd5e1';
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};