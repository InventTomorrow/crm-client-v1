"use client";
import { DefaultAccountButton } from "@/features/settings/components/payment/DefaultAccountButton";
import { PaymentAccountManager } from "@/features/settings/components/payment/PaymentAccountManager";
import { PaymentMethodIcon } from "@/features/settings/components/payment/PaymentMethodIcon";
import { usePaymentAccountList } from "@/features/settings/hooks/usePaymentAccountList";
import { PAYMENT_METHOD_LABELS } from "@/features/settings/types";
import { getPaymentAccountLabel } from "@/features/settings/utils/paymentAccounts";
import { Checkbox } from "@/shared/ui/Checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Switch } from "@/shared/ui/Switch";
import Link from "next/link";
import { useServicePaymentFields } from "../../hooks/useServicePaymentFields";
import type { ServiceFormSectionProps } from "../../types";

export function ServicePaymentFields({
  form,
  isSaving,
}: ServiceFormSectionProps) {
  const {
    collectPayment,
    workspaceAccounts,
    isLoadingWorkspaceAccounts,
    selectedWorkspaceAccountIds,
    toggleCollectPayment,
    toggleWorkspaceAccount,
  } = useServicePaymentFields(form);
  const serviceAccountList = usePaymentAccountList(selectedWorkspaceAccountIds);
  const { effectiveDefaultId } = serviceAccountList;

  return (
    <>
      <FormField
        control={form.control}
        name="collectPayment"
        render={() => (
          <FormItem>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3">
              <div>
                <FormLabel>Collect payment in chat</FormLabel>
                <p className="mt-0.5 text-xs text-[var(--ink-mute)]">
                  {collectPayment
                    ? "After an order, the bot sends the default account below and asks for a receipt — the next one only if the customer cannot pay into it. The order stays payment pending until a receipt arrives."
                    : "Off — the bot takes the order and your team arranges payment."}
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={collectPayment}
                  disabled={isSaving}
                  onCheckedChange={toggleCollectPayment}
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {collectPayment && (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-[12.5px] font-medium text-[var(--ink)]">
              Workspace accounts
            </p>
            {!isLoadingWorkspaceAccounts && workspaceAccounts.length === 0 && (
              <p className="text-xs text-[var(--ink-mute)]">
                No workspace accounts yet.{" "}
                <Link
                  href="/settings/business"
                  className="text-[var(--accent)] hover:underline"
                >
                  Add them in Settings → Business
                </Link>{" "}
                or add an account for this service below.
              </p>
            )}
            {workspaceAccounts.map((account) => {
              const isSelected = selectedWorkspaceAccountIds.includes(
                account.id,
              );
              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5"
                >
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                    <Checkbox
                      checked={isSelected}
                      disabled={isSaving}
                      onCheckedChange={(checked) =>
                        toggleWorkspaceAccount(account.id, checked === true)
                      }
                    />
                    <PaymentMethodIcon method={account.method} className="h-8 w-8" />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] text-[var(--ink)]">
                        {getPaymentAccountLabel(account)}
                      </span>
                      <span className="text-[11px] text-[var(--ink-mute)]">
                        {PAYMENT_METHOD_LABELS[account.method]}
                      </span>
                    </span>
                  </label>
                  {isSelected && (
                    <DefaultAccountButton
                      isDefault={effectiveDefaultId === account.id}
                      disabled={isSaving}
                      onMakeDefault={() =>
                        serviceAccountList.makeDefault(account.id)
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>

          <PaymentAccountManager
            heading={
              <p className="text-[12.5px] font-medium text-[var(--ink)]">
                Accounts for this service only
              </p>
            }
            accounts={serviceAccountList.accounts}
            effectiveDefaultId={effectiveDefaultId}
            isSaving={isSaving}
            emptyText="None — the selected workspace accounts are used."
            onSave={serviceAccountList.saveAccount}
            onRemove={serviceAccountList.removeAccount}
            onMakeDefault={serviceAccountList.makeDefault}
          />
        </>
      )}
    </>
  );
}
