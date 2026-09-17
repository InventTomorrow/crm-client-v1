import { SkeletonBar } from "@/shared/ui/SkeletonBar";

const CONVERSATION_ROW_COUNT = 9;
const MESSAGE_WIDTHS = ["w-2/5", "w-1/3", "w-1/2", "w-1/4", "w-2/5"];

/** Conversation list, chat thread and profile panel — the inbox's three panes. */
export default function InboxLoading() {
  return (
    <div
      role="status"
      aria-label="Loading inbox"
      className="inbox-layout flex h-full gap-3 p-3"
    >
      <div className="card inbox-list mob-on flex w-[320px] shrink-0 flex-col overflow-hidden">
        <div className="space-y-2.5 border-b border-[var(--line)] px-3.5 pb-2 pt-3">
          <SkeletonBar className="h-9 w-full rounded-lg" />
          <SkeletonBar className="h-10 w-full rounded-lg" />
          <div className="flex gap-1.5">
            {["w-12", "w-16", "w-14", "w-[60px]"].map((widthClass) => (
              <SkeletonBar
                key={widthClass}
                className={`h-7 rounded-full ${widthClass}`}
              />
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {Array.from({ length: CONVERSATION_ROW_COUNT }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 border-b border-[var(--line-soft)] px-3.5 py-3"
            >
              <SkeletonBar className="size-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex justify-between gap-2">
                  <SkeletonBar className="h-3.5 w-28" />
                  <SkeletonBar className="h-2.5 w-10" />
                </div>
                <SkeletonBar className="h-3 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card inbox-chat hidden min-w-0 flex-1 flex-col overflow-hidden md:flex">
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3">
          <SkeletonBar className="size-9 rounded-full" />
          <div className="space-y-1.5">
            <SkeletonBar className="h-3.5 w-36" />
            <SkeletonBar className="h-2.5 w-24" />
          </div>
          <SkeletonBar className="ml-auto h-8 w-24 rounded-lg" />
        </div>
        <div className="flex flex-1 flex-col justify-end gap-3 p-5">
          {MESSAGE_WIDTHS.map((widthClass, index) => (
            <SkeletonBar
              key={index}
              className={`h-10 rounded-2xl ${widthClass} ${index % 2 === 1 ? "self-end" : ""}`}
            />
          ))}
        </div>
        <div className="border-t border-[var(--line)] p-3">
          <SkeletonBar className="h-11 w-full rounded-xl" />
        </div>
      </div>

      <div className="card inbox-profile hidden w-[260px] shrink-0 flex-col gap-3 p-4 xl:flex">
        <div className="flex flex-col items-center gap-2 pt-2">
          <SkeletonBar className="size-[60px] rounded-full" />
          <SkeletonBar className="h-4 w-32" />
          <SkeletonBar className="h-5 w-20 rounded-full" />
        </div>
        <SkeletonBar className="h-32 w-full rounded-xl" />
        <SkeletonBar className="h-3 w-24" />
        <SkeletonBar className="h-20 w-full rounded-xl" />
        <SkeletonBar className="h-20 w-full rounded-xl" />
      </div>
    </div>
  );
}
