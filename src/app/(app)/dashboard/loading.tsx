import { AnalyticsSkeleton } from "@/features/analytics/components/AnalyticsSkeleton";
import { SkeletonPage, SkeletonPageHeader } from "@/shared/ui/PageSkeleton";

export default function DashboardLoading() {
  return (
    <SkeletonPage className="gap-3.5 p-[18px]">
      <SkeletonPageHeader actionWidths={["w-44", "w-9"]} />
      <AnalyticsSkeleton />
    </SkeletonPage>
  );
}
