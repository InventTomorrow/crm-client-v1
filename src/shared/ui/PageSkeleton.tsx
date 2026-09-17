import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { SkeletonBar } from "./SkeletonBar";

/** Route-level loading shell: the same scroll container and padding the page uses. */
export function SkeletonPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "scroll flex h-full flex-col gap-4 overflow-y-auto p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SkeletonPageHeader({
  actionWidths = ["w-9", "w-32"],
}: {
  /** Tailwind width classes, one per header button. */
  actionWidths?: string[];
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="space-y-2">
        <SkeletonBar className="h-6 w-36" />
        <SkeletonBar className="h-3 w-60 max-w-full" />
      </div>
      <div className="flex items-center gap-2">
        {actionWidths.map((widthClass, index) => (
          <SkeletonBar
            key={index}
            className={cn("h-9 rounded-lg", widthClass)}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonStatCards({
  count,
  gridClassName = "grid-cols-2 sm:grid-cols-3",
}: {
  count: number;
  gridClassName?: string;
}) {
  return (
    <div className={cn("grid gap-3", gridClassName)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card flex items-center gap-3 p-3.5">
          <SkeletonBar className="size-9 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <SkeletonBar className="h-2.5 w-20" />
            <SkeletonBar className="h-5 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonToolbar({
  controlWidths = ["w-[170px]"],
  trailingWidths = [],
  searchClassName = "w-full md:w-[320px]",
}: {
  controlWidths?: string[];
  /** Controls pushed to the right edge (view toggles, export). */
  trailingWidths?: string[];
  searchClassName?: string;
}) {
  return (
    <div className="card flex flex-wrap items-center gap-2 p-2">
      <SkeletonBar className={cn("h-10 rounded-lg", searchClassName)} />
      {controlWidths.map((widthClass, index) => (
        <SkeletonBar
          key={index}
          className={cn("h-10 rounded-lg", widthClass)}
        />
      ))}
      {trailingWidths.length > 0 && (
        <div className="flex items-center gap-2 md:ml-auto">
          {trailingWidths.map((widthClass, index) => (
            <SkeletonBar
              key={index}
              className={cn("h-10 rounded-lg", widthClass)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SkeletonTable({
  rowCount = 8,
  columnCount = 6,
  withCheckbox = true,
}: {
  rowCount?: number;
  columnCount?: number;
  withCheckbox?: boolean;
}) {
  const columns = Array.from({ length: columnCount });
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-4 border-b border-[var(--line)] bg-[var(--surface-2)] px-3 py-3">
        {withCheckbox && <SkeletonBar className="size-4 shrink-0 rounded" />}
        {columns.map((_, index) => (
          <SkeletonBar
            key={index}
            className={cn("h-3 flex-1", index > 2 && "hidden md:block")}
          />
        ))}
        <span className="w-8 shrink-0" />
      </div>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-4 border-b border-[var(--line-soft)] px-3 py-3.5 last:border-0"
        >
          {withCheckbox && <SkeletonBar className="size-4 shrink-0 rounded" />}
          {columns.map((_, index) => (
            <div
              key={index}
              className={cn(
                "flex-1 space-y-1.5",
                index > 2 && "hidden md:block",
              )}
            >
              <SkeletonBar
                className={cn("h-3.5", index === 1 ? "w-4/5" : "w-3/5")}
              />
              {index === 1 && <SkeletonBar className="h-2.5 w-1/2" />}
            </div>
          ))}
          <SkeletonBar className="h-4 w-8 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonListCard({ rowCount = 6 }: { rowCount?: number }) {
  return (
    <div className="card divide-y divide-[var(--line-soft)] overflow-hidden p-0">
      {Array.from({ length: rowCount }).map((_, index) => (
        <div key={index} className="flex items-start gap-3 px-4 py-3.5">
          <SkeletonBar className="size-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBar className="h-3.5 w-1/2" />
            <SkeletonBar className="h-3 w-4/5" />
          </div>
          <SkeletonBar className="h-2.5 w-14 shrink-0" />
        </div>
      ))}
    </div>
  );
}

/** A form section: heading, then label + input pairs in a responsive grid. */
export function SkeletonFormCard({
  fieldCount = 4,
  columns = 2,
}: {
  fieldCount?: number;
  columns?: 1 | 2;
}) {
  return (
    <div className="card space-y-4 p-5">
      <div className="space-y-2">
        <SkeletonBar className="h-4 w-40" />
        <SkeletonBar className="h-3 w-72 max-w-full" />
      </div>
      <div className={cn("grid gap-4", columns === 2 && "sm:grid-cols-2")}>
        {Array.from({ length: fieldCount }).map((_, index) => (
          <div key={index} className="space-y-2">
            <SkeletonBar className="h-3 w-24" />
            <SkeletonBar className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Create/edit/detail routes: back button + title, then stacked form sections. */
export function FormPageSkeleton({
  sectionFieldCounts = [4, 3, 2],
}: {
  sectionFieldCounts?: number[];
}) {
  return (
    <SkeletonPage className="p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-4">
        <div className="flex items-center gap-2">
          <SkeletonBar className="size-9 rounded-lg" />
          <div className="space-y-1.5">
            <SkeletonBar className="h-5 w-44" />
            <SkeletonBar className="h-3 w-60" />
          </div>
        </div>
        {sectionFieldCounts.map((fieldCount, index) => (
          <SkeletonFormCard key={index} fieldCount={fieldCount} />
        ))}
        <div className="flex justify-end gap-2">
          <SkeletonBar className="h-10 w-24 rounded-lg" />
          <SkeletonBar className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </SkeletonPage>
  );
}
