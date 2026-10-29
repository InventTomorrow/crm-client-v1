// The shared list pins its height at h-8 under the horizontal-tabs variant, so the overrides repeat that prefix.
export const LINE_TAB_LIST_CLASS =
  "w-full justify-start gap-1 rounded-none border-b border-[var(--line)] bg-transparent p-0 group-data-horizontal/tabs:h-12";

export const LINE_TAB_TRIGGER_CLASS =
  "h-full flex-none gap-2.5 rounded-none px-5 text-[13.5px] font-medium text-[var(--ink-mute)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] data-active:font-semibold data-active:text-[var(--ink)] group-data-[variant=line]/tabs-list:data-active:bg-[var(--accent-soft)] group-data-horizontal/tabs:after:bottom-0 group-data-horizontal/tabs:after:h-[3px] after:bg-[var(--accent)] [&_svg]:text-[var(--ink-mute)] data-active:[&_svg]:text-[var(--accent)]";
