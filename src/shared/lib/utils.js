import { clsx } from "clsx";

/**
 * Utility function to merge class names
 */
export function cn(...inputs) {
  return clsx(inputs);
}

/**
 * Format currency
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(date, format = 'short') {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(d);
  }
  
  if (format === 'long') {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  }
  
  return d.toLocaleDateString();
}

/**
 * Format percentage
 */
export function formatPercentage(value) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

/**
 * Get trend color
 */
export function getTrendColor(value, inverse = false) {
  if (value === 0) return 'text-muted-foreground';
  const isPositive = value > 0;
  const shouldBeGreen = inverse ? !isPositive : isPositive;
  return shouldBeGreen ? 'text-green-500' : 'text-red-500';
}
