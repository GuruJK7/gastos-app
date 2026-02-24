// src/router.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';

import DashboardPage from './pages/DashboardPage';
import GastosPage from './pages/GastosPage';
import IngresosPage from './pages/IngresosPage';
import InversionesPage from './pages/InversionesPage';
import AjustesPage from './pages/AjustesPage';
import EstadisticasPage from './pages/EstadisticasPage';
import LoginPage from './pages/LoginPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/gastos" element={<ProtectedRoute><GastosPage /></ProtectedRoute>} />
      <Route path="/ingresos" element={<ProtectedRoute><IngresosPage /></ProtectedRoute>} />
      <Route path="/inversiones" element={<ProtectedRoute><InversionesPage /></ProtectedRoute>} />
      <Route path="/estadisticas" element={<ProtectedRoute><EstadisticasPage /></ProtectedRoute>} />
      <Route path="/ajustes" element={<ProtectedRoute><AjustesPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}