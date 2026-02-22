import React, { useState } from 'react';
import { useGastosContext } from '../contexts/GastosContext';
import { useToast } from '../contexts/ToastContext';
import {
  validateGasto,
  getCategories,
  getPaymentMethods,
} from '../services/validationService';
import '../styles/GastosPage.css';

const CATEGORIES = getCategories();
const PAY_METHODS = getPaymentMethods();

const getCurrentTime = () => {
  const now = new Date();
  return now.toTimeString().slice(0, 5); // "HH:MM"
};

const GastosPage = () => {
  const { gastos, addGasto, updateGasto, deleteGasto } = useGastosContext();
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingGasto, setEditingGasto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [autoTime, setAutoTime] = useState(true);
  const [newGasto, setNewGasto] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora: getCurrentTime(),
    monto: '',
    categoria: '',
    subcategoria: '',
    metodoPago: '',
    descripcion: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const gastoToSubmit = {
      ...newGasto,
      hora: autoTime ? getCurrentTime() : newGasto.hora,
    };

    const { isValid, errors } = validateGasto(gastoToSubmit);
    if (!isValid) {
      toast.error(errors[0]);
      return;
    }

    try {
      if (editingGasto) {
        await updateGasto(editingGasto.id, gastoToSubmit);
        toast.success('✓ Gasto actualizado exitosamente');
      } else {
        await addGasto(gastoToSubmit);
        toast.success('✓ Gasto registrado exitosamente');
      }
      resetForm();
    } catch (err) {
      toast.error('Error al guardar el gasto: ' + err.message);
    }
  };

  const resetForm = () => {
    setNewGasto({
      fecha: new Date().toISOString().split('T')[0],
      hora: getCurrentTime(),
      monto: '',
      categoria: '',
      subcategoria: '',
      metodoPago: '',
      descripcion: '',
    });
    setAutoTime(true);
    setEditingGasto(null);
    setShowModal(false);
  };

  const handleEdit = (gasto) => {
    setEditingGasto(gasto);
    const hasTime = !!gasto.hora;
    setAutoTime(!hasTime);
    setNewGasto({
      fecha: gasto.fecha,
      hora: gasto.hora || getCurrentTime(),
      monto: gasto.monto,
      categoria: gasto.categoria,
      subcategoria: gasto.subcategoria || '',
      metodoPago: gasto.metodoPago,
      descripcion: gasto.descripcion || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (gastoId) => {
    try {
      await deleteGasto(gastoId);
      toast.success('✓ Gasto eliminado exitosamente');
      setShowDeleteConfirm(null);
    } catch (err) {
      toast.error('Error al eliminar el gasto');
    }
  };

  const gastosFiltrados = gastos.filter((g) => {
    const matchSearch =
      g.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.categoria?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategoria = filterCategoria === 'all' || g.categoria === filterCategoria;
    return matchSearch && matchCategoria;
  });

  const categoriasEnUso = [...new Set(gastos.map((g) => g.categoria))];

  return (
    <div className="gastos-page">
      {/* Header con acciones */}
      <div className="gastos-header">
        <div className="gastos-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar gastos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="gastos-filters">
          <select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {categoriasEnUso.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <button
          className="btn-add-gasto"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <span>➕</span> Nuevo Gasto
        </button>
      </div>

      {/* Lista de Gastos */}
      <div className="gastos-list">
        {gastosFiltrados.length > 0 ? (
          gastosFiltrados.map((gasto, index) => (
            <div key={gasto.id || index} className="gasto-card">
              <div className="gasto-icon">{getCategoryIcon(gasto.categoria)}</div>
              <div className="gasto-info">
                <h4>{gasto.descripcion || gasto.categoria}</h4>
                <p className="gasto-details">
                  <span>{gasto.fecha}</span>
                  {gasto.hora && (
                    <>
                      <span>•</span>
                      <span>🕐 {gasto.hora}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{gasto.subcategoria || gasto.categoria}</span>
                  <span>•</span>
                  <span>{gasto.metodoPago}</span>
                </p>
              </div>
              <div className="gasto-amount">
                ${parseFloat(gasto.monto).toFixed(2)}
              </div>
              <div className="gasto-actions">
                <button
                  className="btn-icon btn-icon-edit"
                  title="Editar"
                  onClick={() => handleEdit(gasto)}
                >
                  ✏️
                </button>
                <button
                  className="btn-icon btn-icon-delete"
                  title="Eliminar"
                  onClick={() => setShowDeleteConfirm(gasto.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="gastos-empty">
            <p>💸</p>
            <h3>No hay gastos que mostrar</h3>
            <span>Intenta con otros filtros o agrega un nuevo gasto</span>
          </div>
        )}
      </div>

      {/* Modal para nuevo/editar gasto */}
      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingGasto ? '✏️ Editar Gasto' : '💰 Nuevo Gasto'}</h2>
              <button onClick={resetForm}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Fecha *</label>
                  <input
                    type="date"
                    value={newGasto.fecha}
                    onChange={(e) =>
                      setNewGasto({ ...newGasto, fecha: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hora</label>
                  <div className="time-field-wrapper">
                    <div className="time-toggle">
                      <button
                        type="button"
                        className={`time-toggle-btn${autoTime ? ' active' : ''}`}
                        onClick={() => {
                          setAutoTime(true);
                          setNewGasto({ ...newGasto, hora: getCurrentTime() });
                        }}
                      >
                        🕐 Auto
                      </button>
                      <button
                        type="button"
                        className={`time-toggle-btn${!autoTime ? ' active' : ''}`}
                        onClick={() => setAutoTime(false)}
                      >
                        ✏️ Manual
                      </button>
                    </div>
                    <input
                      type="time"
                      value={autoTime ? getCurrentTime() : newGasto.hora}
                      onChange={(e) =>
                        setNewGasto({ ...newGasto, hora: e.target.value })
                      }
                      disabled={autoTime}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Monto ($) *</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    value={newGasto.monto}
                    onChange={(e) =>
                      setNewGasto({ ...newGasto, monto: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Categoría *</label>
                  <select
                    value={newGasto.categoria}
                    onChange={(e) =>
                      setNewGasto({ ...newGasto, categoria: e.target.value })
                    }
                    required
                  >
                    <option value="">Selecciona...</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {getCategoryIcon(cat)} {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Método de Pago *</label>
                  <select
                    value={newGasto.metodoPago}
                    onChange={(e) =>
                      setNewGasto({ ...newGasto, metodoPago: e.target.value })
                    }
                    required
                  >
                    <option value="">Selecciona...</option>
                    {PAY_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Subcategoría</label>
                  <input
                    type="text"
                    placeholder="Ej: Restaurante, Taxi, etc."
                    value={newGasto.subcategoria}
                    onChange={(e) =>
                      setNewGasto({ ...newGasto, subcategoria: e.target.value })
                    }
                  />
                </div>
                <div className="form-group full-width">
                  <label>Descripción</label>
                  <input
                    type="text"
                    placeholder="Detalles adicionales"
                    value={newGasto.descripcion}
                    onChange={(e) =>
                      setNewGasto({ ...newGasto, descripcion: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetForm}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingGasto ? '✓ Actualizar' : '✓ Guardar Gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div
            className="modal-content modal-confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-confirm-icon">🗑️</div>
            <h2>¿Eliminar gasto?</h2>
            <p>Esta acción no se puede deshacer</p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancelar
              </button>
              <button
                className="btn-danger"
                onClick={() => handleDelete(showDeleteConfirm)}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getCategoryIcon = (categoria) => {
  const icons = {
    Comida: '🍽️',
    Supermercado: '🛒',
    Transporte: '🚗',
    Hogar: '🏠',
    Salud: '🏥',
    Suscripciones: '📱',
    Ocio: '🎬',
    Ropa: '👕',
    Educación: '📚',
    Impuestos: '📋',
    Otros: '📦',
  };
  return icons[categoria] || '📦';
};

export default GastosPage;
