import React, { useState, useCallback } from 'react';
import { validateGasto, getCategories, getPaymentMethods } from '../services/validationService';

export function GastoForm({ onSubmit, onDemoData, onClearData }) {
  const [newGasto, setNewGasto] = useState({
    fecha: new Date().toISOString().split('T')[0],
    monto: '',
    categoria: '',
    subcategoria: '',
    metodoPago: '',
    descripcion: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const categories = getCategories();
  const paymentMethods = getPaymentMethods();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewGasto(prev => ({ ...prev, [name]: value }));
    // Limpiar error de este campo cuando el usuario empieza a escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [validationErrors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validar datos
    const validation = validateGasto(newGasto);
    if (!validation.isValid) {
      const errors = {};
      validation.errors.forEach(error => {
        if (error.includes('monto')) errors.monto = error;
        else if (error.includes('categoría')) errors.categoria = error;
        else if (error.includes('pago')) errors.metodoPago = error;
        else if (error.includes('fecha')) errors.fecha = error;
      });
      setValidationErrors(errors);
      setErrorMessage('Por favor corrige los errores en el formulario');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(newGasto);
      setNewGasto({
        fecha: new Date().toISOString().split('T')[0],
        monto: '',
        categoria: '',
        subcategoria: '',
        metodoPago: '',
        descripcion: ''
      });
      setValidationErrors({});
      setSuccessMessage('✓ Gasto registrado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(`Error al registrar: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="card">
      <h2 className="card-title">📝 Registrar Nuevo Gasto</h2>
      
      {errorMessage && (
        <div className="alert alert-error" role="alert">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="fecha">Fecha</label>
            <input
              id="fecha"
              type="date"
              name="fecha"
              value={newGasto.fecha}
              onChange={handleChange}
              required
              aria-invalid={!!validationErrors.fecha}
              aria-describedby={validationErrors.fecha ? 'fecha-error' : undefined}
            />
            {validationErrors.fecha && (
              <span id="fecha-error" className="error-text">{validationErrors.fecha}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="monto">Monto ($)</label>
            <input
              id="monto"
              type="number"
              name="monto"
              value={newGasto.monto}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              aria-invalid={!!validationErrors.monto}
              aria-describedby={validationErrors.monto ? 'monto-error' : undefined}
            />
            {validationErrors.monto && (
              <span id="monto-error" className="error-text">{validationErrors.monto}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="categoria">Categoría</label>
            <select
              id="categoria"
              name="categoria"
              value={newGasto.categoria}
              onChange={handleChange}
              required
              aria-invalid={!!validationErrors.categoria}
              aria-describedby={validationErrors.categoria ? 'categoria-error' : undefined}
            >
              <option value="">Selecciona una categoría</option>
              <option value="Comida">🍽️ Comida</option>
              <option value="Supermercado">🛒 Supermercado</option>
              <option value="Transporte">🚗 Transporte</option>
              <option value="Hogar">🏠 Hogar</option>
              <option value="Salud">🏥 Salud</option>
              <option value="Suscripciones">📱 Suscripciones</option>
              <option value="Ocio">🎬 Ocio</option>
              <option value="Ropa">👕 Ropa</option>
              <option value="Educación">📚 Educación</option>
              <option value="Impuestos">📋 Impuestos</option>
              <option value="Otros">📦 Otros</option>
            </select>
            {validationErrors.categoria && (
              <span id="categoria-error" className="error-text">{validationErrors.categoria}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="subcategoria">Subcategoría (opcional)</label>
            <input
              id="subcategoria"
              type="text"
              name="subcategoria"
              placeholder="Ej: Restaurante, Taxi, etc."
              value={newGasto.subcategoria}
              onChange={handleChange}
              maxLength="50"
            />
          </div>

          <div className="form-group">
            <label htmlFor="metodoPago">Método de Pago</label>
            <select
              id="metodoPago"
              name="metodoPago"
              value={newGasto.metodoPago}
              onChange={handleChange}
              required
              aria-invalid={!!validationErrors.metodoPago}
              aria-describedby={validationErrors.metodoPago ? 'metodoPago-error' : undefined}
            >
              <option value="">Selecciona método</option>
              <option value="Efectivo">💵 Efectivo</option>
              <option value="Débito">💳 Débito</option>
              <option value="Crédito">💎 Crédito</option>
              <option value="Transferencia">🏦 Transferencia</option>
            </select>
            {validationErrors.metodoPago && (
              <span id="metodoPago-error" className="error-text">{validationErrors.metodoPago}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción (opcional)</label>
            <input
              id="descripcion"
              type="text"
              name="descripcion"
              placeholder="Detalles adicionales"
              value={newGasto.descripcion}
              onChange={handleChange}
              maxLength="200"
            />
          </div>
        </div>

        <div className="btn-group">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? '⏳ Registrando...' : '✓ Registrar Gasto'}
          </button>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onDemoData}
            disabled={isLoading}
          >
            📊 Cargar Datos Demo
          </button>
          <button 
            type="button" 
            className="btn-danger" 
            onClick={onClearData}
            disabled={isLoading}
          >
            🗑️ Limpiar Todo
          </button>
        </div>
      </form>
    </section>
  );
}
