import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function pkr(n: number): string {
  return 'Rs. ' + n.toLocaleString('en-PK');
}

const PALETTES: [string, string][] = [
  ['#4FC3F7', '#7C3AED'],
  ['#F472B6', '#7C3AED'],
  ['#34D399', '#0EA5E9'],
  ['#FBBF24', '#F472B6'],
  ['#22D3EE', '#7C3AED'],
  ['#A78BFA', '#22D3EE'],
];

export function gradientFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  const [a, b] = PALETTES[h % PALETTES.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

export function initials(name: string): string {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

// Extracts a user-friendly message from any thrown error.
// Handles API errors ({ success: false, error: { code, message } }), network errors, and generic errors.
export function extractErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!error) return fallback;
  const err = error as Record<string, unknown>;
  const responseData = (err?.response as Record<string, unknown>)?.data as Record<string, unknown>;
  if (responseData && typeof responseData.error === 'object' && responseData.error !== null) {
    const apiMsg = (responseData.error as Record<string, unknown>).message;
    if (typeof apiMsg === 'string' && apiMsg) return apiMsg;
  }
  if (typeof err?.message === 'string' && err.message) return err.message;
  return fallback;
}

export function getImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return url.includes('amazonaws.com')
    ? `/api/v1/upload/image?url=${encodeURIComponent(url)}`
    : url;
}
