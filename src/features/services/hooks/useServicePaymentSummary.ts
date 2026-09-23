'use client';
import { useChatbotConfig } from '@/features/settings/hooks/useChatbotSettings';
import type { PaymentAccount } from '@/features/settings/types';
import { getEffectiveDefaultAccountId } from '@/features/settings/utils/paymentAccounts';
import type { ServiceOffering } from '../types';

/** The accounts a customer of this service is sent, default first — mirrors the server's servicePaymentAccounts. */
export function useServicePaymentSummary(service: ServiceOffering | undefined) {
  const { data: chatbotConfig, isLoading } = useChatbotConfig();
  const workspaceAccounts = chatbotConfig?.config?.paymentAccounts ?? [];

  const selectedWorkspaceAccounts = workspaceAccounts.filter((account) =>
    (service?.globalPaymentAccountIds ?? []).includes(account.id),
  );
  const offeredAccounts: PaymentAccount[] = [
    ...selectedWorkspaceAccounts,
    ...(service?.paymentAccounts ?? []),
  ];
  const defaultAccountId = getEffectiveDefaultAccountId(
    offeredAccounts.map((account) => account.id),
    service?.defaultPaymentAccountId,
  );
  const orderedAccounts = [
    ...offeredAccounts.filter((account) => account.id === defaultAccountId),
    ...offeredAccounts.filter((account) => account.id !== defaultAccountId),
  ];

  return {
    collectPayment: service?.collectPayment ?? false,
    offeredAccounts: orderedAccounts,
    defaultAccountId,
    serviceOwnAccountIds: new Set((service?.paymentAccounts ?? []).map((account) => account.id)),
    isLoading,
  };
}
