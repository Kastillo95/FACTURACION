import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL',
    minimumFractionDigits: 2,
  }).format(num);
}

export function validateHondurasRTN(rtn: string): boolean {
  // Honduras RTN format: 14 digits
  const rtnRegex = /^\d{14}$/;
  return rtnRegex.test(rtn);
}

export function formatInvoiceNumber(counter: number): string {
  const paddedNumber = counter.toString().padStart(9, '0');
  return `001-001-01-${paddedNumber}`;
}
