import { memo } from "react";

function AddMenuItemBase({
  Icon,
  title,
  sub,
  onClick,
}: {
  Icon: React.ElementType;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-left hover:bg-[var(--surface-2)] transition-colors"
    >
      <span className="w-7 h-7 rounded-lg inline-flex items-center justify-center flex-shrink-0 bg-[var(--accent-soft)] text-[var(--accent)]">
        <Icon size={13} />
      </span>
      <div className="flex-1">
        <div className="text-[13px] font-medium text-[var(--ink)]">{title}</div>
        <div className="text-[11px] text-[var(--ink-mute)]">{sub}</div>
      </div>
    </button>
  );
}

export const AddMenuItem = memo(AddMenuItemBase);
