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

// Friendly copy for HTTP statuses when the backend didn't send a structured message.
const STATUS_MESSAGES: Record<number, string> = {
  400: 'Some details look invalid. Please check the form and try again.',
  401: 'Your email or password is incorrect.',
  403: "You don't have permission to do that.",
  404: "We couldn't reach this service. Please try again shortly.",
  409: 'That already exists. Try signing in instead.',
  422: 'Some details look invalid. Please check the form and try again.',
  429: 'Too many attempts. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again.',
  502: 'The server is temporarily unavailable. Please try again shortly.',
  503: 'The server is temporarily unavailable. Please try again shortly.',
  504: 'The server took too long to respond. Please try again.',
};

// Extracts a user-friendly message from any thrown error.
// Order: backend's structured message → HTTP status copy → network copy → generic fallback.
// Raw axios strings ("Request failed with status code 404") are never surfaced to users.
export function extractErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!error) return fallback;
  const err = error as Record<string, unknown>;

  const response = err?.response as Record<string, unknown> | undefined;
  const responseData = response?.data as Record<string, unknown> | undefined;
  if (responseData && typeof responseData.error === 'object' && responseData.error !== null) {
    const apiError = responseData.error as Record<string, unknown>;
    const apiMsg = apiError.message;

    // Prefer the first field-level message for validation errors — it's the
    // friendly per-field copy (e.g. "Workspace name is required") rather than a
    // raw "Validation failed: field — ..." dump from older API builds.
    const details = apiError.details;
    if (Array.isArray(details) && details.length > 0) {
      const firstMsg = (details[0] as Record<string, unknown>)?.message;
      if (typeof firstMsg === 'string' && firstMsg) {
        return details.length > 1
          ? `${firstMsg} (and ${details.length - 1} more ${details.length - 1 === 1 ? 'issue' : 'issues'})`
          : firstMsg;
      }
    }

    if (typeof apiMsg === 'string' && apiMsg && !/^validation failed:/i.test(apiMsg)) {
      return apiMsg;
    }
    if (typeof apiMsg === 'string' && apiMsg) return apiMsg;
  }

  const status = typeof response?.status === 'number' ? response.status : undefined;
  if (status && STATUS_MESSAGES[status]) return STATUS_MESSAGES[status];
  if (status && status >= 500) return STATUS_MESSAGES[500];

  // No response means the request never reached the server (offline, DNS, CORS, timeout).
  if (!response && (err?.code === 'ERR_NETWORK' || err?.code === 'ECONNABORTED' || err?.request)) {
    return 'Unable to connect. Check your internet connection and try again.';
  }

  const message = typeof err?.message === 'string' ? err.message : '';
  if (message && !/^request failed with status code/i.test(message)) return message;
  return fallback;
}

// The backend's machine-readable error code ("billing/plan_limit_reached"),
// for call sites that branch on WHY a request failed, not just the copy.
export function extractApiErrorCode(error: unknown): string | null {
  const response = (error as Record<string, unknown> | null)?.response as
    | Record<string, unknown>
    | undefined;
  const responseData = response?.data as Record<string, unknown> | undefined;
  const apiError = responseData?.error as Record<string, unknown> | undefined;
  return typeof apiError?.code === 'string' ? apiError.code : null;
}

// Hits the API origin directly rather than the Next.js rewrite proxy — the
// accessToken cookie is host-only (COOKIE_DOMAIN unset), scoped to the API
// origin because apiClient authenticates against it directly. A relative
// path here would send the <img> request to the frontend origin instead,
// which never had the cookie set on it, and 401 at the backend.
export function getImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (!url.includes('amazonaws.com')) return url;
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? '';
  return `${apiOrigin}/api/v1/upload/image?url=${encodeURIComponent(url)}`;
}

// Falls back to the URL extension for records saved before mime types were stored.
export function isPdfFile(
  mimeType: string | null | undefined,
  fileUrl?: string | null,
): boolean {
  if (mimeType?.toLowerCase() === 'application/pdf') return true;
  if (!fileUrl) return false;
  return fileUrl.split('?')[0].toLowerCase().endsWith('.pdf');
}
