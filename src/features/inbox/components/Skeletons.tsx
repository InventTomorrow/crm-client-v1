import { Skeleton } from "@/shared/ui/Motion";

export function ChatListSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-[11px] px-[14px] py-[11px] border-b border-[var(--line-soft)]"
        >
          <Skeleton circle className="w-[38px] h-[38px] flex-shrink-0" />
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-[12px] w-28" />
              <Skeleton className="h-[10px] w-8" />
            </div>
            <Skeleton className="h-[10px] w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessageSkeleton() {
  const rows = [
    { out: false, w: "w-48" },
    { out: true, w: "w-36" },
    { out: false, w: "w-56" },
    { out: true, w: "w-44" },
    { out: false, w: "w-32" },
  ];
  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      {rows.map(({ out, w }, i) => (
        <div key={i} className={`flex ${out ? "justify-end" : "justify-start"}`}>
          <div className="flex flex-col gap-1">
            <Skeleton className={`h-9 ${w} rounded-[14px]`} />
            <Skeleton className="h-[9px] w-10 ml-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
