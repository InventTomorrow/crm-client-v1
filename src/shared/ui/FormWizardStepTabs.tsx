"use client";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useEffect, useRef } from "react";

export interface FormWizardStepTab {
  id: string;
  label: string;
  isActive: boolean;
  isComplete: boolean;
  isLocked: boolean;
  hasError?: boolean;
}

interface FormWizardStepTabsProps {
  tabs: FormWizardStepTab[];
  onStepSelect: (stepIndex: number) => void;
  className?: string;
}

/** Compact, sticky step bar for narrow screens — replaces the tall step rail there. */
export function FormWizardStepTabs({
  tabs,
  onStepSelect,
  className,
}: FormWizardStepTabsProps) {
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const activeTabIndex = tabs.findIndex((tab) => tab.isActive);

  // Scrolls only the tab strip — scrollIntoView would also jerk the page vertically.
  useEffect(() => {
    const tabScroll = tabScrollRef.current;
    const activeTab = tabScroll?.querySelector<HTMLElement>(
      '[aria-current="step"]',
    );
    if (!tabScroll || !activeTab) return;
    tabScroll.scrollTo({
      left:
        activeTab.offsetLeft -
        (tabScroll.clientWidth - activeTab.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [activeTabIndex]);

  return (
    <div
      className={cn(
        "sticky top-0 z-20 -mx-4 bg-[var(--bg)]/95 px-4 py-2 backdrop-blur-md",
        className,
      )}
    >
      <nav aria-label="Form steps" className="card p-1.5">
        <div
          ref={tabScrollRef}
          className="relative flex snap-x gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              type="button"
              disabled={tab.isLocked}
              aria-current={tab.isActive ? "step" : undefined}
              onClick={() => onStepSelect(index)}
              className={cn(
                "flex shrink-0 snap-center items-center gap-2 whitespace-nowrap rounded-lg py-1.5 pl-1.5 pr-3 text-[12.5px] transition-colors duration-200",
                tab.isActive
                  ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent)]"
                  : "font-medium text-[var(--ink-soft)] hover:bg-[var(--surface-2)]",
                tab.isLocked &&
                  "cursor-not-allowed opacity-45 hover:bg-transparent",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10.5px] font-semibold transition-colors duration-200",
                  tab.hasError
                    ? "border-[var(--destructive)] text-[var(--destructive)]"
                    : tab.isComplete
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                      : tab.isActive
                        ? "border-[var(--accent)] text-[var(--accent)]"
                        : "border-[var(--line)] text-[var(--ink-mute)]",
                )}
              >
                {tab.isComplete && !tab.hasError ? (
                  <Check size={11} strokeWidth={3} />
                ) : (
                  index + 1
                )}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-1.5 flex gap-1 px-1 pb-0.5" aria-hidden>
          {tabs.map((tab) => (
            <span
              key={tab.id}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300",
                tab.hasError
                  ? "bg-[var(--destructive)]"
                  : tab.isComplete
                    ? "bg-[var(--accent)]"
                    : tab.isActive
                      ? "bg-[var(--accent)]/40"
                      : "bg-[var(--line)]",
              )}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
