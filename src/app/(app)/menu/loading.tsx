import { SkeletonPage, SkeletonPageHeader, SkeletonToolbar } from "@/shared/ui/PageSkeleton";
import { SkeletonBar } from "@/shared/ui/SkeletonBar";

export default function MenuLoading() {
  return (
    <SkeletonPage>
      <SkeletonPageHeader actionWidths={["w-9", "w-28", "w-28"]} />
      <SkeletonToolbar controlWidths={["w-[170px]"]} trailingWidths={["w-40"]} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="card flex flex-col overflow-hidden p-0">
            <SkeletonBar className="aspect-square w-full rounded-none" />
            <div className="space-y-2 p-3">
              <SkeletonBar className="h-3.5 w-3/4" />
              <SkeletonBar className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </SkeletonPage>
  );
}
