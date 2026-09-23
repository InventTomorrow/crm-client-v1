"use client";
import { Loader2 } from "lucide-react";
import { usePaymentAccountsManager } from "../../hooks/usePaymentAccountsManager";
import { PaymentAccountManager } from "./PaymentAccountManager";

export function PaymentAccountsCard() {
  const {
    accounts,
    effectiveDefaultId,
    defaultingAccountId,
    isLoading,
    isSaving,
    saveAccount,
    removeAccount,
    makeDefault,
  } = usePaymentAccountsManager();

  return (
    <div className="card p-[22px]">
      {isLoading ? (
        <Loader2 size={18} className="animate-spin text-[var(--ink-mute)]" />
      ) : (
        <PaymentAccountManager
          heading={
            <>
              <h4 className="text-[13.5px] font-semibold">Payment details</h4>
              <p className="text-[11px] text-[var(--ink-mute)] mt-0.5">
                Accounts customers pay into. Any service that collects payment
                can offer these — customers are sent the default one, and the next only if they cannot use it. Changes save
                immediately.
              </p>
            </>
          }
          accounts={accounts}
          effectiveDefaultId={effectiveDefaultId}
          defaultingAccountId={defaultingAccountId}
          isSaving={isSaving}
          confirmRemoval
          removalImpact="Services that offer it stop sharing it with customers."
          emptyText="No payment accounts yet. Add a bank account or wallet your customers can pay into."
          onSave={saveAccount}
          onRemove={removeAccount}
          onMakeDefault={makeDefault}
        />
      )}
    </div>
  );
}
