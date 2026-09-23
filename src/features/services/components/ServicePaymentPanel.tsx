'use client';
import { PaymentMethodIcon } from '@/features/settings/components/payment/PaymentMethodIcon';
import { PAYMENT_METHOD_LABELS } from '@/features/settings/types';
import { PreviewEmptyHint, PreviewPanel } from '@/shared/ui/PreviewPanel';
import { Check, Loader2, Wallet } from 'lucide-react';
import { useServicePaymentSummary } from '../hooks/useServicePaymentSummary';
import type { ServiceOffering } from '../types';

export function ServicePaymentPanel({ service }: { service: ServiceOffering }) {
  const { collectPayment, offeredAccounts, defaultAccountId, serviceOwnAccountIds, isLoading } =
    useServicePaymentSummary(service);

  return (
    <PreviewPanel
      Icon={Wallet}
      title="Payment"
      description={
        collectPayment
          ? 'After an order in chat, the bot sends only the default account and asks for a receipt. The next one goes only if the customer cannot pay into it.'
          : 'Collection is off — the bot takes the order and your team arranges payment.'
      }
    >
      {!collectPayment ? (
        <PreviewEmptyHint>Turn on “Collect payment in chat” in the service’s Payment step.</PreviewEmptyHint>
      ) : isLoading ? (
        <Loader2 size={16} className="animate-spin text-[var(--ink-mute)]" />
      ) : offeredAccounts.length === 0 ? (
        <PreviewEmptyHint>No accounts offered — customers will not be sent payment details.</PreviewEmptyHint>
      ) : (
        <ul className="flex flex-col gap-2">
          {offeredAccounts.map((account) => (
            <li
              key={account.id}
              className="flex items-start gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2.5"
            >
              <PaymentMethodIcon method={account.method} className="h-8 w-8" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[13px] font-semibold text-[var(--ink)]">{account.accountTitle}</p>
                  {account.id === defaultAccountId && (
                    <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 text-[10.5px] font-medium text-[var(--accent)]">
                      <Check size={10} /> Default
                    </span>
                  )}
                </div>
                <p className="truncate text-[12px] text-[var(--ink-soft)]">
                  {[PAYMENT_METHOD_LABELS[account.method], account.bankName].filter(Boolean).join(' · ')}
                </p>
                <p className="truncate font-mono text-[12px] tabular-nums tracking-wide text-[var(--ink)]">
                  {account.accountNumber}
                </p>
                <p className="mt-0.5 text-[10.5px] uppercase tracking-wide text-[var(--ink-mute)]">
                  {serviceOwnAccountIds.has(account.id) ? 'This service only' : 'Workspace account'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PreviewPanel>
  );
}
