import { Skeleton } from "@/shared/ui/Skeleton";

function SkeletonFieldGrid({ fieldCount }: { fieldCount: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {Array.from({ length: fieldCount }, (_, index) => (
        <div key={index} className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

export function OrderFormSkeleton() {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-5 p-4 md:p-8">
      <div className="flex items-center gap-2">
        <Skeleton className="size-9 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4.5 w-36" />
          <Skeleton className="h-3 w-44" />
        </div>
      </div>
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-5">
          {[4, 6, 3].map((fieldCount, index) => (
            <div key={index} className="card flex flex-col gap-5 p-5">
              <Skeleton className="h-4 w-32" />
              <SkeletonFieldGrid fieldCount={fieldCount} />
            </div>
          ))}
        </div>
        <div className="card flex flex-col gap-4 p-5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
