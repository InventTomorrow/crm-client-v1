'use client';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { RaisedDialogLayer } from '@/shared/ui/Dialog';
import { PermissionGuard } from '@/shared/ui/PermissionGuard';
import { ArrowUpRight, Check, CircleDollarSign, Loader2, MessageSquare, Paperclip, X } from 'lucide-react';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { useServiceOrder, useServiceOrderAction } from '../hooks/useServiceOrders';
import {
  canAddPaymentReceipt,
  CLOSE_MODE_LABELS,
  formatOrderDate,
  getLinePriceText,
  getPriceSummary,
  getServiceOrderLabel,
  SERVICE_ORDER_STATUS_META,
  SERVICE_PAYMENT_STATUS_META,
} from '../lib/format';
import { AddReceiptDialog } from './AddReceiptDialog';
import { PaymentReceiptList } from './PaymentReceiptList';
import { ServiceOrderBadge } from './ServiceOrderBadge';

function SheetSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5 py-4 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-[10.5px] font-semibold uppercase tracking-wide text-[var(--ink-mute)]">{title}</h4>
        {action}
      </div>
      {children}
    </section>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[96px_1fr] gap-2 text-[12.5px]">
      <dt className="text-[var(--ink-mute)]">{label}</dt>
      <dd dir="auto" className="min-w-0 break-words text-[var(--ink)]">
        {children}
      </dd>
    </div>
  );
}

