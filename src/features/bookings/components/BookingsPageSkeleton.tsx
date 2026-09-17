import { SkeletonBar } from "@/shared/ui/SkeletonBar";

const TABLE_ROW_COUNT = 6;

/** Header, stat cards, filter bar and appointments table — the bookings pages' layout. */
export function BookingsPageSkeleton({ statCount = 3 }: { statCount?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading appointments"
      className="mx-auto flex max-w-[1100px] flex-col gap-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <SkeletonBar className="h-5 w-44" />
          <SkeletonBar className="h-3 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBar className="size-9 rounded-lg" />
          <SkeletonBar className="h-9 w-36 rounded-lg" />
          <SkeletonBar className="h-9 w-40 rounded-lg" />
        </div>
      </div>

      <div
        className={
          statCount === 4
            ? "grid grid-cols-2 gap-3 lg:grid-cols-4"
            : "grid grid-cols-2 gap-3 lg:grid-cols-3"
        }
      >
        {Array.from({ length: statCount }).map((_, index) => (
          <div key={index} className="card flex items-center gap-3 p-3.5">
            <SkeletonBar className="size-9 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <SkeletonBar className="h-2.5 w-20" />
              <SkeletonBar className="h-5 w-10" />
              <SkeletonBar className="h-2.5 w-28" />
            </div>
          </div>
        ))}
      </div>

      <div className="card flex flex-wrap items-center gap-2 p-2">
        <SkeletonBar className="h-10 w-[168px] rounded-lg" />
        <SkeletonBar className="h-10 w-[220px] rounded-lg" />
        <SkeletonBar className="ml-auto h-10 w-44 rounded-lg" />
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center gap-6 border-b border-[var(--line)] bg-[var(--surface-2)] px-3 py-3">
          <SkeletonBar className="h-3 w-24" />
          <SkeletonBar className="h-3 w-20" />
          <SkeletonBar className="hidden h-3 w-20 md:block" />
          <SkeletonBar className="ml-auto h-3 w-16" />
        </div>
        {Array.from({ length: TABLE_ROW_COUNT }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-6 border-b border-[var(--line-soft)] px-3 py-3 last:border-0"
          >
            <div className="w-40 space-y-1.5">
              <SkeletonBar className="h-3.5 w-28" />
              <SkeletonBar className="h-2.5 w-20" />
            </div>
            <SkeletonBar className="h-3 w-24" />
            <SkeletonBar className="hidden h-3 w-28 md:block" />
            <SkeletonBar className="ml-auto h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
