import { SkeletonBar as Bar } from "@/shared/ui/SkeletonBar";

/** Dashboard loading state: KPI tiles, trend chart, funnel + AI handoff. */
export function AnalyticsSkeleton() {
  return (
    <div className="grid gap-3.5">
      {/* KPI cards */}
      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card kpi p-4">
            <div className="flex items-start justify-between">
              <Bar className="h-9 w-9 rounded-lg" />
              <Bar className="h-4 w-12" />
            </div>
            <Bar className="mt-4 h-7 w-2/3" />
            <Bar className="mt-2.5 h-3 w-1/2" />
          </div>
        ))}
      </div>

      {/* Chart card */}
      <div className="card p-[18px]">
        <Bar className="h-4 w-40" />
        <Bar className="mt-2 h-3 w-56" />
        <div className="mt-4 h-[240px] animate-pulse">
          <svg
            viewBox="0 0 600 240"
            preserveAspectRatio="none"
            className="h-full w-full text-[var(--line)] dark:text-white/10"
          >
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1="0"
                x2="600"
                y1={20 + i * 66}
                y2={20 + i * 66}
                stroke="currentColor"
                strokeWidth="1.5"
              />
            ))}
            <path
              d="M0,180 C80,150 120,90 200,110 C280,130 320,60 400,80 C480,100 540,40 600,55"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Funnel + AI handoff */}
      <div className="grid gap-3.5 grid-cols-[2fr_1fr] max-lg:grid-cols-1">
        <div className="card p-[18px]">
          <Bar className="h-4 w-32" />
          <div className="mt-4 flex flex-col gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Bar key={i} className="h-[26px]" />
            ))}
          </div>
        </div>
        <div className="card p-[18px]">
          <Bar className="h-4 w-28" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Bar key={i} className="h-[68px]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
