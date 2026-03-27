import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export function numberToWords(num: number): string {
  const units = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const tens = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const specials = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  function convert(n: number): string {
    if (n === 0) return '';
    if (n < 10) return units[n];
    if (n < 20) return specials[n - 10];
    if (n < 100) {
      const u = n % 10;
      return tens[Math.floor(n / 10)] + (u > 0 ? ' Y ' + units[u] : '');
    }
    if (n === 100) return 'CIEN';
    if (n < 1000) {
      const r = n % 100;
      return hundreds[Math.floor(n / 100)] + (r > 0 ? ' ' + convert(r) : '');
    }
    if (n < 1000000) {
      const thousands = Math.floor(n / 1000);
      const remainder = n % 1000;
      let prefix = thousands === 1 ? 'MIL' : convert(thousands) + ' MIL';
      return prefix + (remainder > 0 ? ' ' + convert(remainder) : '');
    }
    return 'NÚMERO DEMASIADO GRANDE';
  }

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  const words = integerPart === 0 ? 'CERO' : convert(integerPart);
  const cents = decimalPart.toString().padStart(2, '0');

  return `${words} PESOS ${cents}/100 M.N.`;
}
