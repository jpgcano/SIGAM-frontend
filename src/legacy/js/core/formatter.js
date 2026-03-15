// Common formatting utilities.
export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 10);
}

export function formatCurrency(value, currency = 'USD') {
  const number = Number(value);
  if (!Number.isFinite(number)) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(number);
}
