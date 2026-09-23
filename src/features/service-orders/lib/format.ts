import type { BillingCycle } from '@/features/services/types';
import type { ServiceOrderLine, ServiceOrderStatus, ServicePaymentStatus } from '../types';

interface StatusMeta {
  label: string;
  cls: string;
  dot: string;
}

export const SERVICE_ORDER_STATUS_META: Record<ServiceOrderStatus, StatusMeta> = {
  NEW: {
    label: 'New',
    cls: 'bg-[var(--warning-soft)] text-[var(--warning-foreground)]',
    dot: 'bg-[var(--warning)]',
  },
  CONFIRMED: {
    label: 'Confirmed',
    cls: 'bg-[var(--info-soft)] text-[var(--info-foreground)]',
    dot: 'bg-[var(--info)]',
  },
  IN_PROGRESS: {
    label: 'In progress',
    cls: 'bg-[var(--accent-soft)] text-[var(--accent)]',
    dot: 'bg-[var(--accent)]',
  },
  COMPLETED: {
    label: 'Completed',
    cls: 'bg-[var(--success-soft)] text-[var(--success-foreground)]',
    dot: 'bg-[var(--success)]',
  },
  CANCELLED: {
    label: 'Cancelled',
    cls: 'bg-[var(--destructive)]/12 text-[var(--destructive)]',
    dot: 'bg-[var(--destructive)]',
  },
};

export const SERVICE_PAYMENT_STATUS_META: Record<ServicePaymentStatus, StatusMeta> = {
  UNPAID: {
    label: 'Unpaid',
    cls: 'bg-[var(--surface-2)] text-[var(--ink-soft)]',
    dot: 'bg-[var(--ink-mute)]',
  },
  PENDING: {
    label: 'Payment pending',
    cls: 'bg-[var(--warning-soft)] text-[var(--warning-foreground)]',
    dot: 'bg-[var(--warning)]',
  },
  PARTIALLY_PAID: {
    label: 'Partly paid',
    cls: 'bg-[var(--info-soft)] text-[var(--info-foreground)]',
    dot: 'bg-[var(--info)]',
  },
  PAID: {
    label: 'Paid',
    cls: 'bg-[var(--success-soft)] text-[var(--success-foreground)]',
    dot: 'bg-[var(--success)]',
  },
};

export const getServiceOrderLabel = (orderNumber: number): string => `SO-${orderNumber}`;

const RECURRING_SUFFIX: Partial<Record<BillingCycle, string>> = {
  MONTHLY: '/month',
  QUARTERLY: '/quarter',
  YEARLY: '/year',
};

const CYCLE_ORDER: BillingCycle[] = ['ONE_TIME', 'MONTHLY', 'QUARTERLY', 'YEARLY'];

const formatMoney = (currency: string, amount: number): string =>
  `${currency} ${amount.toLocaleString('en-US')}`;

/** Mirrors the server's priceSummary — one figure per billing cycle, never summed across them. */
export function getPriceSummary(lines: readonly ServiceOrderLine[], currency: string): string {
  const totalsByCycle = new Map<BillingCycle, number>();
  for (const line of lines) {
    totalsByCycle.set(line.billingCycle, (totalsByCycle.get(line.billingCycle) ?? 0) + line.price);
  }
  return CYCLE_ORDER.filter((cycle) => totalsByCycle.has(cycle))
    .map((cycle) => {
      const amount = formatMoney(currency, totalsByCycle.get(cycle) ?? 0);
      const suffix = RECURRING_SUFFIX[cycle];
      return suffix ? `${amount}${suffix}` : `${amount} one-time`;
    })
    .join(' + ');
}

export function getLinePriceText(line: ServiceOrderLine, currency: string): string {
  const suffix = RECURRING_SUFFIX[line.billingCycle];
  if (!suffix) return `${formatMoney(currency, line.price)} one-time`;
  const minimum = line.minContractMonths > 0 ? `, ${line.minContractMonths}-month minimum` : '';
  return `${formatMoney(currency, line.price)}${suffix}${minimum}`;
}

export const formatOrderDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const CLOSE_MODE_LABELS: Record<'CHAT' | 'CALL', string> = {
  CHAT: 'Closed in chat',
  CALL: 'Closed on a call',
};

/** Receipts belong only to orders whose service collects payment, and never to a cancelled one. */
export const canAddPaymentReceipt = (order: { paymentRequired: boolean; status: string }): boolean =>
  order.paymentRequired && order.status !== 'CANCELLED';
