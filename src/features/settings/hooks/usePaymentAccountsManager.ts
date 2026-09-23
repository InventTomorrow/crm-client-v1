'use client';
import { useState } from 'react';
import type { PaymentAccountForm } from '../types';
import { getEffectiveDefaultAccountId, toPaymentAccountForm } from '../utils/paymentAccounts';
import { useChatbotConfig, useUpdatePaymentAccounts } from './useChatbotSettings';

/** Workspace-wide accounts; every add, edit, removal or default change saves straight away. */
export function usePaymentAccountsManager() {
  const { data, isLoading } = useChatbotConfig();
  const { mutate: savePaymentAccounts, isPending: isSaving } = useUpdatePaymentAccounts();
  const [defaultingAccountId, setDefaultingAccountId] = useState<string | null>(null);

  const accounts = (data?.config?.paymentAccounts ?? []).map(toPaymentAccountForm);
  const savedDefaultId = data?.config?.defaultPaymentAccountId ?? null;
  const effectiveDefaultId = getEffectiveDefaultAccountId(
    accounts.map((account) => account.id),
    savedDefaultId,
  );

  const persist = (nextAccounts: PaymentAccountForm[], nextDefaultId: string | null, onDone?: () => void) =>
    savePaymentAccounts(
      {
        paymentAccounts: nextAccounts,
        defaultPaymentAccountId: getEffectiveDefaultAccountId(
          nextAccounts.map((account) => account.id),
          nextDefaultId,
        ),
      },
      { onSuccess: onDone, onSettled: () => setDefaultingAccountId(null) },
    );

  const saveAccount = (savedAccount: PaymentAccountForm, onDone: () => void) => {
    const isExisting = accounts.some((account) => account.id === savedAccount.id);
    const nextAccounts = isExisting
      ? accounts.map((account) => (account.id === savedAccount.id ? savedAccount : account))
      : [...accounts, savedAccount];
    persist(nextAccounts, effectiveDefaultId, onDone);
  };

  const removeAccount = (accountId: string, onDone: () => void) =>
    persist(
      accounts.filter((account) => account.id !== accountId),
      effectiveDefaultId === accountId ? null : effectiveDefaultId,
      onDone,
    );

  const makeDefault = (accountId: string) => {
    setDefaultingAccountId(accountId);
    persist(accounts, accountId);
  };

  return {
    accounts,
    effectiveDefaultId,
    defaultingAccountId,
    isLoading,
    isSaving,
    saveAccount,
    removeAccount,
    makeDefault,
  };
}
