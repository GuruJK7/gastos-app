// src/hooks/useGastos.js
import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { useUser } from '@clerk/clerk-react';
import { CONFIG } from '../config';

/**
 * ═══════════════════════════════════════════════════════════════
 * HOOK: useGastos
 * Maneja la sincronización de gastos entre Firestore y Clerk Auth
 * En modo desarrollo, usa autenticación anónima de Firebase
 * ═══════════════════════════════════════════════════════════════
 */

export const useGastos = () => {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const clerkUser = useUser();
  const [authReady, setAuthReady] = useState(false);
  
  // Inicializar autenticación anónima en modo desarrollo
  useEffect(() => {
    if (CONFIG.DEV_MODE) {
      console.log('🔐 Iniciando autenticación anónima...');
      
      // Si ya hay un usuario autenticado, no hacer nada
      if (auth.currentUser) {
        console.log('✅ Usuario ya autenticado:', auth.currentUser.uid);
        setAuthReady(true);
        return;
      }

      // Timeout de seguridad de 5 segundos
      const timeoutId = setTimeout(() => {
        console.warn('⏱️ Timeout en autenticación anónima (5s) - continuando de todas formas');
        setAuthReady(true);
      }, 5000);

      signInAnonymously(auth)
        .then((userCredential) => {
          clearTimeout(timeoutId);
          console.log('✅ Autenticación anónima exitosa - UID:', userCredential.user.uid);
          setAuthReady(true);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          console.error('❌ Error en autenticación anónima:', error.code, error.message);
          
          // Si es auth/operation-not-allowed, significa que no está habilitada
          if (error.code === 'auth/operation-not-allowed') {
            console.error('⚠️ IMPORTANTE: Habilita la autenticación anónima en Firebase Console');
            setError('Autenticación anónima no habilitada en Firebase Console');
          } else {
            setError('Error de autenticación: ' + error.message);
          }
          
          // De todas formas, continuar para que la UI no se quede congelada
          setAuthReady(true);
          setLoading(false);
        });
    } else {
      // En producción, consideramos que está listo cuando Clerk está listo
      setAuthReady(clerkUser.isLoaded);
    }
  }, [clerkUser.isLoaded]);
  
  // En modo desarrollo, usar Firebase auth anónimo; en producción, usar Clerk
  const user = useMemo(() => {
    if (CONFIG.DEV_MODE) {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return null;
      }
      return {
        id: currentUser.uid,
        firstName: 'Admin',
        email: 'dev@test.local'
      };
    }
    return clerkUser.user;
  }, [clerkUser.user]);
  
  const isLoaded = CONFIG.DEV_MODE ? authReady : clerkUser.isLoaded;

  // Sincronizar gastos con Firestore cuando usuario esté autenticado
  useEffect(() => {
    if (!isLoaded || !user) {
      console.log('⏳ Esperando autenticación... isLoaded:', isLoaded, 'user:', user?.id);
      return; // Esperar a que se autentique
    }

    console.log('🔄 Sincronizando gastos para usuario:', user.id);
    setLoading(true);
    setError(null);
    
    const q = query(
      collection(db, 'gastos'),
      where('userId', '==', user.id)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('✅ Snapshot recibido:', snapshot.docs.length, 'gastos');
        const gastosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          fecha: doc.data().fecha instanceof Timestamp
            ? doc.data().fecha.toDate().toISOString().split('T')[0]
            : doc.data().fecha,
        }));
        
        gastosData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        setGastos(gastosData);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('❌ Error sincronizando gastos con Firestore:', err);
        console.error('📌 Código de error:', err.code);
        console.error('📝 Mensaje:', err.message);
        console.error('🔐 Auth currentUser:', auth.currentUser?.uid);
        
        if (err.code === 'permission-denied') {
          setError('Sin permisos para acceder a los gastos. Verifica las reglas de Firestore.');
        } else if (err.code === 'failed-precondition') {
          setError('Firestore no está configurado correctamente. Verifica las reglas.');
        } else {
          setError(null);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, isLoaded]);

  /**
   * Agregar un nuevo gasto
   */
  const addGasto = async (nuevoGasto) => {
    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      console.log('➕ Agregando gasto para usuario:', user.id);
      const docRef = await addDoc(collection(db, 'gastos'), {
        ...nuevoGasto,
        userId: user.id,
        userEmail: user.email || 'dev@test.local',
        fecha: new Date(nuevoGasto.fecha),
        monto: parseFloat(nuevoGasto.monto),
        createdAt: Timestamp.now(),
      });
      
      console.log('✅ Gasto agregado con ID:', docRef.id);
      return { id: docRef.id, ...nuevoGasto };
    } catch (err) {
      console.error('❌ Error agregando gasto:', err);
      throw err;
    }
  };

  /**
   * Eliminar un gasto
   */
  const deleteGasto = async (gastoId) => {
    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }
      
      await deleteDoc(doc(db, 'gastos', gastoId));
    } catch (err) {
      console.error('Error eliminando gasto:', err);
      throw err;
    }
  };

  /**
   * Actualizar un gasto
   */
  const updateGasto = async (gastoId, datosActualizados) => {
    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const gastoRef = doc(db, 'gastos', gastoId);
      await updateDoc(gastoRef, {
        ...datosActualizados,
        fecha: datosActualizados.fecha instanceof Date
          ? datosActualizados.fecha
          : new Date(datosActualizados.fecha),
        monto: parseFloat(datosActualizados.monto),
        updatedAt: Timestamp.now(),
      });
    } catch (err) {
      console.error('Error actualizando gasto:', err);
      throw err;
    }
  };

  /**
   * Limpiar todos los gastos
   */
  const clearAllGastos = async () => {
    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Obtener todos los gastos del usuario
      const q = query(collection(db, 'gastos'), where('userId', '==', user.id));
      const snapshot = await getDocs(q);
      
      // Eliminar cada documento
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      setGastos([]);
    } catch (err) {
      console.error('Error limpiando gastos:', err);
      throw err;
    }
  };

  return {
    gastos,
    loading,
    error,
    user,
    addGasto,
    deleteGasto,
    updateGasto,
    clearAllGastos,
  };
};