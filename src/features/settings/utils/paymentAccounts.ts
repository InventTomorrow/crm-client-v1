import { paymentAccountSchema, type PaymentAccount, type PaymentAccountForm } from "../types";

/** A missing or stale default falls back to the first account — the server resolves it the same way. */
export function getEffectiveDefaultAccountId(
  candidateAccountIds: readonly string[],
  defaultAccountId: string | null | undefined,
): string | null {
  if (defaultAccountId && candidateAccountIds.includes(defaultAccountId)) return defaultAccountId;
  return candidateAccountIds[0] ?? null;
}

export function buildEmptyPaymentAccount(): PaymentAccountForm {
  return {
    id: crypto.randomUUID(),
    method: "BANK_TRANSFER",
    accountTitle: "",
    accountNumber: "",
    bankName: "",
    iban: "",
    instructions: "",
  };
}

export function toPaymentAccountForm(account: PaymentAccount): PaymentAccountForm {
  return {
    id: account.id,
    method: account.method,
    accountTitle: account.accountTitle,
    accountNumber: account.accountNumber,
    bankName: account.bankName ?? "",
    iban: account.iban ?? "",
    instructions: account.instructions ?? "",
  };
}

/** Saved accounts may predate today's rules; these are flagged until someone edits them. */
export const isPaymentAccountValid = (account: PaymentAccountForm): boolean =>
  paymentAccountSchema.safeParse(account).success;

export const maskAccountNumber = (accountNumber: string): string =>
  accountNumber.length <= 4 ? accountNumber : `•••• ${accountNumber.slice(-4)}`;

export function getPaymentAccountLabel(account: Pick<PaymentAccount, "accountTitle" | "accountNumber" | "bankName">): string {
  const provider = account.bankName ? ` · ${account.bankName}` : "";
  return `${account.accountTitle}${provider} — ${account.accountNumber}`;
}
