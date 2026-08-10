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
      <div className="px-[22px] py-4 border-b border-[var(--line)]">
        <h3 className="text-[15px] font-semibold">Billing history</h3>
      </div>

      {isLoading ? (
        <div className="p-[22px] text-[13px] text-[var(--ink-soft)]">Loading…</div>
      ) : !payments || payments.length === 0 ? (
        <div className="p-[22px] text-[13px] text-[var(--ink-soft)]">No payments yet.</div>
      ) : (
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[var(--ink-mute)]">
              <th className="px-[22px] py-2.5 font-medium">Date</th>
              <th className="px-[22px] py-2.5 font-medium">Amount</th>
              <th className="px-[22px] py-2.5 font-medium">Method</th>
              <th className="px-[22px] py-2.5 font-medium">Status</th>
              <th className="px-[22px] py-2.5 font-medium text-right">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-[var(--line)]">
                <td className="px-[22px] py-3">{fmtDate(p.paidAt ?? p.createdAt)}</td>
                <td className="px-[22px] py-3 font-medium">{fmtAmount(p)}</td>
                <td className="px-[22px] py-3 text-[var(--ink-soft)]">{p.method ?? '—'}</td>
                <td className="px-[22px] py-3">
                  <span className={`badge font-medium ${STATUS_STYLES[p.status]}`}>
                    {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-[22px] py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleDownloadReceipt(p)}
                    disabled={downloadingPaymentId === p.id}
                    aria-label="Download receipt"
                    title="Download receipt"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--ink-soft)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)] disabled:opacity-60"
                  >
                    {downloadingPaymentId === p.id ? (
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
      )}
    </div>
  );
}
