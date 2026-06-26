import { CURRENCIES } from './constants';

export function getCurrencySymbol(code) {
  return CURRENCIES.find((c) => c.code === code)?.symbol || '$';
}

export function formatMoney(amount, currencyCode = 'USD', { signed = false } = {}) {
  const symbol = getCurrencySymbol(currencyCode);
  const value = Number(amount) || 0;
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = signed && value !== 0 ? (value > 0 ? '+' : '−') : value < 0 ? '−' : '';
  return `${sign}${symbol}${formatted}`;
}

export function formatCompactMoney(amount, currencyCode = 'USD') {
  const symbol = getCurrencySymbol(currencyCode);
  const value = Number(amount) || 0;
  const abs = Math.abs(value);
  let str;
  if (abs >= 1_000_000) str = `${(abs / 1_000_000).toFixed(1)}M`;
  else if (abs >= 1_000) str = `${(abs / 1_000).toFixed(1)}K`;
  else str = abs.toFixed(0);
  return `${value < 0 ? '−' : ''}${symbol}${str}`;
}

export function formatPercent(value, decimals = 0) {
  const n = Number(value);
  if (Number.isNaN(n)) return '0%';
  return `${n.toFixed(decimals)}%`;
}

export function clampPercent(value) {
  return Math.max(0, Math.min(100, value));
}
