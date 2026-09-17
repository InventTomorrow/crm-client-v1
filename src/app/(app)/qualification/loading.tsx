import { SkeletonFormCard, SkeletonPage, SkeletonPageHeader, SkeletonStatCards } from "@/shared/ui/PageSkeleton";
import { SkeletonBar } from "@/shared/ui/SkeletonBar";

export default function QualificationLoading() {
  return (
    <SkeletonPage className="p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
        <SkeletonPageHeader actionWidths={["w-9", "w-36"]} />
        <SkeletonStatCards count={4} gridClassName="grid-cols-2 lg:grid-cols-4" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
          <div className="flex min-w-0 flex-col gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBar key={index} className="h-[72px] w-full rounded-xl" />
            ))}
          </div>
          <SkeletonFormCard fieldCount={3} columns={1} />
        </div>
      </div>
    </SkeletonPage>
  );
}
