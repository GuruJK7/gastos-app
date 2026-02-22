/**
 * ═══════════════════════════════════════════════════════════════
 * DATA UTILITIES SERVICE
 * Utilidades para cálculos y transformaciones de datos
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * Calcula el total de gastos
 * @param {Array} gastos - Array de gastos
 * @returns {number}
 */
export const calculateTotalGastos = (gastos) => {
  if (!Array.isArray(gastos)) return 0;
  return gastos.reduce((sum, gasto) => sum + (parseFloat(gasto.monto) || 0), 0);
};

/**
 * Agrupa gastos por categoría
 * @param {Array} gastos - Array de gastos
 * @returns {Object} { categoria: total, ... }
 */
export const groupByCategory = (gastos) => {
  if (!Array.isArray(gastos)) return {};
  
  return gastos.reduce((acc, gasto) => {
    const categoria = gasto.categoria || 'Sin categoría';
    acc[categoria] = (acc[categoria] || 0) + (parseFloat(gasto.monto) || 0);
    return acc;
  }, {});
};

/**
 * Agrupa gastos por método de pago
 * @param {Array} gastos - Array de gastos
 * @returns {Object} { metodo: total, ... }
 */
export const groupByPaymentMethod = (gastos) => {
  if (!Array.isArray(gastos)) return {};
  
  return gastos.reduce((acc, gasto) => {
    const metodo = gasto.metodoPago || 'Sin especificar';
    acc[metodo] = (acc[metodo] || 0) + (parseFloat(gasto.monto) || 0);
    return acc;
  }, {});
};

/**
 * Filtra gastos por rango de fechas
 * @param {Array} gastos - Array de gastos
 * @param {Date} startDate - Fecha inicio
 * @param {Date} endDate - Fecha fin
 * @returns {Array}
 */
export const filterByDateRange = (gastos, startDate, endDate) => {
  if (!Array.isArray(gastos)) return [];
  
  return gastos.filter((gasto) => {
    const gastoDate = new Date(gasto.fecha);
    return gastoDate >= startDate && gastoDate <= endDate;
  });
};

/**
 * Filtra gastos por categoría
 * @param {Array} gastos - Array de gastos
 * @param {string} categoria - Categoría a filtrar
 * @returns {Array}
 */
export const filterByCategory = (gastos, categoria) => {
  if (!Array.isArray(gastos) || !categoria) return [];
  return gastos.filter((gasto) => gasto.categoria === categoria);
};

/**
 * Obtiene gastos del mes actual
 * @param {Array} gastos - Array de gastos
 * @returns {Array}
 */
export const getCurrentMonthGastos = (gastos) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return filterByDateRange(gastos, startOfMonth, endOfMonth);
};

/**
 * Obtiene gastos del mes anterior
 * @param {Array} gastos - Array de gastos
 * @returns {Array}
 */
export const getPreviousMonthGastos = (gastos) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  
  return filterByDateRange(gastos, startOfMonth, endOfMonth);
};

/**
 * Calcula promedio de gastos diarios
 * @param {Array} gastos - Array de gastos
 * @returns {number}
 */
export const calculateDailyAverage = (gastos) => {
  if (!Array.isArray(gastos) || gastos.length === 0) return 0;

  // Normalise to YYYY-MM-DD so full ISO timestamps don't each count as a unique day
  const uniqueDates = new Set(
    gastos.map((g) => {
      const d = new Date(g.fecha);
      return isNaN(d.getTime()) ? g.fecha : d.toISOString().split('T')[0];
    })
  );
  const total = calculateTotalGastos(gastos);

  return uniqueDates.size > 0 ? total / uniqueDates.size : 0;
};

/**
 * Obtiene el gasto más alto
 * @param {Array} gastos - Array de gastos
 * @returns {Object|null}
 */
export const getHighestGasto = (gastos) => {
  if (!Array.isArray(gastos) || gastos.length === 0) return null;
  return gastos.reduce((max, gasto) => 
    parseFloat(gasto.monto) > parseFloat(max.monto) ? gasto : max
  );
};

/**
 * Obtiene el gasto más bajo
 * @param {Array} gastos - Array de gastos
 * @returns {Object|null}
 */
export const getLowestGasto = (gastos) => {
  if (!Array.isArray(gastos) || gastos.length === 0) return null;
  return gastos.reduce((min, gasto) => 
    parseFloat(gasto.monto) < parseFloat(min.monto) ? gasto : min
  );
};

/**
 * Obtiene la categoría con más gasto
 * @param {Array} gastos - Array de gastos
 * @returns {string|null}
 */
export const getTopCategory = (gastos) => {
  const grouped = groupByCategory(gastos);
  const entries = Object.entries(grouped);
  if (entries.length === 0) return null;

  // reduce must return a [categoria, total] tuple, not an object
  const [topCategoria] = entries.reduce(
    (max, current) => (current[1] > max[1] ? current : max)
  );
  return topCategoria;
};

/**
 * Calcula el porcentaje de una categoría respecto al total
 * @param {Array} gastos - Array de gastos
 * @param {string} categoria - Categoría
 * @returns {number} Porcentaje (0-100)
 */
export const getCategoryPercentage = (gastos, categoria) => {
  const total = calculateTotalGastos(gastos);
  if (total === 0) return 0;
  
  const categoryTotal = filterByCategory(gastos, categoria).reduce(
    (sum, gasto) => sum + parseFloat(gasto.monto),
    0
  );
  
  return (categoryTotal / total) * 100;
};

/**
 * Formatea número a moneda
 * @param {number} value - Valor a formatear
 * @param {string} currency - Código de moneda (default: 'USD')
 * @returns {string}
 */
export const formatCurrency = (value, currency = 'USD') => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
  }).format(value);
};

/**
 * Formatea fecha a formato legible
 * @param {string|Date} date - Fecha a formatear
 * @param {string} locale - Locale (default: 'es-ES')
 * @returns {string}
 */
export const formatDate = (date, locale = 'es-ES') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Ordena gastos por fecha (más recientes primero)
 * @param {Array} gastos - Array de gastos
 * @returns {Array}
 */
export const sortByDateDesc = (gastos) => {
  if (!Array.isArray(gastos)) return [];
  return [...gastos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
};

/**
 * Ordena gastos por monto (mayor a menor)
 * @param {Array} gastos - Array de gastos
 * @returns {Array}
 */
export const sortByAmountDesc = (gastos) => {
  if (!Array.isArray(gastos)) return [];
  return [...gastos].sort((a, b) => parseFloat(b.monto) - parseFloat(a.monto));
};