export function ServiceOrderDetailSheet({
  serviceOrderId,
  onClose,
}: {
  serviceOrderId: string;
  onClose: () => void;
}) {
  const { data: serviceOrder, isLoading } = useServiceOrder(serviceOrderId);
  const orderAction = useServiceOrderAction();
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [isAddingReceipt, setIsAddingReceipt] = useState(false);

  const orderLabel = serviceOrder ? getServiceOrderLabel(serviceOrder.orderNumber) : 'Service order';
  const isCancelled = serviceOrder?.status === 'CANCELLED';

  return (
    <RaisedDialogLayer>
      <div className="scrim" onClick={onClose} />
      <div className="card-2 fade-up fixed bottom-[14px] right-[14px] top-[14px] z-[70] flex w-[500px] max-w-[calc(100vw-28px)] flex-col overflow-hidden bg-[var(--surface)]">
        <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] p-[18px]">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="truncate text-[16px] font-semibold text-[var(--ink)]">{orderLabel}</h3>
            {serviceOrder && (
              <>
                <ServiceOrderBadge meta={SERVICE_ORDER_STATUS_META[serviceOrder.status]} />
                <ServiceOrderBadge meta={SERVICE_PAYMENT_STATUS_META[serviceOrder.paymentStatus]} />
              </>
            )}
          </div>
          <button onClick={onClose} className="text-[var(--ink-mute)] hover:text-[var(--ink)]" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {isLoading || !serviceOrder ? (
          <div className="grid flex-1 place-items-center">
            <Loader2 size={20} className="animate-spin text-[var(--ink-mute)]" />
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y divide-[var(--line)] overflow-y-auto p-[18px]">
              <SheetSection title="Customer">
                <dl className="flex flex-col gap-1.5">
                  <DetailRow label="Name">{serviceOrder.customerName || 'Unnamed customer'}</DetailRow>
                  {serviceOrder.businessName && <DetailRow label="Business">{serviceOrder.businessName}</DetailRow>}
                  <DetailRow label="Phone">
                    <span className="font-mono tabular-nums">{serviceOrder.customerPhone}</span>
                  </DetailRow>
                  {serviceOrder.customerEmail && <DetailRow label="Email">{serviceOrder.customerEmail}</DetailRow>}
                </dl>
              </SheetSection>

              <SheetSection title="Order">
                <ul className="flex flex-col gap-2">
                  {serviceOrder.lines.map((line) => (
                    <li
                      key={`${line.serviceOfferingId}-${line.planKey}`}
                      className="flex items-start justify-between gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/services/${line.serviceOfferingId}`}
                          className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--ink)] hover:text-[var(--accent)] hover:underline"
                        >
                          {line.serviceName}
                          <ArrowUpRight size={13} className="flex-shrink-0" />
                        </Link>
                        <p className="text-[12px] text-[var(--ink-mute)]">{line.planName} plan</p>
                      </div>
                      <p className="flex-shrink-0 text-right text-[12.5px] text-[var(--ink-soft)]">
                        {getLinePriceText(line, serviceOrder.currency)}
                      </p>
                    </li>
                  ))}
                </ul>
                <dl className="flex flex-col gap-1.5">
                  <DetailRow label="Total">
                    <span className="font-semibold">{getPriceSummary(serviceOrder.lines, serviceOrder.currency)}</span>
                  </DetailRow>
                  <DetailRow label="Placed">{formatOrderDate(serviceOrder.createdAt)}</DetailRow>
                  <DetailRow label="Closed">{CLOSE_MODE_LABELS[serviceOrder.closeMode]}</DetailRow>
                  {serviceOrder.confirmedAt && (
                    <DetailRow label="Confirmed">{formatOrderDate(serviceOrder.confirmedAt)}</DetailRow>
                  )}
                </dl>
              </SheetSection>

              <SheetSection
                title="Payment"
                action={
                  canAddPaymentReceipt(serviceOrder) && (
                    <PermissionGuard permission="orders:edit">
                      <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingReceipt(true)}>
                        <Paperclip size={13} /> Add receipt
                      </Button>
                    </PermissionGuard>
                  )
                }
              >
                {serviceOrder.paymentRequired ? (
                  <>
                    <p className="text-[12px] text-[var(--ink-mute)]">
                      Payment details were shared in chat. A receipt the customer sends lands here.
                    </p>
                    <PaymentReceiptList
                      serviceOrderId={serviceOrder.id}
                      orderLabel={orderLabel}
                      receipts={serviceOrder.paymentReceipts}
                    />
                  </>
                ) : (
                  <p className="text-[12px] text-[var(--ink-mute)]">
                    Payment collection is off for this service, so no receipt is taken here. Your team
                    arranges payment with the customer.
                  </p>
                )}
              </SheetSection>

              {(serviceOrder.briefAnswers.length > 0 || serviceOrder.briefSummary) && (
                <SheetSection title="What they told the assistant">
                  {serviceOrder.briefAnswers.length > 0 && (
                    <dl className="flex flex-col gap-1.5">
                      {serviceOrder.briefAnswers.map((answer) => (
                        <DetailRow key={answer.label} label={answer.label}>
                          {answer.value}
                        </DetailRow>
                      ))}
                    </dl>
                  )}
                  {serviceOrder.briefSummary && (
                    <p dir="auto" className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
                      {serviceOrder.briefSummary}
                    </p>
                  )}
                </SheetSection>
              )}

              {serviceOrder.notes && (
                <SheetSection title="Notes">
                  <p dir="auto" className="whitespace-pre-wrap text-[12.5px] text-[var(--ink-soft)]">
                    {serviceOrder.notes}
                  </p>
                </SheetSection>
              )}

              {serviceOrder.cancelReason && (
                <SheetSection title="Cancel reason">
                  <p dir="auto" className="text-[12.5px] text-[var(--ink-soft)]">{serviceOrder.cancelReason}</p>
                </SheetSection>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-[var(--line)] p-[14px]">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/inbox?lead=${serviceOrder.leadId}`}>
                  <MessageSquare size={13} /> Open chat
                </Link>
              </Button>
              {!isCancelled && (
                <PermissionGuard permission="orders:edit">
                  <div className="ml-auto flex flex-wrap gap-2">
                    {serviceOrder.status === 'NEW' && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={orderAction.isPending}
                        onClick={() => orderAction.mutate({ serviceOrderId: serviceOrder.id, action: 'confirm' })}
                      >
                        <Check size={13} /> Confirm
                      </Button>
                    )}
                    {serviceOrder.paymentStatus !== 'PAID' && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={orderAction.isPending}
                        onClick={() => orderAction.mutate({ serviceOrderId: serviceOrder.id, action: 'mark-paid' })}
                      >
                        <CircleDollarSign size={13} /> Mark paid
                      </Button>
                    )}
                    {serviceOrder.status !== 'COMPLETED' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        disabled={orderAction.isPending}
                        onClick={() => setIsConfirmingCancel(true)}
                      >
                        Cancel order
                      </Button>
                    )}
                  </div>
                </PermissionGuard>
              )}
            </div>
          </>
        )}
      </div>

      <AddReceiptDialog
        serviceOrderId={isAddingReceipt && serviceOrder ? serviceOrder.id : null}
        orderLabel={orderLabel}
        onClose={() => setIsAddingReceipt(false)}
      />

      <ConfirmDialog
        open={isConfirmingCancel}
        onClose={() => setIsConfirmingCancel(false)}
        onConfirm={() => {
          if (!serviceOrder) return;
          orderAction.mutate(
            { serviceOrderId: serviceOrder.id, action: 'cancel' },
            { onSettled: () => setIsConfirmingCancel(false) },
          );
        }}
        title={`Cancel ${orderLabel}?`}
        description="The customer is told in their chat that the order was cancelled."
        confirmLabel="Cancel order"
        loading={orderAction.isPending}
      />
    </RaisedDialogLayer>
  );
}
