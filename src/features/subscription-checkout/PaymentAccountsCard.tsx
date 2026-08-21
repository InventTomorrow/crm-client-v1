"use client";
import { Building2, Check, Copy, Landmark, Smartphone, Wallet } from "lucide-react";
import { useState } from "react";
import { PAYMENT_METHOD_LABELS } from "./types";
import type { PaymentMethod, PublicPaymentAccount } from "./types";

const METHOD_ICON: Record<PaymentMethod, typeof Landmark> = {
  BANK_TRANSFER: Landmark,
  EASYPAISA: Smartphone,
  JAZZCASH: Smartphone,
  CASH: Wallet,
  OTHER: Building2,
};

/**
 * Where the customer actually sends the money. Rendered above the form on the
 * public checkout page — without it the page asks for a receipt for a transfer
 * the customer has no way to make.
 */
export function PaymentAccountsCard({
  accounts,
  amountLabel,
}: {
  accounts: PublicPaymentAccount[];
  amountLabel: string;
}) {
  if (accounts.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--accent)]/25 bg-[var(--surface)]">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] bg-[var(--accent-soft)] px-5 py-4">
        <div>
          <p className="text-[13.5px] font-semibold text-[var(--ink)]">
            Send your payment here
          </p>
          <p className="mt-0.5 text-[11.5px] text-[var(--ink-mute)]">
            Transfer the amount, then upload the receipt in the form.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[11.5px] font-semibold text-white">
          {amountLabel}
        </span>
      </div>

      <div className="divide-y divide-[var(--line)]">
        {accounts.map((account) => (
          <PaymentAccountRow key={account.id} account={account} />
        ))}
      </div>
    </div>
  );
}

function PaymentAccountRow({ account }: { account: PublicPaymentAccount }) {
  const MethodIcon = METHOD_ICON[account.method] ?? Building2;

  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--accent)]">
          <MethodIcon size={14} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-[var(--ink)]">
            {account.label}
          </p>
          <p className="truncate text-[11px] text-[var(--ink-mute)]">
            {PAYMENT_METHOD_LABELS[account.method] ?? account.method}
            {account.bankName ? ` · ${account.bankName}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        <AccountDetail label="Title" value={account.accountTitle} />
        <AccountDetail label="Number" value={account.accountNumber} copyable />
        {account.iban && <AccountDetail label="IBAN" value={account.iban} copyable />}
        {account.branchCode && (
          <AccountDetail label="Branch" value={account.branchCode} />
        )}
      </div>

      {account.instructions && (
        <p className="mt-3 rounded-lg bg-[var(--surface-2)] p-2.5 text-[11.5px] whitespace-pre-line text-[var(--ink-soft)]">
          {account.instructions}
        </p>
      )}
    </div>
  );
}

function AccountDetail({
  label,
  value,
  copyable,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard?.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="shrink-0 text-[11.5px] text-[var(--ink-mute)]">{label}</span>
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="truncate text-[12.5px] font-semibold text-[var(--ink)]">
          {value}
        </span>
        {copyable && (
          <button
            type="button"
            onClick={copy}
            aria-label={`Copy ${label.toLowerCase()}`}
            className="shrink-0 rounded-md p-1 text-[var(--ink-mute)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
          >
            {isCopied ? (
              <Check size={12} className="text-[var(--accent)]" />
            ) : (
              <Copy size={12} />
            )}
          </button>
        )}
      </span>
    </div>
  );
}
