import { cn } from "@/lib/utils";

/** Token-coloured pulse block — same look as the dashboard skeleton. */
export function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-md bg-[var(--line)] dark:bg-white/10",
        className,
      )}
    />
  );
}
