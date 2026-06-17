"use client";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useWAState } from "../hooks/useWhatsApp";
import type { WAChannelStatus } from "../types";

const MAP: Record<WAChannelStatus, { label: string; pill: string; dot: string }> = {
  CONNECTED:    { label: "Connected",    pill: "bg-[#DCFCE7] text-[#15803D]",                   dot: "bg-[#15803D]" },
  ERROR:        { label: "Error",        pill: "bg-[#FEF2F2] text-[#991B1B]",                   dot: "bg-[#EF4444] animate-pulse" },
  DISCONNECTED: { label: "Disconnected", pill: "bg-[var(--surface-2)] text-[var(--ink-mute)]",  dot: "bg-[var(--ink-mute)]" },
};

/**
 * Compact WhatsApp connectivity badge — polls wa-state (REST) and links to
 * the Channels page so the user can reconnect quickly.
 * Pass `showLabel={false}` for tight spaces (icon + dot only).
 */
export function WAStatusBadge({
  showLabel = true,
  className,
}: {
  showLabel?: boolean;
  className?: string;
}) {
  const { data } = useWAState();
  const status: WAChannelStatus = data?.status ?? "DISCONNECTED";
  const { label, pill, dot } = MAP[status];
  const title = `WhatsApp: ${label}${data?.phoneNumber ? ` · ${data.phoneNumber}` : ""}`;

  return (
    <Link
      href="/channels"
      title={title}
      aria-label={title}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-opacity hover:opacity-80",
        pill,
        className,
      )}
    >
      <span className={cn("w-[6px] h-[6px] rounded-full", dot)} />
      <MessageCircle size={13} />
      {showLabel && <span>{label}</span>}
    </Link>
  );
}
