import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const { user, loading, isAuthInitialized } = useAuth();

  // Show loading state while checking auth
  if (loading || !isAuthInitialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
      }}>
        Cargando...
      </div>
    );
  }

  // If no user, auth will handle redirect via App.js routing
  if (!user) {
    return null;
  }

  return children;
};