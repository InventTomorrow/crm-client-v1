"use client";
import { Button } from "@/shared/ui/Button";
import {
  AlertTriangle,
  Building2,
  Globe,
  Hash,
  Pencil,
  ShieldCheck,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { PAYMENT_METHOD_LABELS, type PaymentAccountForm } from "../../types";
import { DefaultAccountButton } from "./DefaultAccountButton";
import { PaymentMethodIcon } from "./PaymentMethodIcon";

interface PaymentAccountSummaryRowProps {
  account: PaymentAccountForm;
  isDefault: boolean;
  isMakingDefault: boolean;
  /** Saved details that no longer pass the rules — editing is required before reuse. */
  needsUpdate: boolean;
  disabled: boolean;
  onMakeDefault: () => void;
  onEdit: () => void;
  onRemove: () => void;
}

function DetailRow({
  Icon,
  label,
  value,
  isNumber = false,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  isNumber?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <dt className="flex w-20 flex-shrink-0 items-center gap-1.5 text-[var(--ink-mute)]">
        <Icon size={12} aria-hidden />
        {label}
      </dt>
      <dd
        title={value}
        className={
          isNumber
            ? "min-w-0 truncate font-mono tabular-nums tracking-wide text-[var(--ink)]"
            : "min-w-0 truncate text-[var(--ink-soft)]"
        }
      >
        {value}
      </dd>
    </div>
  );
}

/** Stacked so it reads at any card width — a narrow form column included. */
export function PaymentAccountSummaryRow({
  account,
  isDefault,
  isMakingDefault,
  needsUpdate,
  disabled,
  onMakeDefault,
  onEdit,
  onRemove,
}: PaymentAccountSummaryRowProps) {
  return (
    <div className="flex h-full min-w-0 flex-col gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3.5">
      <div className="flex min-w-0 items-start gap-3">
        <PaymentMethodIcon method={account.method} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p
            title={account.accountTitle}
            className="min-w-0 truncate text-[14px] font-semibold leading-tight text-[var(--ink)]"
          >
            {account.accountTitle}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 text-[10.5px] font-medium uppercase tracking-wide text-[var(--ink-mute)]">
              {PAYMENT_METHOD_LABELS[account.method]}
            </span>
            {needsUpdate ? (
              <button
                type="button"
                onClick={onEdit}
                disabled={disabled}
                className="inline-flex items-center gap-1 rounded-md bg-[var(--warning-soft)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--warning-foreground)] hover:underline"
              >
                <AlertTriangle size={11} /> Needs update
              </button>
            ) : (
              // Format checks only (number shape, IBAN check digits) — not a bank-side verification.
              <span
                title="Account number format and IBAN check digits pass our checks"
                className="inline-flex items-center gap-1 rounded-md bg-[var(--success-soft)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--success-foreground)]"
              >
                <ShieldCheck size={11} /> Checked
              </span>
            )}
          </div>
        </div>
      </div>

      <dl className="flex min-w-0 flex-col gap-0.5 text-[12.5px]">
        {account.bankName && (
          <DetailRow Icon={Building2} label="Bank" value={account.bankName} />
        )}
        <DetailRow
          Icon={Hash}
          label="Account"
          value={account.accountNumber}
          isNumber
        />
        {account.iban && (
          <DetailRow Icon={Globe} label="IBAN" value={account.iban} isNumber />
        )}
      </dl>

      {account.instructions && (
        <p
          dir="auto"
          className="line-clamp-2 border-l-2 border-[var(--line)] pl-2 text-[12px] italic leading-snug text-[var(--ink-mute)]"
        >
          {account.instructions}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--line)] pt-2.5">
        <DefaultAccountButton
          isDefault={isDefault}
          isLoading={isMakingDefault}
          disabled={disabled}
          onMakeDefault={onMakeDefault}
        />
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Edit account"
            disabled={disabled}
            onClick={onEdit}
          >
            <Pencil size={14} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Remove account"
            disabled={disabled}
            className="text-[var(--ink-mute)] hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
