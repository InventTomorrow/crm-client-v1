import { CoverageMatrixSkeleton } from "@/features/clinic-coverage/components/CoverageSkeletons";
import { SkeletonBar } from "@/shared/ui/SkeletonBar";

export default function CoverageAreasLoading() {
  return (
    <div
      role="status"
      aria-label="Loading coverage"
      className="scroll h-full space-y-5 overflow-y-auto p-4 md:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <SkeletonBar className="h-7 w-48" />
          <SkeletonBar className="h-3.5 w-80 max-w-full" />
        </div>
        <div className="flex gap-2">
          <SkeletonBar className="size-9 rounded-lg" />
          <SkeletonBar className="h-9 w-24 rounded-lg" />
          <SkeletonBar className="h-9 w-32 rounded-lg" />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SkeletonBar className="h-11 w-80 rounded-lg" />
        <div className="flex gap-2">
          <SkeletonBar className="h-10 w-40 rounded-lg" />
          <SkeletonBar className="h-10 w-[260px] rounded-lg" />
        </div>
      </div>
      <CoverageMatrixSkeleton />
    </div>
  );
}
