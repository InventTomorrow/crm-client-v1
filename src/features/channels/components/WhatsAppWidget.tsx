"use client";
import {
  useWADisconnect,
  useWAStatus,
} from "@/features/channels/hooks/useWhatsApp";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/shared/ui/AspectRatio";
import { Button } from "@/shared/ui/Button";
import { WAConnectDialog } from "@/shared/ui/WAConnectDialog";
import { Loader2, Plug, Power } from "lucide-react";
import { useState } from "react";

const WA_GREEN = "#25D366";
const WA_AMBER = "#CA8A04";

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M11.996 1.998C6.478 1.998 2 6.476 2 11.994c0 1.762.461 3.416 1.268 4.853L2 22l5.294-1.247a9.95 9.95 0 0 0 4.702 1.19c5.518 0 9.996-4.477 9.996-9.995 0-5.518-4.478-9.95-9.996-9.95zm0 18.19a8.187 8.187 0 0 1-4.18-1.148l-.3-.178-3.115.733.779-3.023-.196-.31A8.153 8.153 0 0 1 3.81 11.994c0-4.516 3.672-8.187 8.186-8.187s8.187 3.671 8.187 8.187c0 4.515-3.673 8.187-8.187 8.187z" />
    </svg>
  );
}

export function WhatsAppWidget() {
  const { data: statusData } = useWAStatus();
  const disconnectMut = useWADisconnect();
  const [dialogOpen, setDialogOpen] = useState(false);

  const status = statusData?.status ?? "DISCONNECTED";
  const phone = statusData?.phoneNumber;
  const isConnected = status === "CONNECTED";
  const isPending = status === "PENDING";

  const accent = isConnected ? WA_GREEN : isPending ? WA_AMBER : undefined;
  const statusLabel = isConnected
    ? "Connected"
    : isPending
      ? "Connecting"
      : "Disconnected";

  return (
    <>
      <AspectRatio ratio={1}>
        <div
          className="card relative flex h-full flex-col overflow-hidden p-4"
          style={
            accent
              ? {
                  background: `radial-gradient(120% 90% at 50% -10%, ${accent}1f 0%, transparent 60%), var(--surface)`,
                }
              : undefined
          }
        >
          {/* Status pill */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-mute)]">
              Channel
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-medium",
                isConnected &&
                  "bg-[rgba(37,211,102,0.12)] text-[#15803D]",
                isPending && "bg-[rgba(202,138,4,0.12)] text-[#B45309]",
                !isConnected &&
                  !isPending &&
                  "bg-[var(--surface-2)] text-[var(--ink-mute)]",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isConnected && "bg-[#25D366]",
                  isPending && "bg-[#CA8A04] animate-pulse",
                  !isConnected && !isPending && "bg-[var(--ink-mute)] opacity-60",
                )}
              />
              {statusLabel}
            </span>
          </div>

          {/* Icon + identity */}
          <div className="flex flex-1 flex-col items-center justify-center gap-2.5 text-center">
            <div className="relative flex h-16 w-16 items-center justify-center">
              {isConnected && (
                <>
                  <span
                    className="absolute inset-0 rounded-2xl bg-[#25D366] opacity-10 animate-ping"
                    style={{ animationDuration: "2.2s" }}
                  />
                  <span className="absolute inset-[3px] rounded-2xl bg-[#25D366] opacity-[0.08]" />
                </>
              )}
              <div
                className={cn(
                  "relative flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
                  isConnected
                    ? "text-white shadow-sm"
                    : "text-[var(--ink-mute)] grayscale",
                )}
                style={{
                  background: isConnected ? WA_GREEN : "var(--surface-2)",
                }}
              >
                <WhatsAppGlyph />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[13.5px] font-semibold text-[var(--ink)]">
                WhatsApp
              </div>
              {isConnected && phone ? (
                <div className="text-[11.5px] text-[var(--ink-soft)] font-[var(--font-mono)]">
                  +{phone}
                </div>
              ) : (
                <div className="text-[11px] text-[var(--ink-mute)]">
                  {isPending ? "Waiting for scan" : "Link your number"}
                </div>
              )}
            </div>
          </div>

          {/* Action */}
          {isConnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => disconnectMut.mutate()}
              disabled={disconnectMut.isPending}
              className="w-full justify-center gap-1.5 text-[var(--ink-mute)] hover:border-[#EF4444] hover:text-[#EF4444]"
            >
              {disconnectMut.isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Power size={13} />
              )}
              Disconnect
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="w-full justify-center gap-1.5"
            >
              <Plug size={13} />
              {isPending ? "View QR" : "Connect"}
            </Button>
          )}
        </div>
      </AspectRatio>

      <WAConnectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
