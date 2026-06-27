/** Compact relative time for chat list rows: "just now", "5m", "3h", "2d". */
export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

/** Local HH:MM time shown under message bubbles. */
export function shortTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Local YYYY-MM-DD key for grouping messages by calendar day. */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * Groups consecutive items by calendar day, preserving order. Each group can
 * host its own sticky date header so only the in-view day sticks (older days
 * scroll away) instead of every header stacking at the top.
 */
export function groupByDay<T extends { createdAt: string }>(
  items: T[],
): { key: string; iso: string; items: T[] }[] {
  const groups: { key: string; iso: string; items: T[] }[] = [];
  for (const item of items) {
    const key = dayKey(item.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(item);
    else groups.push({ key, iso: item.createdAt, items: [item] });
  }
  return groups;
}

/** WhatsApp-style day label: Today, Yesterday, or a full date. */
export function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (dayKey(iso) === dayKey(today.toISOString())) return "Today";
  if (dayKey(iso) === dayKey(yesterday.toISOString())) return "Yesterday";

  return d.toLocaleDateString([], {
    day: "numeric",
    month: "long",
    ...(d.getFullYear() !== today.getFullYear() ? { year: "numeric" } : {}),
  });
}
