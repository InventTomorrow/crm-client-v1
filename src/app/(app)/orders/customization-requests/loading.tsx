import {
  SkeletonPage,
  SkeletonPageHeader,
  SkeletonStatCards,
  SkeletonTable,
  SkeletonToolbar,
} from "@/shared/ui/PageSkeleton";

export default function CustomizationRequestsLoading() {
  return (
    <SkeletonPage>
      <SkeletonPageHeader actionWidths={["w-9"]} />
      <SkeletonStatCards count={5} gridClassName="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" />
      <SkeletonToolbar controlWidths={["w-full md:w-[170px]"]} />
      <SkeletonTable columnCount={6} withCheckbox={false} />
    </SkeletonPage>
  );
}
