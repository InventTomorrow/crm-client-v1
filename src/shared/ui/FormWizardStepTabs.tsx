"use client";
import { cn } from "@/lib/utils";
import { AlertCircle, Check } from "lucide-react";
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
      <nav aria-label="Form steps" className="card overflow-hidden p-0">
        <div
          ref={tabScrollRef}
          className="relative flex snap-x divide-x divide-[var(--line)] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              type="button"
              disabled={tab.isLocked}
              aria-current={tab.isActive ? "step" : undefined}
              onClick={() => onStepSelect(index)}
              className={cn(
                "relative flex shrink-0 snap-center items-center gap-1.5 whitespace-nowrap border-l-2 py-2 pl-3 pr-7 text-[12.5px] transition-colors duration-200",
                tab.isActive
                  ? "border-l-[var(--accent)] font-semibold text-[var(--ink)]"
                  : "border-l-transparent font-medium text-[var(--ink-soft)] hover:bg-[var(--surface-2)]",
                tab.isLocked &&
                  "cursor-not-allowed opacity-45 hover:bg-transparent",
              )}
            >
              <span className="text-[10.5px] text-[var(--ink-mute)]">
                {index + 1}
              </span>
              {tab.hasError ? (
                <AlertCircle
                  size={12}
                  className="absolute right-1.5 top-1.5 text-[var(--destructive)]"
                />
              ) : (
                tab.isComplete && (
                  <Check
                    size={12}
                    strokeWidth={3}
                    className="absolute right-1.5 top-1.5 text-[var(--accent)]"
                  />
                )
              )}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex" aria-hidden>
          {tabs.map((tab) => (
            <span
              key={tab.id}
              className={cn(
                "h-0.5 flex-1 transition-colors duration-300",
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
