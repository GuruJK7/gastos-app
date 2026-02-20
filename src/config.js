// src/config.js
// Configuración de la aplicación

export const CONFIG = {
  // Modo desarrollo: permite usar la app sin login
  DEV_MODE: process.env.REACT_APP_DEV_MODE === 'true',
  
  // Usuario de prueba para modo desarrollo
  DEV_USER: {
    id: 'dev_user_123',
    email: 'admin@test.com',
    firstName: 'Admin',
    lastName: 'Test',
  },
};

console.log('🔧 Modo desarrollo activado:', CONFIG.DEV_MODE);
