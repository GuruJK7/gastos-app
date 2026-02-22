// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  auth,
  googleProvider,
} from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  linkWithPopup,
  linkWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
} from 'firebase/auth';

/**
 * ═══════════════════════════════════════════════════════════════
 * CONTEXTO: AuthContext
 * Maneja la autenticación de usuarios con Firebase
 * Soporta: Email/Password, Google Sign-In, Anonymous Auth
 * Con linking de cuentas anónimas a Google
 * ═══════════════════════════════════════════════════════════════
 */

export const AuthContext = createContext();

/**
 * Hook para usar el contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

/**
 * Convertir códigos de error de Firebase a mensajes legibles
 */
const getErrorMessage = (code) => {
  const errorMessages = {
    'auth/email-already-in-use': 'El email ya está registrado',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/invalid-email': 'El email no es válido',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/operation-not-allowed': 'Operación no permitida',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión',
    'auth/invalid-credential': 'Credenciales inválidas',
  };
  return errorMessages[code] || 'Error de autenticación';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Monitor auth state changes
  useEffect(() => {
    console.log('🔐 Inicializando AuthContext...');
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('👤 Auth state changed:', {
        uid: currentUser?.uid,
        email: currentUser?.email,
        isAnonymous: currentUser?.isAnonymous,
        providerData: currentUser?.providerData
      });
      setUser(currentUser);
      setLoading(false);
      setIsAuthInitialized(true);
    });

    return unsubscribe;
  }, []);

  // Login anonymously
  const loginAnonymously = useCallback(async () => {
    setError(null);
    setAuthLoading(true);
    try {
      console.log('🔐 Iniciando sesión anónima...');
      const result = await signInAnonymously(auth);
      console.log('✅ Sesión anónima exitosa - UID:', result.user.uid);
      return result.user;
    } catch (err) {
      console.error('❌ Error en sesión anónima:', err);
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Initialize anonymous authentication if no user
  useEffect(() => {
    if (isAuthInitialized && !user && !authLoading) {
      console.log('🔓 Sin usuario detectado - iniciando sesión anónima...');
      loginAnonymously();
    }
  }, [isAuthInitialized, user, authLoading, loginAnonymously]);

  // Register with Email/Password
  const register = useCallback(async (email, password) => {
    setError(null);
    setAuthLoading(true);
    try {
      console.log('📝 Registrando usuario con email...');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Registro exitoso - UID:', result.user.uid);
      return result.user;
    } catch (err) {
      console.error('❌ Error en registro:', err);
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Login with Email/Password
  const login = useCallback(async (email, password) => {
    setError(null);
    setAuthLoading(true);
    try {
      console.log('🔑 Iniciando sesión con email...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login exitoso - UID:', result.user.uid);
      return result.user;
    } catch (err) {
      console.error('❌ Error en login:', err);
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  /**
   * Google Sign-In with Account Linking
   * Si el usuario actual es anónimo, vincula la cuenta
   * Si no hay usuario o ya está autenticado, hace login normal
   */
  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setAuthLoading(true);
    
    try {
      const currentUser = auth.currentUser;
      
      // CASO 1: Usuario anónimo - vincular cuenta
      if (currentUser?.isAnonymous) {
        console.log('🔗 Usuario anónimo detectado - vinculando con Google...');
        console.log('📌 UID anónimo actual:', currentUser.uid);
        
        try {
          const result = await linkWithPopup(currentUser, googleProvider);
          console.log('✅ Cuenta vinculada exitosamente!');
          console.log('📌 Mismo UID después de vincular:', result.user.uid);
          console.log('📧 Email de Google:', result.user.email);
          console.log('🎯 isAnonymous después de vincular:', result.user.isAnonymous);
          console.log('📋 Proveedores:', result.user.providerData.map(p => p.providerId));
          
          return result.user;
        } catch (linkError) {
          console.error('❌ Error vinculando cuenta:', linkError);
          
          // Si la cuenta de Google ya existe, informar al usuario
          if (linkError.code === 'auth/credential-already-in-use') {
            console.log('⚠️ La cuenta de Google ya está en uso');
            setError('Esta cuenta de Google ya está registrada. Cierra sesión e inicia con Google.');
            throw new Error('Esta cuenta de Google ya está registrada');
          }
          
          if (linkError.code === 'auth/popup-closed-by-user') {
            console.log('ℹ️ Usuario cerró el popup');
            return null;
          }
          
          throw linkError;
        }
      }
      
      // CASO 2: Usuario ya autenticado (no anónimo) - no hacer nada
      if (currentUser && !currentUser.isAnonymous) {
        console.log('✅ Usuario ya autenticado con Google');
        return currentUser;
      }
      
      // CASO 3: Sin usuario - login normal
      console.log('🔑 Iniciando sesión con Google (usuario nuevo)...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Login con Google exitoso!');
      console.log('📌 UID:', result.user.uid);
      console.log('📧 Email:', result.user.email);
      console.log('👤 Nombre:', result.user.displayName);
      
      return result.user;
      
    } catch (err) {
      console.error('❌ Error en Google Sign-In:', err);
      
      // Handle user cancellation gracefully
      if (err.code === 'auth/popup-closed-by-user') {
        console.log('ℹ️ Usuario cerró el popup de Google');
        return null;
      }
      
      if (err.code === 'auth/popup-blocked') {
        setError('Popup bloqueado. Permite popups para este sitio.');
        throw new Error('Popup bloqueado');
      }
      
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Link anonymous account to email/password
  const linkAnonymousToEmail = useCallback(
    async (email, password) => {
      setError(null);
      setAuthLoading(true);
      try {
        if (!user?.isAnonymous) {
          throw new Error('User is not anonymous');
        }

        console.log('🔗 Vinculando cuenta anónima con email/password...');
        const credential = EmailAuthProvider.credential(email, password);
        const result = await linkWithCredential(auth.currentUser, credential);
        console.log('✅ Cuenta vinculada con email exitosamente');
        return result.user;
      } catch (err) {
        console.error('❌ Error vinculando con email:', err);
        const errorMessage = getErrorMessage(err.code);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setAuthLoading(false);
      }
    },
    [user]
  );

  // Logout
  const logout = useCallback(async () => {
    setError(null);
    setAuthLoading(true);
    try {
      console.log('👋 Cerrando sesión...');
      await signOut(auth);
      console.log('✅ Sesión cerrada - iniciando sesión anónima automáticamente...');
      // Después de cerrar sesión, automáticamente se iniciará sesión anónima
      // gracias al useEffect que monitorea el estado de autenticación
    } catch (err) {
      console.error('❌ Error cerrando sesión:', err);
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Password reset
  const sendPasswordReset = useCallback(async (email) => {
    setError(null);
    try {
      console.log('📧 Enviando email de recuperación...');
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Email enviado');
    } catch (err) {
      console.error('❌ Error enviando email de recuperación:', err);
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    loading: loading || authLoading,
    error,
    isAuthInitialized,
    authLoading,
    loginAnonymously,
    register,
    login,
    signInWithGoogle,
    linkAnonymousToEmail,
    logout,
    sendPasswordReset,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
