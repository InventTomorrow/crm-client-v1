'use client';
import { useFormContext, useWatch } from 'react-hook-form';
import type { PaymentAccountForm, PaymentAccountsFieldValues } from '../types';
import { getEffectiveDefaultAccountId } from '../utils/paymentAccounts';

/**
 * Edits `paymentAccounts` + `defaultPaymentAccountId` on the surrounding form; saved with it.
 * `leadingAccountIds` are other offered accounts (a service's selected workspace ones) listed first.
 */
export function usePaymentAccountList(leadingAccountIds: readonly string[] = []) {
  const form = useFormContext<PaymentAccountsFieldValues>();
  const accounts = useWatch({ control: form.control, name: 'paymentAccounts' }) ?? [];
  const defaultPaymentAccountId = useWatch({ control: form.control, name: 'defaultPaymentAccountId' });

  const effectiveDefaultId = getEffectiveDefaultAccountId(
    [...leadingAccountIds, ...accounts.map((account) => account.id)],
    defaultPaymentAccountId,
  );

  const setAccounts = (nextAccounts: PaymentAccountForm[]) =>
    form.setValue('paymentAccounts', nextAccounts, { shouldDirty: true, shouldValidate: true });

  const makeDefault = (accountId: string) =>
    form.setValue('defaultPaymentAccountId', accountId, { shouldDirty: true });

  const saveAccount = (savedAccount: PaymentAccountForm, onDone: () => void) => {
    const isExisting = accounts.some((account) => account.id === savedAccount.id);
    setAccounts(
      isExisting
        ? accounts.map((account) => (account.id === savedAccount.id ? savedAccount : account))
        : [...accounts, savedAccount],
    );
    onDone();
  };

  const removeAccount = (accountId: string, onDone: () => void) => {
    setAccounts(accounts.filter((account) => account.id !== accountId));
    if (accountId === defaultPaymentAccountId) {
      form.setValue('defaultPaymentAccountId', null, { shouldDirty: true });
    }
    onDone();
  };

  return { accounts, effectiveDefaultId, saveAccount, removeAccount, makeDefault };
}
