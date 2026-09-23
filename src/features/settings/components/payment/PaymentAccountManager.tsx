"use client";
import { Button } from "@/shared/ui/Button";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { AlertTriangle, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { PaymentAccountForm } from "../../types";
import { isPaymentAccountValid } from "../../utils/paymentAccounts";
import { PaymentAccountDialog } from "./PaymentAccountDialog";
import { PaymentAccountRemovalSummary } from "./PaymentAccountRemovalSummary";
import { PaymentAccountSummaryRow } from "./PaymentAccountSummaryRow";

const MAX_PAYMENT_ACCOUNTS = 10;

interface PaymentAccountManagerProps {
  /** Title and description, shown left of the Add button. */
  heading: ReactNode;
  accounts: PaymentAccountForm[];
  effectiveDefaultId: string | null;
  /** The account a default change is saving for — its button shows a spinner. */
  defaultingAccountId?: string | null;
  isSaving?: boolean;
  emptyText: string;
  /** Ask before removing — for lists that save immediately. */
  confirmRemoval?: boolean;
  /** What else stops when an account goes, shown in the removal dialog. */
  removalImpact?: string;
  onSave: (account: PaymentAccountForm, onDone: () => void) => void;
  onRemove: (accountId: string, onDone: () => void) => void;
  onMakeDefault: (accountId: string) => void;
}

/** Accounts as a summary grid; adding or editing one opens a dialog. */
export function PaymentAccountManager({
  heading,
  accounts,
  effectiveDefaultId,
  defaultingAccountId = null,
  isSaving = false,
  emptyText,
  confirmRemoval = false,
  removalImpact,
  onSave,
  onRemove,
  onMakeDefault,
}: PaymentAccountManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editedAccount, setEditedAccount] = useState<PaymentAccountForm | null>(
    null,
  );
  const [accountPendingRemoval, setAccountPendingRemoval] =
    useState<PaymentAccountForm | null>(null);

  const hasOutdatedAccount = accounts.some(
    (account) => !isPaymentAccountValid(account),
  );
  const nextDefaultAfterRemoval = accounts.find(
    (account) => account.id !== accountPendingRemoval?.id,
  );

  const openDialog = (account: PaymentAccountForm | null) => {
    setEditedAccount(account);
    setIsDialogOpen(true);
  };

  const requestRemoval = (account: PaymentAccountForm) => {
    if (confirmRemoval) setAccountPendingRemoval(account);
    else onRemove(account.id, () => undefined);
  };

  return (
    // A container, not the viewport, sets the columns — the service form column is far narrower than the screen.
    <div className="@container flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">{heading}</div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSaving || accounts.length >= MAX_PAYMENT_ACCOUNTS}
          onClick={() => openDialog(null)}
        >
          <Plus size={13} /> Add account
        </Button>
      </div>

      {hasOutdatedAccount && (
        <p className="flex items-center gap-1.5 rounded-lg bg-[var(--warning-soft)] px-3 py-2 text-[12px] text-[var(--warning-foreground)]">
          <AlertTriangle size={13} className="flex-shrink-0" />
          Some saved details don&apos;t pass the current checks. Edit the
          accounts marked &ldquo;Needs update&rdquo; before customers pay into
          them.
        </p>
      )}

      {accounts.length === 0 ? (
        <p className="py-1 text-[12px] text-[var(--ink-mute)]">{emptyText}</p>
      ) : (
        <div className="grid w-full grid-cols-1 gap-2.5 @2xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4">
          {accounts.map((account) => (
            <PaymentAccountSummaryRow
              key={account.id}
              account={account}
              isDefault={effectiveDefaultId === account.id}
              isMakingDefault={defaultingAccountId === account.id}
              needsUpdate={!isPaymentAccountValid(account)}
              disabled={isSaving}
              onMakeDefault={() => onMakeDefault(account.id)}
              onEdit={() => openDialog(account)}
              onRemove={() => requestRemoval(account)}
            />
          ))}
        </div>
      )}

      <PaymentAccountDialog
        isOpen={isDialogOpen}
        editedAccount={editedAccount}
        isSaving={isSaving}
        onClose={() => setIsDialogOpen(false)}
        onSave={(account) => onSave(account, () => setIsDialogOpen(false))}
      />

      <ConfirmDialog
        open={!!accountPendingRemoval}
        onClose={() => setAccountPendingRemoval(null)}
        onConfirm={() => {
          if (!accountPendingRemoval) return;
          onRemove(accountPendingRemoval.id, () =>
            setAccountPendingRemoval(null),
          );
        }}
        title="Remove this payment account?"
        description="Customers will no longer be sent these details. Orders already placed keep their receipts."
        confirmLabel="Remove account"
        loading={isSaving}
      >
        {accountPendingRemoval && (
          <PaymentAccountRemovalSummary
            account={accountPendingRemoval}
            isDefault={effectiveDefaultId === accountPendingRemoval.id}
            nextDefaultTitle={nextDefaultAfterRemoval?.accountTitle ?? null}
            removalImpact={removalImpact}
          />
        )}
      </ConfirmDialog>
    </div>
  );
}
