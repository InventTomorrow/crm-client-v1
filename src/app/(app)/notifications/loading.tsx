import { SkeletonListCard, SkeletonPage, SkeletonPageHeader } from "@/shared/ui/PageSkeleton";
import { SkeletonBar } from "@/shared/ui/SkeletonBar";

export default function NotificationsLoading() {
  return (
    <SkeletonPage className="p-4 md:p-8">
      <div className="flex max-w-6xl flex-col gap-4">
        <SkeletonPageHeader actionWidths={["w-9", "w-32"]} />
        <SkeletonBar className="h-9 w-[240px] rounded-lg" />
        <SkeletonListCard rowCount={8} />
      </div>
    </SkeletonPage>
  );
}
