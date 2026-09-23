import { SkeletonPage, SkeletonPageHeader, SkeletonTable, SkeletonToolbar } from "@/shared/ui/PageSkeleton";

export default function ServiceOrdersLoading() {
  return (
    <SkeletonPage>
      <SkeletonPageHeader actionWidths={[]} />
      <SkeletonToolbar controlWidths={["w-full md:w-[160px]", "w-full md:w-[180px]"]} trailingWidths={[]} />
      <SkeletonTable columnCount={5} />
    </SkeletonPage>
  );
}
