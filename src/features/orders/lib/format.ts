import type { OrderStatus } from '../types';

export const CURRENCIES: { code: string; name: string }[] = [
  { code: 'PKR', name: 'Pakistani Rupee' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'INR', name: 'Indian Rupee' },
];

export function formatMoney(amount: string | number, currency = 'PKR'): string {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number.isFinite(n) ? n : 0);
  } catch {
    return `${currency} ${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
  }
}

interface StatusMeta {
  label: string;
  cls: string; // badge bg + text
  dot: string; // dot color
}

export const ORDER_STATUS_META: Record<OrderStatus, StatusMeta> = {
  DRAFT: { label: 'Draft', cls: 'bg-[var(--surface-2)] text-[var(--ink-soft)]', dot: 'bg-[var(--ink-mute)]' },
  PENDING: { label: 'Pending', cls: 'bg-[#FEF9C3] text-[#854D0E]', dot: 'bg-[#CA8A04]' },
  CONFIRMED: { label: 'Confirmed', cls: 'bg-[#DBEAFE] text-[#1E40AF]', dot: 'bg-[#2563EB]' },
  PAID: { label: 'Paid', cls: 'bg-[#DCFCE7] text-[#15803D]', dot: 'bg-[#16A34A]' },
  FULFILLED: { label: 'Fulfilled', cls: 'bg-[#E0E7FF] text-[#3730A3]', dot: 'bg-[#4F46E5]' },
  COMPLETED: { label: 'Completed', cls: 'bg-[#D1FAE5] text-[#065F46]', dot: 'bg-[#059669]' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-[#FEE2E2] text-[#991B1B]', dot: 'bg-[#DC2626]' },
  REFUNDED: { label: 'Refunded', cls: 'bg-[#FFEDD5] text-[#9A3412]', dot: 'bg-[#EA580C]' },
};
