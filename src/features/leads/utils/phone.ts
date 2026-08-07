/**
 * The last 10 digits of a phone number — mirrors the server's identity rule, so
 * "+92 300 1234567" and "03001234567" are treated as the same lead.
 * Returns an empty string when the input carries no usable digits.
 */
export const localPhoneDigits = (phone: string): string =>
  phone.replace(/\D/g, '').slice(-10);
