'use client';
import { getImageUrl } from '@/lib/utils';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { downloadImageAs, ImagePreviewDialog } from '@/shared/ui/ImagePreviewDialog';
import { PermissionGuard } from '@/shared/ui/PermissionGuard';
import { Download, Maximize2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRemovePaymentReceipt } from '../hooks/useServiceOrders';
import { formatOrderDate } from '../lib/format';
import type { PaymentReceipt } from '../types';

const SOURCE_LABELS: Record<PaymentReceipt['source'], string> = {
  CUSTOMER: 'Sent by customer on WhatsApp',
  STAFF: 'Uploaded by your team',
};

interface PaymentReceiptListProps {
  serviceOrderId: string;
  orderLabel: string;
  receipts: PaymentReceipt[];
}

export function PaymentReceiptList({ serviceOrderId, orderLabel, receipts }: PaymentReceiptListProps) {
  const [previewedReceipt, setPreviewedReceipt] = useState<PaymentReceipt | null>(null);
  const [receiptPendingRemoval, setReceiptPendingRemoval] = useState<PaymentReceipt | null>(null);
  const removeReceipt = useRemovePaymentReceipt();

  const downloadReceipt = async (receipt: PaymentReceipt, receiptNumber: number) => {
    const resolvedUrl = getImageUrl(receipt.url);
    if (!resolvedUrl) return;
    try {
      await downloadImageAs(resolvedUrl, 'jpeg', `${orderLabel}-receipt-${receiptNumber}`);
    } catch {
      toast.error('Could not download this receipt. Open it and try again.');
    }
  };

  if (receipts.length === 0) {
    return <p className="text-[12.5px] text-[var(--ink-mute)]">No receipt yet.</p>;
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {receipts.map((receipt, index) => (
          <li
            key={receipt.id}
            className="flex gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-2.5"
          >
            <button
              type="button"
              onClick={() => setPreviewedReceipt(receipt)}
              aria-label="Open receipt full screen"
              className="group relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded receipt served through the auth proxy */}
              <img
                src={getImageUrl(receipt.url)}
                alt={`Payment receipt ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <span className="absolute inset-0 grid place-items-center bg-[var(--ink)]/40 text-[var(--bg)] opacity-0 transition-opacity group-hover:opacity-100">
                <Maximize2 size={16} />
              </span>
            </button>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-[11.5px] text-[var(--ink-mute)]">
                {SOURCE_LABELS[receipt.source]} · {formatOrderDate(receipt.createdAt)}
              </p>
              {receipt.note ? (
                <p dir="auto" className="whitespace-pre-wrap text-[12.5px] text-[var(--ink)]">
                  {receipt.note}
                </p>
              ) : (
                <p className="text-[12px] italic text-[var(--ink-mute)]">No note</p>
              )}
              <div className="mt-auto flex items-center gap-1.5">
                <Button type="button" variant="outline" size="sm" onClick={() => downloadReceipt(receipt, index + 1)}>
                  <Download size={13} /> Download
                </Button>
                <PermissionGuard permission="orders:edit">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove receipt"
                    className="text-[var(--ink-mute)] hover:text-destructive"
                    onClick={() => setReceiptPendingRemoval(receipt)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </PermissionGuard>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <ImagePreviewDialog
        fullScreen
        open={!!previewedReceipt}
        onClose={() => setPreviewedReceipt(null)}
        imageUrl={previewedReceipt?.url ?? null}
        caption={`${orderLabel} — payment receipt`}
        filenameBase={`${orderLabel}-receipt`}
      />

      <ConfirmDialog
        open={!!receiptPendingRemoval}
        onClose={() => setReceiptPendingRemoval(null)}
        onConfirm={() => {
          if (!receiptPendingRemoval) return;
          removeReceipt.mutate(
            { serviceOrderId, receiptId: receiptPendingRemoval.id },
            { onSettled: () => setReceiptPendingRemoval(null) },
          );
        }}
        title="Remove this receipt?"
        description="The image stays in storage, but it is no longer attached to this order. Removing the last receipt puts the order back to payment pending."
        confirmLabel="Remove receipt"
        loading={removeReceipt.isPending}
      />
    </>
  );
}
