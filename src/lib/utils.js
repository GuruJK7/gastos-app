import { clsx } from 'clsx';

/**
 * Merge class names conditionally.
 * Usage: cn('base', condition && 'extra', className)
 */
export function cn(...inputs) {
  return clsx(inputs);
}

/**
 * Format number as currency (MXN by default).
 */
export function formatCurrency(amount, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format a Date or Firestore Timestamp to readable string.
 */
export function formatDate(date) {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
