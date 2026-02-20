// src/hooks/useGastos.js
import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '@clerk/clerk-react';

/**
 * ═══════════════════════════════════════════════════════════════
 * HOOK: useGastos
 * Maneja la sincronización de gastos entre Firestore y Clerk Auth
 * ═══════════════════════════════════════════════════════════════
 */

export const useGastos = () => {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isLoaded } = useUser();

  // Sincronizar gastos con Firestore cuando usuario esté autenticado
  useEffect(() => {
    if (!isLoaded) {
      return; // Esperar a que Clerk cargue el usuario
    }

    if (!user) {
      // Si no hay usuario, cargar del localStorage
      try {
        const storedGastos = JSON.parse(localStorage.getItem('gastos')) || [];
        setGastos(storedGastos);
        setLoading(false);
      } catch (err) {
        console.error('Error cargando gastos del localStorage:', err);
        setError('Error al cargar los gastos');
        setLoading(false);
      }
      return;
    }

    // Si hay usuario, sincronizar con Firestore
    setLoading(true);
    const q = query(
      collection(db, 'gastos'),
      where('userId', '==', user.id),
      orderBy('fecha', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const gastosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Convertir Timestamp de Firestore a string
          fecha: doc.data().fecha instanceof Timestamp
            ? doc.data().fecha.toDate().toISOString().split('T')[0]
            : doc.data().fecha,
        }));
        setGastos(gastosData);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Error sincronizando gastos:', err);
        setError('Error al sincronizar los gastos');
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
      if (user) {
        // Agregar a Firestore con el userId de Clerk
        const docRef = await addDoc(collection(db, 'gastos'), {
          ...nuevoGasto,
          userId: user.id,
          userEmail: user.emailAddresses[0]?.emailAddress,
          fecha: new Date(nuevoGasto.fecha),
          monto: parseFloat(nuevoGasto.monto),
          createdAt: Timestamp.now(),
        });
        return { id: docRef.id, ...nuevoGasto };
      } else {
        // Agregar a localStorage (modo anónimo)
        const storedGastos = JSON.parse(localStorage.getItem('gastos')) || [];
        const gastoConId = { ...nuevoGasto, id: Date.now().toString() };
        storedGastos.push(gastoConId);
        localStorage.setItem('gastos', JSON.stringify(storedGastos));
        return gastoConId;
      }
    } catch (err) {
      console.error('Error agregando gasto:', err);
      setError('Error al agregar el gasto');
      throw err;
    }
  };

  /**
   * Eliminar un gasto
   */
  const deleteGasto = async (gastoId) => {
    try {
      if (user) {
        // Eliminar de Firestore
        await deleteDoc(doc(db, 'gastos', gastoId));
      } else {
        // Eliminar de localStorage
        const storedGastos = JSON.parse(localStorage.getItem('gastos')) || [];
        const filtrados = storedGastos.filter((g) => g.id !== gastoId);
        localStorage.setItem('gastos', JSON.stringify(filtrados));
        setGastos(filtrados);
      }
    } catch (err) {
      console.error('Error eliminando gasto:', err);
      setError('Error al eliminar el gasto');
      throw err;
    }
  };

  /**
   * Actualizar un gasto
   */
  const updateGasto = async (gastoId, datosActualizados) => {
    try {
      if (user) {
        // Actualizar en Firestore
        const gastoRef = doc(db, 'gastos', gastoId);
        await updateDoc(gastoRef, {
          ...datosActualizados,
          fecha: datosActualizados.fecha instanceof Date
            ? datosActualizados.fecha
            : new Date(datosActualizados.fecha),
          monto: parseFloat(datosActualizados.monto),
          updatedAt: Timestamp.now(),
        });
      } else {
        // Actualizar en localStorage
        const storedGastos = JSON.parse(localStorage.getItem('gastos')) || [];
        const actualizados = storedGastos.map((g) =>
          g.id === gastoId ? { ...g, ...datosActualizados } : g
        );
        localStorage.setItem('gastos', JSON.stringify(actualizados));
        setGastos(actualizados);
      }
    } catch (err) {
      console.error('Error actualizando gasto:', err);
      setError('Error al actualizar el gasto');
      throw err;
    }
  };

  /**
   * Limpiar todos los gastos
   */
  const clearAllGastos = async () => {
    try {
      if (user) {
        // En Firestore, habría que eliminar cada documento
        // Por ahora retornamos un aviso
        throw new Error('Función no disponible con Firestore. Elimina gastos uno por uno.');
      } else {
        // Limpiar localStorage
        localStorage.removeItem('gastos');
        setGastos([]);
      }
    } catch (err) {
      console.error('Error limpiando gastos:', err);
      setError('Error al limpiar los gastos');
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