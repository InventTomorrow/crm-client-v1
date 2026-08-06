"use client";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { OrderApiCard } from "@/features/channels/apiKey/components/OrderApiCard";
import { useWAStatus } from "@/features/channels/whatsapp/hooks/useWhatsApp";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { WAConnectDialog } from "@/shared/ui/WAConnectDialog";
import { useState } from "react";

export function ChannelsSection() {
  const { data: statusData } = useWAStatus();
  const { can } = usePermissions();
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const status = statusData?.status ?? "DISCONNECTED";
  const canConnect = can("channels:connect");

  return (
    <>
      <h2 className="text-[20px] font-semibold">Connected Channels</h2>
      <div className="card p-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#25D366" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M11.996 1.998C6.478 1.998 2 6.476 2 11.994c0 1.762.461 3.416 1.268 4.853L2 22l5.294-1.247a9.95 9.95 0 0 0 4.702 1.19c5.518 0 9.996-4.477 9.996-9.995 0-5.518-4.478-9.95-9.996-9.95zm0 18.19a8.187 8.187 0 0 1-4.18-1.148l-.3-.178-3.115.733.779-3.023-.196-.31A8.153 8.153 0 0 1 3.81 11.994c0-4.516 3.672-8.187 8.186-8.187s8.187 3.671 8.187 8.187c0 4.515-3.673 8.187-8.187 8.187z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[14px]">WhatsApp Business</div>
            <div className="text-[12px] text-[var(--ink-mute)] mt-px">
              {status === "CONNECTED"
                ? `Connected · +${statusData?.phoneNumber ?? ""}`
                : "Not connected — scan QR to link your number"}
            </div>
          </div>
          <span
            className={cn(
              "badge font-medium px-2.5 py-1",
              status === "CONNECTED"
                ? "bg-[rgba(34,197,94,0.12)] text-[#15803D]"
                : "bg-[var(--surface-2)] text-[var(--ink-mute)]",
            )}
          >
            <span
              className={cn(
                "w-[6px] h-[6px] rounded-full mr-1.5 inline-block",
                status === "CONNECTED"
                  ? "bg-[#15803D]"
                  : "bg-[var(--ink-mute)]",
              )}
            />
            {status === "CONNECTED"
              ? "Connected"
              : status === "PENDING" || status === "CONNECTING"
                ? "Connecting…"
                : "Disconnected"}
          </span>
          {canConnect && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConnectDialogOpen(true)}
            >
              {status === "CONNECTED" ? "Manage" : "Connect"}
            </Button>
          )}
        </div>
        {!canConnect && (
          <p className="text-[11.5px] text-[var(--ink-mute)] mt-3">
            You don&apos;t have permission to connect or disconnect WhatsApp.
            Ask a workspace owner.
          </p>
        )}
      </div>

      <OrderApiCard />

      <WAConnectDialog
        open={isConnectDialogOpen}
        onOpenChange={setIsConnectDialogOpen}
      />
    </>
  );
}
