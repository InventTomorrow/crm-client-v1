import {
  SkeletonPage,
  SkeletonPageHeader,
  SkeletonStatCards,
  SkeletonTable,
  SkeletonToolbar,
} from "@/shared/ui/PageSkeleton";

export default function OrdersLoading() {
  return (
    <SkeletonPage>
      <SkeletonPageHeader actionWidths={["w-9", "w-28"]} />
      <SkeletonStatCards count={5} gridClassName="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" />
      <SkeletonToolbar
        controlWidths={["w-full md:w-[170px]", "w-full md:w-[190px]"]}
        trailingWidths={["w-24"]}
      />
      <SkeletonTable columnCount={8} />
    </SkeletonPage>
  );
}
