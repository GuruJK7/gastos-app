/**
 * ═══════════════════════════════════════════════════════════════
 * FIRESTORE SERVICE v2.0
 * Abstrae todas las operaciones con Firestore
 * Incluye: error handling robusto, logging, retry logic
 * ═══════════════════════════════════════════════════════════════
 */

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
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const COLLECTION_NAME = 'gastos';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

// ═══════════════════════════════════════════════════════════════
// LOGGING & ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

/**
 * Logger centralizado
 */
const logger = {
  info: (message, data) => {
    console.log(`[Firestore] ${message}`, data || '');
  },
  error: (message, error) => {
    console.error(`[Firestore Error] ${message}`, error || '');
  },
  warn: (message, data) => {
    console.warn(`[Firestore Warning] ${message}`, data || '');
  },
};

/**
 * Clasifica errores de Firestore
 */
const classifyError = (error) => {
  if (error.code === 'permission-denied') {
    return { type: 'PERMISSION_DENIED', message: 'No tienes permiso para esta operación' };
  }
  if (error.code === 'not-found') {
    return { type: 'NOT_FOUND', message: 'El documento no existe' };
  }
  if (error.code === 'unauthenticated') {
    return { type: 'UNAUTHENTICATED', message: 'Debes autenticarte' };
  }
  if (error.message && error.message.includes('network')) {
    return { type: 'NETWORK_ERROR', message: 'Error de conexión' };
  }
  return { type: 'UNKNOWN_ERROR', message: 'Error desconocido' };
};

/**
 * Reintenta una operación con backoff exponencial
 */
const withRetry = async (operation, operationName, retries = MAX_RETRIES) => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const classified = classifyError(error);
      
      // No reintentar errores de permisos
      if (classified.type === 'PERMISSION_DENIED' || classified.type === 'UNAUTHENTICATED') {
        throw error;
      }
      
      if (i < retries - 1) {
        const delay = RETRY_DELAY * Math.pow(2, i);
        logger.warn(`${operationName} falló, reintentando en ${delay}ms`, classified);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// ═══════════════════════════════════════════════════════════════
// DATE UTILITIES
// ═══════════════════════════════════════════════════════════════

/**
 * Convierte Timestamp de Firestore a ISO string
 */
const timestampToISO = (timestamp) => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString().split('T')[0];
  }
  return timestamp;
};

/**
 * Normaliza un gasto desde Firestore
 */
const normalizeGasto = (doc) => ({
  id: doc.id,
  ...doc.data(),
  fecha: timestampToISO(doc.data().fecha),
  hora: doc.data().hora || null,
});

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

/**
 * Escucha cambios en los gastos de un usuario
 * @param {string} userId - ID del usuario
 * @param {Function} onSuccess - Callback cuando se cargan los datos
 * @param {Function} onError - Callback cuando hay error
 * @returns {Function} Función para desuscribirse
 */
export const subscribeToGastos = (userId, onSuccess, onError) => {
  if (!userId) {
    const error = new Error('userId es requerido');
    onError(error);
    return () => {};
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const gastosData = snapshot.docs
            .map(normalizeGasto)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

          logger.info('Gastos cargados', { count: gastosData.length });
          onSuccess(gastosData);
        } catch (error) {
          logger.error('Error procesando snapshot', error);
          onError(error);
        }
      },
      (error) => {
        logger.error('Error en suscripción a gastos', error);
        onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    logger.error('Error creando suscripción', error);
    onError(error);
    return () => {};
  }
};

/**
 * Agrega un nuevo gasto a Firestore
 * @param {string} userId - ID del usuario
 * @param {Object} gastoData - Datos del gasto
 * @returns {Promise<string>} ID del documento creado
 */
export const addGastoToFirestore = async (userId, gastoData) => {
  if (!userId) {
    throw new Error('userId es requerido');
  }

  return withRetry(
    async () => {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...gastoData,
        userId,
        fecha: new Date(gastoData.fecha),
        monto: parseFloat(gastoData.monto),
        hora: gastoData.hora || null,
        createdAt: Timestamp.now(),
      });

      logger.info('Gasto creado', { id: docRef.id });
      return docRef.id;
    },
    'addGastoToFirestore'
  );
};

/**
 * Elimina un gasto de Firestore
 * @param {string} gastoId - ID del gasto
 * @returns {Promise<void>}
 */
export const deleteGastoFromFirestore = async (gastoId) => {
  if (!gastoId) {
    throw new Error('gastoId es requerido');
  }

  return withRetry(
    async () => {
      await deleteDoc(doc(db, COLLECTION_NAME, gastoId));
      logger.info('Gasto eliminado', { id: gastoId });
    },
    'deleteGastoFromFirestore'
  );
};

/**
 * Actualiza un gasto en Firestore
 * @param {string} gastoId - ID del gasto
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<void>}
 */
export const updateGastoInFirestore = async (gastoId, updateData) => {
  if (!gastoId) {
    throw new Error('gastoId es requerido');
  }

  return withRetry(
    async () => {
      const gastoRef = doc(db, COLLECTION_NAME, gastoId);

      const dataToUpdate = {
        ...updateData,
        fecha: updateData.fecha instanceof Date
          ? updateData.fecha
          : new Date(updateData.fecha),
        monto: typeof updateData.monto === 'string'
          ? parseFloat(updateData.monto)
          : updateData.monto,
        hora: updateData.hora || null,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(gastoRef, dataToUpdate);
      logger.info('Gasto actualizado', { id: gastoId });
    },
    'updateGastoInFirestore'
  );
};

/**
 * Obtiene todos los gastos de un usuario (one-shot, no subscription)
 * @param {string} userId
 * @returns {Promise<Array>} Lista de gastos normalizados
 */
export const fetchAllGastos = async (userId) => {
  if (!userId) throw new Error('userId es requerido');

  return withRetry(async () => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const gastosData = snapshot.docs
      .map(normalizeGasto)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    logger.info('Gastos obtenidos (consulta)', { userId, count: gastosData.length });
    return gastosData;
  }, 'fetchAllGastos');
};

// Alias kept for backwards compatibility
export const getGastosForUser = fetchAllGastos;

/**
 * Elimina todos los gastos de un usuario en batch
 * @param {string} userId
 * @returns {Promise<number>} Cantidad de gastos eliminados
 */
export const deleteAllGastosForUser = async (userId) => {
  if (!userId) throw new Error('userId es requerido');

  return withRetry(async () => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      logger.info('No hay gastos para eliminar', { userId });
      return 0;
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    logger.info('Todos los gastos eliminados', { userId, count: snapshot.docs.length });
    return snapshot.docs.length;
  }, 'deleteAllGastosForUser');
};

// Alias kept for backwards compatibility
export const batchDeleteGastosByUser = deleteAllGastosForUser;

// ═══════════════════════════════════════════════════════════════
// EXPORT UTILITIES (para testing)
// ═══════════════════════════════════════════════════════════════

export const __testing = {
  classifyError,
  logger,
  normalizeGasto,
};
