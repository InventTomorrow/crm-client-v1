"use client";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { Button } from "./Button";

type RefreshButtonProps = {
  onRefresh: () => void;
  isRefreshing: boolean;
  /** Match the height of the buttons it sits next to. */
  size?: "icon-sm" | "icon" | "icon-lg";
  label?: string;
  className?: string;
};

/** Re-fetches the page's records, spinning while the request is in flight. */
export function RefreshButton({
  onRefresh,
  isRefreshing,
  size = "icon",
  label = "Refresh",
  className,
}: RefreshButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={onRefresh}
      disabled={isRefreshing}
      aria-label={label}
      title={label}
      className={className}
    >
      <RefreshCw size={13} className={cn(isRefreshing && "animate-spin")} />
    </Button>
  );
}
