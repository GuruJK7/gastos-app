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
import { db, auth, authPromise } from '../firebase';
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
  const [authReady, setAuthReady] = useState(!CONFIG.DEV_MODE); // En prod, ya está listo
  
  // Esperar a que la autenticación anónima esté lista en modo desarrollo
  useEffect(() => {
    if (CONFIG.DEV_MODE) {
      authPromise
        .then(() => {
          console.log('🔓 Auth promise resuelto - Usuario actual:', auth.currentUser?.uid);
          setAuthReady(true);
        })
        .catch((err) => {
          console.error('❌ Error esperando auth promise:', err);
          setError('Error de autenticación');
          setLoading(false);
        });
    }
  }, []);
  
  // En modo desarrollo, usar Firebase auth anónimo; en producción, usar Clerk
  const user = useMemo(() => {
    if (CONFIG.DEV_MODE) {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn('⚠️ No hay usuario autenticado en Firebase');
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
  
  const isLoaded = authReady && (CONFIG.DEV_MODE ? !!auth.currentUser : clerkUser.isLoaded);

  // Sincronizar gastos con Firestore cuando usuario esté autenticado
  useEffect(() => {
    if (!isLoaded) {
      console.log('⏳ Esperando autenticación... isLoaded:', isLoaded, 'user:', user);
      return; // Esperar a que se autentique
    }

    if (!user) {
      console.error('❌ No hay usuario disponible');
      setLoading(false);
      setError('No hay usuario autenticado');
      return;
    }

    console.log('🔄 Sincronizando gastos para usuario:', user.id);
    // Sincronizar con Firestore
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
          // Convertir Timestamp de Firestore a string
          fecha: doc.data().fecha instanceof Timestamp
            ? doc.data().fecha.toDate().toISOString().split('T')[0]
            : doc.data().fecha,
        }));
        
        // Ordenar en el cliente
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
        
        // Si es un error de permisos, mostrar mensaje más específico
        if (err.code === 'permission-denied') {
          setError('Sin permisos para acceder a los gastos. Verifica las reglas de Firestore y que estés autenticado.');
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