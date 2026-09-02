"use client";
import { Skeleton } from "@/shared/ui/Motion";

/**
 * Route-level placeholders for the inventory pages.
 *
 * Each mirrors the layout of the page it stands in for — a full-screen branded
 * loader on a route change hides the shell the seller is already looking at and
 * reads as a page reload, which these do not.
 */

/** /inventory — heading, stat tiles, toolbar, filter chips, product grid. */
export function InventoryListSkeleton() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-3.5 flex flex-col gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-3.5 w-64" />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-3.5"
          >
            <Skeleton className="size-9" circle />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-10" />
            </div>
          </div>
        ))}
      </div>

      <div className="card mb-3 flex flex-col gap-2.5 p-[10px]">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-9 w-full max-w-[260px]" />
          <div className="hidden flex-1 sm:block" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {[52, 68, 60, 74, 56, 64].map((width, index) => (
            <Skeleton key={index} className="h-6 rounded-full" style={{ width }} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-[var(--line)]"
          >
            <Skeleton className="h-[140px] w-full rounded-none" />
            <div className="flex flex-col gap-2 p-3">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** /inventory/new and the edit route — fields column beside the square photo. */
export function ProductFormSkeleton() {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-2">
        <Skeleton className="size-8" circle />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4.5 w-36" />
          <Skeleton className="h-3 w-44" />
        </div>
      </div>

      <div className="card grid grid-cols-1 items-start gap-5 p-4 md:p-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-4">
          <SkeletonField className="w-full" />
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonField />
            <SkeletonField />
            <SkeletonField />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-16" />
            <div className="flex flex-wrap gap-4">
              {[40, 44, 52, 40, 40].map((width, index) => (
                <Skeleton key={index} className="h-4" style={{ width }} />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <SkeletonField />
            <SkeletonField />
            <SkeletonField />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-[76px] w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            <div className="flex flex-wrap gap-1.5">
              {[56, 48, 48, 52, 60].map((width, index) => (
                <Skeleton key={index} className="h-8" style={{ width }} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="aspect-square w-full max-w-[300px] rounded-xl" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>

      <div className="card flex flex-col gap-3 p-4 md:p-5">
        <div className="flex items-start gap-3">
          <Skeleton className="h-5 w-9 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}

/** /inventory/import — header above the centred format picker. */
export function ImportProductsSkeleton() {
  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-5 p-4 md:p-8">
      <div className="flex items-center gap-2">
        <Skeleton className="size-8" circle />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4.5 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>

      <div className="card mx-auto flex w-full max-w-[720px] flex-col gap-3 p-6">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-3 w-72" />
        </div>
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-4"
          >
            <Skeleton className="size-10" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
        ))}
        <Skeleton className="h-3 w-full max-w-[420px]" />
      </div>
    </div>
  );
}

function SkeletonField({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}
