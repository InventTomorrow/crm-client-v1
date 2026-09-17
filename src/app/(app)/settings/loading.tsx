import { SkeletonFormCard } from "@/shared/ui/PageSkeleton";

export default function SettingsLoading() {
  return (
    <div role="status" aria-label="Loading settings" className="flex h-full gap-3.5 overflow-hidden p-[18px]">
      <div className="scroll flex flex-1 flex-col gap-3.5 overflow-y-auto">
        <SkeletonFormCard fieldCount={4} />
        <SkeletonFormCard fieldCount={2} />
        <SkeletonFormCard fieldCount={3} columns={1} />
      </div>
    </div>
  );
}
