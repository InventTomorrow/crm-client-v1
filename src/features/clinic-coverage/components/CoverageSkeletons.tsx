import { SkeletonBar } from '@/shared/ui/SkeletonBar';

const MATRIX_ROW_COUNT = 6;
const MATRIX_AREA_COUNT = 4;
const LOCATION_CITY_COUNT = 2;

/** Service × area matrix: sticky service column, one status control per cell. */
export function CoverageMatrixSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-xs">
      <div className="flex border-b border-[var(--line)] bg-[var(--surface-2)]">
        <div className="w-[180px] shrink-0 border-r border-[var(--line)] p-2.5">
          <SkeletonBar className="h-3.5 w-16" />
        </div>
        {Array.from({ length: MATRIX_AREA_COUNT }).map((_, index) => (
          <div
            key={index}
            className="min-w-[170px] flex-1 space-y-1.5 border-r border-[var(--line)] p-2.5 last:border-r-0"
          >
            <SkeletonBar className="h-3.5 w-24" />
            <SkeletonBar className="h-2.5 w-14" />
          </div>
        ))}
      </div>
      {Array.from({ length: MATRIX_ROW_COUNT }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex border-b border-[var(--line)] last:border-b-0"
        >
          <div className="w-[180px] shrink-0 space-y-1.5 border-r border-[var(--line)] p-2.5">
            <SkeletonBar className="h-3.5 w-28" />
            <SkeletonBar className="h-2.5 w-16" />
          </div>
          {Array.from({ length: MATRIX_AREA_COUNT }).map((_, cellIndex) => (
            <div
              key={cellIndex}
              className="min-w-[170px] flex-1 border-r border-[var(--line)] p-1.5 last:border-r-0"
            >
              <SkeletonBar className="h-8 w-full rounded-md" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Locations grouped under a city header, one row per branch. */
export function CoverageLocationsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: LOCATION_CITY_COUNT }).map((_, cityIndex) => (
        <div
          key={cityIndex}
          className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-xs"
        >
          <div className="flex items-center gap-2 border-b border-[var(--line)] bg-[var(--surface-2)] px-4 py-3">
            <SkeletonBar className="size-4 rounded" />
            <SkeletonBar className="h-3.5 w-24" />
            <SkeletonBar className="h-3 w-16" />
          </div>
          {Array.from({ length: 2 }).map((_, locationIndex) => (
            <div
              key={locationIndex}
              className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <SkeletonBar className="h-3.5 w-40" />
                <SkeletonBar className="h-3 w-64 max-w-full" />
              </div>
              <div className="flex gap-2">
                <SkeletonBar className="size-8 rounded-lg" />
                <SkeletonBar className="size-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
