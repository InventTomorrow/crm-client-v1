"use client";
import { PAYMENT_METHOD_LABELS, type PaymentAccountForm } from "../../types";
import { maskAccountNumber } from "../../utils/paymentAccounts";
import { PaymentMethodIcon } from "./PaymentMethodIcon";

interface PaymentAccountRemovalSummaryProps {
  account: PaymentAccountForm;
  isDefault: boolean;
  nextDefaultTitle: string | null;
  removalImpact?: string | undefined;
}

export function PaymentAccountRemovalSummary({
  account,
  isDefault,
  nextDefaultTitle,
  removalImpact,
}: PaymentAccountRemovalSummaryProps) {
  const provider = [PAYMENT_METHOD_LABELS[account.method], account.bankName]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2.5">
        <PaymentMethodIcon method={account.method} className="h-8 w-8" />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-[var(--ink)]">
            {account.accountTitle}
          </p>
          <p className="text-[12px] text-[var(--ink-soft)]">{provider}</p>
          <p className="font-mono text-[12px] tabular-nums tracking-wide text-[var(--ink-mute)]">
            {maskAccountNumber(account.accountNumber)}
          </p>
        </div>
      </div>
      <ul className="flex list-disc flex-col gap-1 pl-4 text-[12px] leading-snug text-[var(--ink-mute)]">
        {isDefault && (
          <li className="text-[var(--warning-foreground)]">
            This is the default account.{" "}
            {nextDefaultTitle
              ? `"${nextDefaultTitle}" becomes the default.`
              : "No accounts will be left to share."}
          </li>
        )}
        {removalImpact && <li>{removalImpact}</li>}
        <li>Workspace owners are emailed about this change.</li>
      </ul>
    </div>
  );
}
