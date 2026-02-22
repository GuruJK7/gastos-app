// src/components/AuthModal.js
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import './AuthModal.css';

export const AuthModal = () => {
  const { 
    login, 
    register, 
    loginWithGoogle, 
    resetPassword, 
    loading, 
    error: authError 
  } = useAuth();

  const [mode, setMode] = useState('login'); // 'login', 'register', 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await register(email, password, displayName);
    } catch (err) {
      setError(err.message || 'Error al crear cuenta');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    try {
      await resetPassword(email);
      setResetSent(true);
      setTimeout(() => {
        setResetSent(false);
        setMode('login');
        setEmail('');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Error al enviar correo de recuperación');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Error al iniciar con Google');
    }
  };

  const displayError = error || authError;

  return (
    <div className="auth-modal-container">
      <div className="auth-modal">
        <h1 className="auth-title">
          {mode === 'login' && 'Iniciar Sesión'}
          {mode === 'register' && 'Crear Cuenta'}
          {mode === 'reset' && 'Recuperar Contraseña'}
        </h1>

        {displayError && (
          <div className="auth-error">
            {displayError}
          </div>
        )}

        {resetSent && (
          <div className="auth-success">
            ✓ Correo de recuperación enviado. Revisa tu bandeja de entrada.
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="auth-form">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="auth-form">
            <input
              type="text"
              placeholder="Nombre completo"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="auth-input"
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="auth-input"
            />
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Cargando...' : 'Crear Cuenta'}
            </button>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Enviando...' : 'Enviar Correo de Recuperación'}
            </button>
          </form>
        )}

        <div className="auth-divider">O</div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="auth-google-button"
        >
          🔐 Iniciar con Google
        </button>

        <div className="auth-links">
          {mode === 'login' && (
            <>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className="auth-link"
              >
                ¿No tienes cuenta? Registrate
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('reset');
                  setError('');
                }}
                className="auth-link"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </>
          )}

          {(mode === 'register' || mode === 'reset') && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className="auth-link"
            >
              Volver a Iniciar Sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
};