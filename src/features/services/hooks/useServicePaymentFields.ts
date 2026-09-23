'use client';
import { useChatbotConfig } from '@/features/settings/hooks/useChatbotSettings';
import { useWatch } from 'react-hook-form';
import type { ServiceOfferingForm } from '../types';

/** The service's payment toggle and its pick of workspace-wide accounts. */
export function useServicePaymentFields(form: ServiceOfferingForm) {
  const { data: chatbotConfig, isLoading: isLoadingWorkspaceAccounts } = useChatbotConfig();
  const workspaceAccounts = chatbotConfig?.config?.paymentAccounts ?? [];

  const collectPayment = useWatch({ control: form.control, name: 'collectPayment' }) ?? false;
  const savedSelection = useWatch({ control: form.control, name: 'globalPaymentAccountIds' }) ?? [];
  const serviceAccounts = useWatch({ control: form.control, name: 'paymentAccounts' }) ?? [];
  // Ids of workspace accounts deleted since this service was saved are ignored, as on the server.
  const selectedWorkspaceAccountIds = savedSelection.filter((accountId) =>
    workspaceAccounts.some((account) => account.id === accountId),
  );

  const setSelection = (accountIds: string[]) =>
    form.setValue('globalPaymentAccountIds', accountIds, { shouldDirty: true, shouldValidate: true });

  // Turning collection on for the first time offers every workspace account, ready to trim.
  const toggleCollectPayment = (isOn: boolean) => {
    form.setValue('collectPayment', isOn, { shouldDirty: true, shouldValidate: true });
    if (isOn && selectedWorkspaceAccountIds.length === 0 && serviceAccounts.length === 0) {
      setSelection(workspaceAccounts.map((account) => account.id));
    }
  };

  const toggleWorkspaceAccount = (accountId: string, isSelected: boolean) =>
    setSelection(
      isSelected
        ? [...selectedWorkspaceAccountIds, accountId]
        : selectedWorkspaceAccountIds.filter((selectedId) => selectedId !== accountId),
    );

  return {
    collectPayment,
    workspaceAccounts,
    isLoadingWorkspaceAccounts,
    selectedWorkspaceAccountIds,
    toggleCollectPayment,
    toggleWorkspaceAccount,
  };
}
