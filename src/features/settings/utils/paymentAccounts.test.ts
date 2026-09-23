import { describe, expect, it } from "vitest";
import { paymentAccountSchema } from "../types";
import {
  getEffectiveDefaultAccountId,
  isPaymentAccountValid,
  maskAccountNumber,
  toPaymentAccountForm,
} from "./paymentAccounts";

describe("payment account helpers", () => {
  it("uses the saved default when it is still offered", () => {
    expect(getEffectiveDefaultAccountId(["a", "b"], "b")).toBe("b");
  });

  it("falls back to the first account when the default is missing or stale", () => {
    expect(getEffectiveDefaultAccountId(["a", "b"], null)).toBe("a");
    expect(getEffectiveDefaultAccountId(["a", "b"], "gone")).toBe("a");
    expect(getEffectiveDefaultAccountId([], "a")).toBeNull();
  });

  it("maps nullable server fields to empty form strings", () => {
    expect(
      toPaymentAccountForm({
        id: "a",
        method: "EASYPAISA",
        accountTitle: "Acme",
        accountNumber: "0300",
        bankName: null,
        iban: null,
        instructions: null,
      }),
    ).toMatchObject({ bankName: "", iban: "", instructions: "" });
  });
});

describe("payment account validation", () => {
  const baseAccount = {
    id: "a",
    method: "EASYPAISA" as const,
    accountTitle: "Acme Traders",
    accountNumber: "0300 1234567",
    bankName: "",
    iban: "",
    instructions: "",
  };

  it("accepts a well-formed wallet account and normalises its number", () => {
    const parsed = paymentAccountSchema.parse(baseAccount);
    expect(parsed.accountNumber).toBe("03001234567");
  });

  it("flags saved accounts that break the rules", () => {
    expect(isPaymentAccountValid(baseAccount)).toBe(true);
    expect(isPaymentAccountValid({ ...baseAccount, accountNumber: "123" })).toBe(false);
    expect(isPaymentAccountValid({ ...baseAccount, instructions: "pay at https://x.io" })).toBe(false);
  });

  it("rejects an IBAN with bad check digits", () => {
    const bankAccount = { ...baseAccount, method: "BANK_TRANSFER" as const, accountNumber: "012345678901", bankName: "HBL" };
    expect(isPaymentAccountValid({ ...bankAccount, iban: "PK36SCBL0000001123456702" })).toBe(true);
    expect(isPaymentAccountValid({ ...bankAccount, iban: "PK37SCBL0000001123456702" })).toBe(false);
  });

  it("masks all but the last four digits", () => {
    expect(maskAccountNumber("03001234567")).toBe("•••• 4567");
  });
});
