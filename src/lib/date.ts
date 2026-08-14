// Date formatting for timestamps the user reads. Everything renders in the
// browser's timezone, so "Today" always means the viewer's today.

const startOfLocalDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const DAY_MS = 24 * 60 * 60 * 1000;

const parse = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/** Calendar days between an instant and today — 0 today, 1 yesterday. */
const daysAgo = (date: Date): number =>
  Math.round((startOfLocalDay(new Date()) - startOfLocalDay(date)) / DAY_MS);

/** "7 Aug 2026" — unambiguous, so it never reads as 8 July. */
export function formatDate(value: string | Date | null | undefined, fallback = '—'): string {
  const date = parse(value);
  if (!date) return fallback;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** "7 Aug 2026, 3:42 PM" — for detail views where the exact moment matters. */
export function formatDateTime(value: string | Date | null | undefined, fallback = '—'): string {
  const date = parse(value);
  if (!date) return fallback;
  return `${formatDate(date)}, ${date.toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })}`;
}

/** Recent days read as "Today"/"Yesterday"; anything older gets its date. */
export function formatActivityDate(
  value: string | Date | null | undefined,
  fallback = 'Never',
): string {
  const date = parse(value);
  if (!date) return fallback;
  const days = daysAgo(date);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(date);
}
