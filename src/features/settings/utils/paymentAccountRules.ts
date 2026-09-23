// Mirrors server/src/modules/payment-details/payment-account.rules.ts — change both together.

// Control, zero-width and bidi-override characters can hide or reorder what a customer reads.
const INVISIBLE_CHARACTERS = /[\u0000-\u001F\u007F-\u009F​-\u200F\u202A-\u202E⁠-⁤﻿]/g;
// Letters in any script (Urdu included), digits and the punctuation real names use.
const NAME_PATTERN = /^[\p{L}\p{M}\p{N} .,&'()\-/]+$/u;
const WALLET_NUMBER_PATTERN = /^03\d{9}$/;
const BANK_ACCOUNT_PATTERN = /^\d{8,20}$/;
const OTHER_ACCOUNT_PATTERN = /^[A-Za-z0-9@._+-]{3,50}$/;
const PAKISTAN_IBAN_PATTERN = /^PK\d{2}[A-Z]{4}[A-Z0-9]{16}$/;
// Links and markup in text the bot forwards to customers are a phishing vector.
const LINK_OR_MARKUP_PATTERN = /(https?:\/\/|www\.|[<>{}`])/i;

export type PaymentMethod = 'BANK_TRANSFER' | 'EASYPAISA' | 'JAZZCASH' | 'OTHER';

export const cleanText = (value: string): string =>
  value.replace(INVISIBLE_CHARACTERS, '').replace(/\s+/g, ' ').trim();

/** Spaces and dashes people type are dropped; a wallet's +92 / 92 prefix becomes the local 0. */
export function normalizeAccountNumber(method: PaymentMethod, value: string): string {
  const compact = cleanText(value).replace(/[\s-]/g, '');
  if (method === 'EASYPAISA' || method === 'JAZZCASH') {
    return compact.replace(/^\+?92(?=3\d{9}$)/, '0');
  }
  return compact;
}

export const normalizeIban = (value: string): string => cleanText(value).replace(/\s/g, '').toUpperCase();

/** ISO 13616 mod-97 check — catches a mistyped digit before a customer pays into it. */
export function hasValidIbanChecksum(iban: string): boolean {
  const rearranged = `${iban.slice(4)}${iban.slice(0, 4)}`;
  const digits = rearranged.replace(/[A-Z]/g, (letter) => String(letter.charCodeAt(0) - 55));
  let remainder = 0;
  for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97;
  return remainder === 1;
}

export function getNameError(value: string, label: string): string | null {
  if (value.length < 2) return `${label} must be at least 2 characters`;
  if (value.length > 100) return `${label} must be at most 100 characters`;
  if (!NAME_PATTERN.test(value)) return `${label} can only contain letters, numbers, spaces and . , & ' ( ) - /`;
  return null;
}

export function getAccountNumberError(method: PaymentMethod, accountNumber: string): string | null {
  if (!accountNumber) return 'Account number is required';
  if (method === 'EASYPAISA' || method === 'JAZZCASH') {
    return WALLET_NUMBER_PATTERN.test(accountNumber)
      ? null
      : 'Enter the 11-digit mobile wallet number, e.g. 03001234567';
  }
  if (method === 'BANK_TRANSFER') {
    return BANK_ACCOUNT_PATTERN.test(accountNumber) ? null : 'Bank account numbers are 8–20 digits';
  }
  return OTHER_ACCOUNT_PATTERN.test(accountNumber)
    ? null
    : 'Use 3–50 letters, digits or @ . _ + -';
}

export function getIbanError(method: PaymentMethod, iban: string): string | null {
  if (!iban) return null;
  if (method !== 'BANK_TRANSFER') return 'IBAN applies to bank transfers only';
  if (!PAKISTAN_IBAN_PATTERN.test(iban)) return 'Enter a 24-character Pakistani IBAN, e.g. PK36SCBL0000001123456702';
  return hasValidIbanChecksum(iban) ? null : 'This IBAN has a typo — its check digits do not match';
}

export function getInstructionsError(instructions: string): string | null {
  if (instructions.length > 300) return 'Keep the note under 300 characters';
  if (LINK_OR_MARKUP_PATTERN.test(instructions)) return 'Links and < > { } ` are not allowed in the note';
  return null;
}
