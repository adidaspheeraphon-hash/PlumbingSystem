import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | undefined, format = 'dd/mm/yyyy'): string {
  if (!dateString || dateString === '-' || dateString === 'undefined') return '-';

  try {
    // Handle already formatted dd/mm/yyyy
    if (dateString.includes('/')) return dateString;

    let date: Date;
    if (dateString.includes('-')) {
      // ISO format or yyyy-mm-dd
      const parts = dateString.split(' ')[0].split('-');
      if (parts.length === 3) {
        date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }

    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    if (format === 'dd/mm/yyyy') {
      return `${day}/${month}/${year}`;
    }
    return dateString;
  } catch {
    return dateString;
  }
}

export function formatCurrency(amount: number | string): string {
  const val = typeof amount === "string" ? parseFloat(amount) : amount;
  return val.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
