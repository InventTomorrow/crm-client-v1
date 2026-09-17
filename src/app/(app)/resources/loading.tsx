import {
  SkeletonPage,
  SkeletonPageHeader,
  SkeletonStatCards,
  SkeletonToolbar,
} from "@/shared/ui/PageSkeleton";
import { SkeletonBar } from "@/shared/ui/SkeletonBar";

export default function ResourcesLoading() {
  return (
    <SkeletonPage className="p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
        <SkeletonPageHeader actionWidths={["w-9", "w-36"]} />
        <SkeletonStatCards count={3} gridClassName="grid-cols-2 lg:grid-cols-3" />
        <SkeletonToolbar searchClassName="w-full md:w-[400px]" controlWidths={["w-[170px]"]} />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card space-y-3 p-4">
              <div className="flex items-center gap-2">
                <SkeletonBar className="size-8 rounded-lg" />
                <SkeletonBar className="h-4 w-40" />
                <SkeletonBar className="ml-auto h-5 w-16 rounded-full" />
              </div>
              <SkeletonBar className="h-3 w-full" />
              <SkeletonBar className="h-3 w-3/4" />
              <div className="flex gap-2 pt-1">
                <SkeletonBar className="h-7 w-16 rounded-lg" />
                <SkeletonBar className="h-7 w-7 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SkeletonPage>
  );
}
