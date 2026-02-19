// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase';

/**
 * ═══════════════════════════════════════════════════════════════
 * CONTEXTO: AuthContext
 * Maneja la autenticación de usuarios con Firebase
 * ═══════════════════════════════════════════════════════════════
 */

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detectar cambios en autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Registrar nuevo usuario
   */
  const signup = async (email, password) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      return result.user;
    } catch (err) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Iniciar sesión
   */
  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      return result.user;
    } catch (err) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
    } catch (err) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Convertir códigos de error a mensajes legibles
   */
  const getErrorMessage = (code) => {
    const errorMessages = {
      'auth/email-already-in-use': 'El email ya está registrado',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/invalid-email': 'El email no es válido',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/operation-not-allowed': 'Operación no permitida',
    };
    return errorMessages[code] || 'Error de autenticación';
  };

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
