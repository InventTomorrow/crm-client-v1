'use client';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { Button } from '@/shared/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/DropdownMenu';
import { Ban, Check, CircleDollarSign, Eye, MessageSquare, MoreVertical, Paperclip } from 'lucide-react';
import Link from 'next/link';
import { canAddPaymentReceipt, getServiceOrderLabel } from '../lib/format';
import type { ServiceOrder, ServiceOrderAction } from '../types';

interface ServiceOrderRowActionsProps {
  serviceOrder: ServiceOrder;
  onView: (serviceOrder: ServiceOrder) => void;
  onAddReceipt: (serviceOrder: ServiceOrder) => void;
  onAction: (serviceOrder: ServiceOrder, action: Exclude<ServiceOrderAction, 'cancel'>) => void;
  onCancel: (serviceOrder: ServiceOrder) => void;
  isActionPending: boolean;
}

/** The ⋯ menu on a service order row; only actions that fit the order's state are offered. */
export function ServiceOrderRowActions({
  serviceOrder,
  onView,
  onAddReceipt,
  onAction,
  onCancel,
  isActionPending,
}: ServiceOrderRowActionsProps) {
  const { can } = usePermissions();
  const canEdit = can('orders:edit');
  const isCancelled = serviceOrder.status === 'CANCELLED';
  const canConfirm = canEdit && serviceOrder.status === 'NEW';
  const canMarkPaid = canEdit && !isCancelled && serviceOrder.paymentStatus !== 'PAID';
  const canCancel = canEdit && !isCancelled && serviceOrder.status !== 'COMPLETED';
  const canAttachReceipt = canEdit && canAddPaymentReceipt(serviceOrder);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Actions for ${getServiceOrderLabel(serviceOrder.orderNumber)}`}
          onClick={(event) => event.stopPropagation()}
        >
          <MoreVertical size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[190px]" onClick={(event) => event.stopPropagation()}>
        <DropdownMenuItem onSelect={() => onView(serviceOrder)}>
          <Eye size={14} /> View details
        </DropdownMenuItem>
        {canAttachReceipt && (
          <DropdownMenuItem onSelect={() => onAddReceipt(serviceOrder)}>
            <Paperclip size={14} /> Add payment receipt
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={`/inbox?lead=${serviceOrder.leadId}`}>
            <MessageSquare size={14} /> Open chat
          </Link>
        </DropdownMenuItem>

        {(canConfirm || canMarkPaid || canCancel) && <DropdownMenuSeparator />}
        {canConfirm && (
          <DropdownMenuItem disabled={isActionPending} onSelect={() => onAction(serviceOrder, 'confirm')}>
            <Check size={14} /> Confirm order
          </DropdownMenuItem>
        )}
        {canMarkPaid && (
          <DropdownMenuItem disabled={isActionPending} onSelect={() => onAction(serviceOrder, 'mark-paid')}>
            <CircleDollarSign size={14} /> Mark paid
          </DropdownMenuItem>
        )}
        {canCancel && (
          <DropdownMenuItem
            variant="destructive"
            disabled={isActionPending}
            onSelect={() => onCancel(serviceOrder)}
          >
            <Ban size={14} /> Cancel order
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
