'use client';
import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { pkr } from '@/lib/utils';
import { useMe } from '@/features/auth/hooks/useAuth';
import { usePayments } from '../hooks/useBilling';
import { downloadReceiptPdf } from '../utils/receiptPdf';
import type { Payment, PaymentStatus } from '../types';

const STATUS_STYLES: Record<PaymentStatus, string> = {
  SUCCEEDED: 'text-[var(--accent)] bg-[var(--accent-soft)]',
  PENDING: 'text-warning-foreground bg-warning-soft',
  FAILED: 'text-destructive-foreground bg-destructive-soft',
  REFUNDED: 'text-[var(--ink-soft)] bg-[var(--line)]',
};

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function fmtAmount(payment: Pick<Payment, 'amount' | 'currency'>): string {
  if (payment.currency === 'PKR') return pkr(payment.amount);
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: payment.currency }).format(payment.amount);
}

export function BillingHistory() {
  const { data: payments, isLoading } = usePayments();
  const { user } = useMe();
  const [downloadingPaymentId, setDownloadingPaymentId] = useState<string | null>(null);

  // Built and saved entirely in the browser — no receipt is stored anywhere.
  const handleDownloadReceipt = async (payment: Payment) => {
    setDownloadingPaymentId(payment.id);
    try {
      await downloadReceiptPdf(payment, {
        accountName:
          `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Customer',
        accountEmail: user?.email || '',
      });
    } catch {
      toast.error('Could not generate the receipt');
    } finally {
      setDownloadingPaymentId(null);
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-[var(--line)] px-5 py-4">
        <h3 className="text-[15px] font-semibold">Billing history</h3>
        <p className="text-[12.5px] mt-0.5 text-[var(--ink-soft)]">
          Every payment made on this workspace.
        </p>
      </div>

      {isLoading ? (
        <div className="p-5 text-[13px] text-[var(--ink-soft)]">Loading…</div>
      ) : !payments || payments.length === 0 ? (
        <div className="p-5 text-[13px] text-[var(--ink-soft)]">No payments yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-[var(--ink-mute)]">
                <th className="px-5 py-2.5 font-medium">Date</th>
                <th className="px-5 py-2.5 font-medium">Amount</th>
                <th className="px-5 py-2.5 font-medium">Method</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="w-20 px-5 py-2.5 text-right font-medium">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t border-[var(--line)]">
                  <td className="whitespace-nowrap px-5 py-3">
                    {fmtDate(payment.paidAt ?? payment.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 font-medium">{fmtAmount(payment)}</td>
                  <td className="px-5 py-3 text-[var(--ink-soft)]">{payment.method ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`badge font-medium ${STATUS_STYLES[payment.status]}`}>
                      {payment.status.charAt(0) + payment.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDownloadReceipt(payment)}
                      disabled={downloadingPaymentId === payment.id}
                      aria-label="Download receipt"
                      title="Download receipt"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--ink-soft)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)] disabled:opacity-60"
                    >
                      {downloadingPaymentId === payment.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Download size={14} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
