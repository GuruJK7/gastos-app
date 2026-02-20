import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';
import { CONFIG } from './config';
import './index.css';

const publishableKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

// En modo desarrollo, no requerimos la clave de Clerk
if (!CONFIG.DEV_MODE && !publishableKey) {
  throw new Error('Missing Publishable Key. Please set REACT_APP_CLERK_PUBLISHABLE_KEY in .env.local');
}

const root = ReactDOM.createRoot(document.getElementById('root'));

// Si estamos en modo desarrollo, envolvemos la app con un proveedor mock
const AppComponent = CONFIG.DEV_MODE ? (
  // En modo dev, no usamos ClerkProvider
  <App />
) : (
  // En producción, usamos ClerkProvider
  <React.StrictMode>
    <ClerkProvider publishableKey={publishableKey}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);

root.render(AppComponent);