/**
 * ═══════════════════════════════════════════════════════════════
 * VALIDATION SERVICE
 * Centraliza todas las validaciones de datos de gastos
 * ═══════════════════════════════════════════════════════════════
 */

const CATEGORIES = [
  'Comida',
  'Supermercado',
  'Transporte',
  'Hogar',
  'Salud',
  'Suscripciones',
  'Ocio',
  'Ropa',
  'Educación',
  'Impuestos',
  'Otros'
];

const PAYMENT_METHODS = [
  'Efectivo',
  'Débito',
  'Crédito',
  'Transferencia'
];

/**
 * Valida que un gasto tenga todos los campos requeridos
 * @param {Object} gasto - Objeto gasto a validar
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateGasto = (gasto) => {
  const errors = [];

  if (!gasto) {
    errors.push('El gasto no puede estar vacío');
    return { isValid: false, errors };
  }

  // Validar monto
  if (!gasto.monto) {
    errors.push('El monto es requerido');
  } else if (isNaN(gasto.monto) || parseFloat(gasto.monto) <= 0) {
    errors.push('El monto debe ser un número positivo');
  }

  // Validar categoría
  if (!gasto.categoria) {
    errors.push('La categoría es requerida');
  } else if (!CATEGORIES.includes(gasto.categoria)) {
    errors.push(`Categoría no válida: ${gasto.categoria}`);
  }

  // Validar método de pago
  if (!gasto.metodoPago) {
    errors.push('El método de pago es requerido');
  } else if (!PAYMENT_METHODS.includes(gasto.metodoPago)) {
    errors.push(`Método de pago no válido: ${gasto.metodoPago}`);
  }

  // Validar fecha — required and must be a valid date
  if (!gasto.fecha) {
    errors.push('La fecha es requerida');
  } else {
    const fecha = new Date(gasto.fecha);
    if (isNaN(fecha.getTime())) {
      errors.push('Fecha no válida');
    }
  }

  // Validar descripción
  if (gasto.descripcion && typeof gasto.descripcion !== 'string') {
    errors.push('La descripción debe ser texto');
  }

  // Validar subcategoría
  if (gasto.subcategoria && typeof gasto.subcategoria !== 'string') {
    errors.push('La subcategoría debe ser texto');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Obtiene el error principal de validación (para mostrar en UI)
 * @param {Object} validationResult - Resultado de validateGasto
 * @returns {string|null}
 */
export const getMainValidationError = (validationResult) => {
  if (validationResult.errors.length > 0) {
    return validationResult.errors[0];
  }
  return null;
};

/**
 * Obtiene todas las categorías disponibles
 */
export const getCategories = () => CATEGORIES;

/**
 * Obtiene todos los métodos de pago disponibles
 */
export const getPaymentMethods = () => PAYMENT_METHODS;
