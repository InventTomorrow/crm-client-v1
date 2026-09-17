import { SkeletonBar } from "./SkeletonBar";

interface CardGridSkeletonProps {
  count?: number;
  /** Practitioner cards lead with an avatar; service cards lead with a price badge. */
  withAvatar?: boolean;
}

/** Route fallback for catalogue pages: title + primary action, toolbar card, card grid. */
export function CardGridPageSkeleton({ withAvatar = false }: { withAvatar?: boolean }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="scroll h-full space-y-6 overflow-y-auto p-4 md:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <SkeletonBar className="h-7 w-40" />
          <SkeletonBar className="h-3.5 w-72 max-w-full" />
        </div>
        <SkeletonBar className="h-10 w-36 rounded-lg" />
      </div>
      <div className="card flex flex-wrap items-center gap-2 p-2">
        <SkeletonBar className="h-10 min-w-[240px] max-w-[400px] flex-1 rounded-lg" />
        <SkeletonBar className="h-10 w-[180px] rounded-lg" />
        <div className="ml-auto flex items-center gap-2">
          <SkeletonBar className="h-10 w-40 rounded-lg" />
          <SkeletonBar className="size-10 rounded-lg" />
        </div>
      </div>
      <CardGridSkeleton withAvatar={withAvatar} />
    </div>
  );
}

/** Mirrors the tinted-header catalogue cards (clinical services, practitioners). */
export function CardGridSkeleton({
  count = 6,
  withAvatar = false,
}: CardGridSkeletonProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-1)]"
        >
          <div className="flex items-start gap-3 border-b border-[var(--line)] bg-[var(--surface-2)] px-4 py-3">
            {withAvatar && <SkeletonBar className="size-11 shrink-0 rounded-full" />}
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBar className="h-4 w-2/3" />
              <SkeletonBar className="h-3 w-1/3" />
            </div>
            {!withAvatar && <SkeletonBar className="h-5 w-14 shrink-0 rounded-full" />}
          </div>
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="flex flex-wrap gap-1.5">
              <SkeletonBar className="h-5 w-16 rounded-full" />
              <SkeletonBar className="h-5 w-20 rounded-full" />
              <SkeletonBar className="h-5 w-12 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <SkeletonBar className="h-3 w-full" />
              <SkeletonBar className="h-3 w-4/5" />
            </div>
            <div className="flex items-center gap-3 rounded-[var(--r-10)] bg-[var(--surface-2)] px-3 py-2.5">
              <SkeletonBar className="h-4 w-16" />
              <SkeletonBar className="h-3 w-20" />
            </div>
            <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--line)] pt-3">
              <div className="flex items-center gap-2">
                <SkeletonBar className="h-7 w-20 rounded-lg" />
                <SkeletonBar className="h-7 w-16 rounded-lg" />
              </div>
              <SkeletonBar className="h-7 w-7 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
