import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './app/providers/AuthProvider';
import { ToastProvider } from './app/providers/ToastProvider';
import { GastosProvider } from './app/providers/GastosProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <GastosProvider>
          <App />
        </GastosProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);

reportWebVitals();