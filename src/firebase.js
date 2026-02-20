// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { CONFIG } from "./config";

/**
 * ═══════════════════════════════════════════════════════════════
 * CONFIGURACIÓN DE FIREBASE
 * Inicializa Firebase y exporta las instancias necesarias
 * En modo desarrollo, usa autenticación anónima
 * ═══════════════════════════════════════════════════════════════
 */

const firebaseConfig = {
  apiKey: "AIzaSyD8E1oIK4dX_qA__-tyQkI_NQ2JjAP9HXg",
  authDomain: "moneyadmin-d2b8c.firebaseapp.com",
  projectId: "moneyadmin-d2b8c",
  storageBucket: "moneyadmin-d2b8c.firebasestorage.app",
  messagingSenderId: "514421288905",
  appId: "1:514421288905:web:62834a4b750746950bc218",
  measurementId: "G-SKYMNL2JN6",
};

/**
 * Inicializar Firebase
 */
const app = initializeApp(firebaseConfig);

/**
 * Inicializar Analytics (solo en navegador)
 */
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

/**
 * Exportar instancias de Firebase
 */
export const db = getFirestore(app);
export const auth = getAuth(app);
export { analytics };

/**
 * En modo desarrollo, autenticarse anónimamente
 */
let authPromise = Promise.resolve();

if (CONFIG.DEV_MODE) {
  authPromise = signInAnonymously(auth)
    .then((userCredential) => {
      console.log('✅ Autenticación anónima exitosa - UID:', userCredential.user.uid);
      return userCredential.user;
    })
    .catch((error) => {
      console.error('⚠️ Error en autenticación anónima:', error.code, error.message);
      throw error;
    });
}

export { authPromise };