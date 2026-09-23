'use client';
import { usePresignedUpload } from '@/features/inventory/hooks/useProducts';
import { KEEP_FIELD_REFS } from '@/lib/formReset';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { addPaymentReceiptSchema, type AddPaymentReceiptForm } from '../types';
import { useAddPaymentReceipt } from './useServiceOrders';

const EMPTY_RECEIPT: AddPaymentReceiptForm = { url: '', note: '' };

/** Uploads the image to the workspace's receipts folder, then files it on the order with a note. */
export function useAddReceiptForm(serviceOrderId: string | null, isOpen: boolean, onAttached: () => void) {
  const receiptUpload = usePresignedUpload('receipts');
  const addReceipt = useAddPaymentReceipt();

  const form = useForm<AddPaymentReceiptForm>({
    resolver: zodResolver(addPaymentReceiptSchema),
    defaultValues: EMPTY_RECEIPT,
  });

  // Each opening starts blank, whichever order it was opened for.
  useEffect(() => {
    if (isOpen) form.reset(EMPTY_RECEIPT, KEEP_FIELD_REFS);
  }, [isOpen, serviceOrderId, form]);

  const handleSubmit = form.handleSubmit((receipt) => {
    if (!serviceOrderId) return;
    addReceipt.mutate({ serviceOrderId, receipt }, { onSuccess: onAttached });
  });

  return {
    form,
    handleSubmit,
    receiptUpload,
    isSaving: addReceipt.isPending,
  };
}
