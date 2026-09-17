import { cn } from "@/lib/utils";
import { SkeletonBar } from "@/shared/ui/SkeletonBar";

const STAT_CARD_COUNT = 3;
const KANBAN_COLUMN_COUNT = 5;
const TABLE_ROW_COUNT = 8;
const LIST_ROW_COUNT = 6;

export function LeadsStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: STAT_CARD_COUNT }).map((_, index) => (
        <div key={index} className="card flex items-center gap-3 p-3.5">
          <SkeletonBar className="h-9 w-9 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1">
            <SkeletonBar className="h-2.5 w-24" />
            <SkeletonBar className="mt-2 h-5 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LeadsToolbarSkeleton() {
  return (
    <div className="card flex flex-wrap items-center gap-2 p-2">
      <SkeletonBar className="h-10 w-full rounded-lg md:w-auto md:min-w-[200px] md:flex-[1_1_220px]" />
      <SkeletonBar className="h-10 w-[172px] rounded-lg" />
      <div className="hidden md:block md:flex-1" />
      <SkeletonBar className="h-10 w-[168px] rounded-lg" />
    </div>
  );
}

export function LeadsTableSkeleton() {
  return (
    <div className="card min-h-0 flex-1 overflow-hidden">
      <div className="flex items-center gap-4 border-b border-[var(--line)] bg-[var(--surface-2)] px-3 py-3">
        <SkeletonBar className="h-4 w-4 rounded" />
        <SkeletonBar className="h-3 w-16 md:w-[30%]" />
        <SkeletonBar className="hidden h-3 w-16 md:block" />
        <SkeletonBar className="hidden h-3 w-14 md:block" />
        <SkeletonBar className="hidden h-3 w-12 lg:block" />
        <SkeletonBar className="hidden h-3 w-20 lg:block" />
        <SkeletonBar className="hidden h-3 w-16 lg:block" />
      </div>
      {Array.from({ length: TABLE_ROW_COUNT }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-[var(--line-soft)] px-3 py-3 last:border-0"
        >
          <SkeletonBar className="h-4 w-4 shrink-0 rounded" />
          <div className="flex min-w-0 flex-1 items-center gap-2.5 md:max-w-[30%]">
            <SkeletonBar className="h-8 w-8 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <SkeletonBar className="h-3.5 w-32 max-w-full" />
              <SkeletonBar className="mt-1.5 h-2.5 w-48 max-w-full" />
            </div>
          </div>
          <SkeletonBar className="hidden h-5 w-7 rounded-full md:block" />
          <SkeletonBar className="hidden h-5 w-20 rounded-full md:block" />
          <SkeletonBar className="hidden h-3 w-14 lg:block" />
          <SkeletonBar className="hidden h-3 w-20 lg:block" />
          <SkeletonBar className="hidden h-3 w-16 lg:block" />
          <SkeletonBar className="ml-auto h-4 w-1.5 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function LeadsKanbanSkeleton() {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[repeat(5,minmax(220px,1fr))] gap-3 overflow-hidden">
      {Array.from({ length: KANBAN_COLUMN_COUNT }).map((_, columnIndex) => (
        <div key={columnIndex} className="card flex min-h-0 flex-col p-3">
          <div className="mb-2.5 flex items-center justify-between border-b border-[var(--line)] px-1 pb-2">
            <div className="flex items-center gap-2">
              <SkeletonBar className="h-2 w-2 rounded-full" />
              <SkeletonBar className="h-3.5 w-16" />
              <SkeletonBar className="h-4 w-6 rounded-full" />
            </div>
            <SkeletonBar className="h-6 w-6 rounded-md" />
          </div>
          <div className="flex flex-col gap-2">
            {/* Uneven card counts so the board doesn't read as a grid of clones */}
            {Array.from({ length: 3 - (columnIndex % 3) }).map((_, cardIndex) => (
              <div
                key={cardIndex}
                className="rounded-[10px] border border-[var(--line)] bg-[var(--surface)] p-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <SkeletonBar className="h-8 w-8 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <SkeletonBar className="h-3 w-24" />
                    <SkeletonBar className="mt-1.5 h-2.5 w-16" />
                  </div>
                </div>
                <SkeletonBar className="mt-2.5 h-2.5 w-full" />
                <div className="mt-2 flex items-center justify-between">
                  <SkeletonBar className="h-2.5 w-14" />
                  <SkeletonBar className="h-2.5 w-10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function LeadsListSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      {Array.from({ length: LIST_ROW_COUNT }).map((_, index) => (
        <div
          key={index}
          className="card flex items-center gap-3.5 border-l-[3px] border-l-[var(--line)] p-3"
        >
          <SkeletonBar className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <SkeletonBar className="h-3.5 w-36" />
            <SkeletonBar className="mt-2 h-3 w-3/5" />
            <SkeletonBar className="mt-2 h-2.5 w-40" />
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <SkeletonBar className="h-8 w-28 rounded-lg" />
            <SkeletonBar className="h-7 w-7 rounded-md" />
            <SkeletonBar className="h-7 w-7 rounded-md" />
            <SkeletonBar className="h-7 w-7 rounded-md" />
            <SkeletonBar className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

type LeadsViewMode = "kanban" | "list" | "table";

export function LeadsViewSkeleton({ view }: { view: LeadsViewMode }) {
  if (view === "list") return <LeadsListSkeleton />;
  if (view === "table") return <LeadsTableSkeleton />;
  return (
    <>
      <div className="hidden min-h-0 flex-1 md:flex md:flex-col">
        <LeadsKanbanSkeleton />
      </div>
      <div className="flex min-h-0 flex-1 flex-col md:hidden">
        <LeadsTableSkeleton />
      </div>
    </>
  );
}

/** Full-page placeholder for route transitions, before LeadsView mounts. */
export function LeadsPageSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("flex h-full flex-col gap-3 overflow-hidden p-4", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-3.5">
        <div>
          <SkeletonBar className="h-6 w-28" />
          <SkeletonBar className="mt-2 h-3 w-56" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBar className="h-9 w-9 rounded-lg" />
          <SkeletonBar className="h-9 w-20 rounded-lg" />
          <SkeletonBar className="h-9 w-20 rounded-lg" />
          <SkeletonBar className="h-9 w-24 rounded-lg" />
        </div>
      </div>
      <LeadsStatsSkeleton />
      <LeadsToolbarSkeleton />
      <LeadsTableSkeleton />
    </div>
  );
}
