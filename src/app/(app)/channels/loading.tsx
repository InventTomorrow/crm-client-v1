import { SkeletonPageHeader } from "@/shared/ui/PageSkeleton";
import { SkeletonBar } from "@/shared/ui/SkeletonBar";

export default function ChannelsLoading() {
  return (
    <div role="status" aria-label="Loading channels" className="scroll h-full overflow-y-auto">
      <div className="max-w-5xl space-y-6 p-4 md:p-8">
        <SkeletonPageHeader actionWidths={[]} />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="card space-y-4 p-5">
              <div className="flex items-center gap-3">
                <SkeletonBar className="size-10 rounded-xl" />
                <div className="space-y-1.5">
                  <SkeletonBar className="h-4 w-32" />
                  <SkeletonBar className="h-3 w-48" />
                </div>
                <SkeletonBar className="ml-auto h-5 w-20 rounded-full" />
              </div>
              <SkeletonBar className="h-3 w-full" />
              <SkeletonBar className="h-3 w-2/3" />
              <SkeletonBar className="h-10 w-36 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
