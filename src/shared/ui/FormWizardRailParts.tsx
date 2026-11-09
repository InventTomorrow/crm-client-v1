interface FormWizardRailProgressProps {
  completedCount: number;
  totalCount: number;
}

export function FormWizardRailHeading({ title }: { title: string }) {
  return (
    <div className="border-b border-[var(--line)] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-mute)]">
      {title}
    </div>
  );
}

export function FormWizardRailProgress({
  completedCount,
  totalCount,
}: FormWizardRailProgressProps) {
  const progressPercent =
    totalCount === 0 ? 100 : (completedCount / totalCount) * 100;

  return (
    <div className="border-t border-[var(--line)] px-4 py-3">
      <div className="flex items-center justify-between text-[11px] font-medium text-[var(--ink-mute)]">
        <span>Completed</span>
        <span className="text-[var(--ink)]">
          {completedCount} of {totalCount}
        </span>
      </div>
      <div className="mt-2 h-1 bg-[var(--line)]">
        <div
          className="h-full bg-[var(--accent)] transition-[width] duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
