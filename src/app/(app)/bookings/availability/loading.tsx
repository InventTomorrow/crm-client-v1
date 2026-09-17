import { SkeletonFormCard, SkeletonPage, SkeletonPageHeader } from "@/shared/ui/PageSkeleton";

export default function AvailabilityLoading() {
  return (
    <SkeletonPage className="p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
        <SkeletonPageHeader actionWidths={["w-9", "w-28"]} />
        <SkeletonFormCard fieldCount={4} />
        <SkeletonFormCard fieldCount={7} columns={1} />
      </div>
    </SkeletonPage>
  );
}
