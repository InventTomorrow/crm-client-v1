"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import Link from "next/link";
import { useWAStatus } from "../hooks/useWhatsApp";

const WA_GREEN = "#25D366";

export function WhatsAppCard() {
  const { data: statusData } = useWAStatus();
  const status = statusData?.status ?? "DISCONNECTED";
  const isConnected = status === "CONNECTED";
  const isPending = status === "PENDING" || status === "CONNECTING";

  return (
    <div className="card hover-shimmer p-5 transition-colors hover:bg-[var(--surface-2)]">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: isConnected ? WA_GREEN : "var(--surface-2)" }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isConnected ? "white" : "var(--ink-mute)"}
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M11.996 1.998C6.478 1.998 2 6.476 2 11.994c0 1.762.461 3.416 1.268 4.853L2 22l5.294-1.247a9.95 9.95 0 0 0 4.702 1.19c5.518 0 9.996-4.477 9.996-9.995 0-5.518-4.478-9.95-9.996-9.95zm0 18.19a8.187 8.187 0 0 1-4.18-1.148l-.3-.178-3.115.733.779-3.023-.196-.31A8.153 8.153 0 0 1 3.81 11.994c0-4.516 3.672-8.187 8.186-8.187s8.187 3.671 8.187 8.187c0 4.515-3.673 8.187-8.187 8.187z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[14px]">WhatsApp</div>
          <div className="text-[12px] text-[var(--ink-mute)] mt-px">
            {isConnected
              ? `Connected · +${statusData?.phoneNumber ?? ""}`
              : "Link your number to chat with customers"}
          </div>
        </div>
        <span
          className={cn(
            "badge font-medium px-2.5 py-1",
            isConnected
              ? "bg-[rgba(34,197,94,0.12)] text-[#15803D]"
              : isPending
                ? "bg-[rgba(202,138,4,0.12)] text-[#B45309]"
                : "bg-[var(--surface-2)] text-[var(--ink-mute)]",
          )}
        >
          {isConnected ? "Connected" : isPending ? "Connecting…" : "Disconnected"}
        </span>
        <Button variant="outline" size="sm" asChild>
          <Link href="/channels/whatsapp">Configure</Link>
        </Button>
      </div>
    </div>
  );
}
