'use client';
import { KEEP_FIELD_REFS } from '@/lib/formReset';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { PAYMENT_ACCOUNT_METHODS, paymentAccountSchema, type PaymentAccountForm } from '../types';
import { buildEmptyPaymentAccount } from '../utils/paymentAccounts';

/**
 * A fresh form every time the dialog opens — blank for a new account, prefilled for an edit.
 * Validates as the user types; an existing record is checked on open so saved values
 * that break today's rules show their errors straight away.
 */
export function usePaymentAccountDialogForm(isOpen: boolean, editedAccount: PaymentAccountForm | null) {
  const form = useForm<PaymentAccountForm>({
    resolver: zodResolver(paymentAccountSchema),
    defaultValues: buildEmptyPaymentAccount(),
    mode: 'onChange',
  });
  const method = useWatch({ control: form.control, name: 'method' });
  const isBankTransfer = method === 'BANK_TRANSFER';

  useEffect(() => {
    if (!isOpen) return;
    form.reset(editedAccount ?? buildEmptyPaymentAccount(), KEEP_FIELD_REFS);
    if (editedAccount) void form.trigger();
  }, [isOpen, editedAccount, form]);

  // Number and bank rules depend on the method, and an IBAN only belongs to a bank transfer.
  // Old errors are dropped and only fields already filled are re-checked, so switching
  // method never flags an empty optional field or one the user has not reached yet.
  const changeMethod = (nextMethod: string) => {
    const isKnownMethod = (PAYMENT_ACCOUNT_METHODS as readonly string[]).includes(nextMethod);
    if (!isKnownMethod || nextMethod === form.getValues('method')) return;

    form.setValue('method', nextMethod as PaymentAccountForm['method'], { shouldDirty: true });
    if (nextMethod !== 'BANK_TRANSFER') form.setValue('iban', '', { shouldDirty: true });

    const methodDependentFields = ['accountNumber', 'bankName', 'iban'] as const;
    form.clearErrors([...methodDependentFields]);
    const filledFields = methodDependentFields.filter((fieldName) => !!form.getValues(fieldName)?.trim());
    if (filledFields.length) void form.trigger(filledFields);
  };

  return { form, isBankTransfer, changeMethod };
}
