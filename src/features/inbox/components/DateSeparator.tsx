import { dayLabel } from "../lib/time";

export function DateSeparator({ iso }: { iso: string }) {
  return (
    <div className="sticky top-1.5 z-10 flex justify-center py-1 pointer-events-none">
      <span className="rounded-full bg-[var(--surface-2)] border border-[var(--line)] px-3 py-1 text-[11px] font-medium text-[var(--ink-mute)] shadow-sm">
        {dayLabel(iso)}
      </span>
    </div>
  );
}
