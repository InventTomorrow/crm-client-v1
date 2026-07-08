"use client";
import { WhatsAppWidget } from "@/features/channels/components/WhatsAppWidget";
import { useWAStatus } from "@/features/channels/hooks/useWhatsApp";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./Dialog";

interface WAConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Header-triggered WhatsApp connect dialog. Renders the exact same connectivity
 * card as the Channels page (WhatsAppWidget) so the experience is identical —
 * generate-on-demand QR, connecting state, disconnect, etc.
 */
export function WAConnectDialog({ open, onOpenChange }: WAConnectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden border-0">
        <DialogTitle className="sr-only">WhatsApp connection</DialogTitle>
        <WhatsAppWidget
          className="h-auto rounded-none border-0 shadow-none"
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export function WAStatusButton({ onClick }: { onClick: () => void }) {
  const { data: statusData } = useWAStatus();
  const status = statusData?.status ?? "DISCONNECTED";
  const phone = statusData?.phoneNumber;
  const [hovered, setHovered] = useState(false);

  const isConnected = status === "CONNECTED";
  const isPending = status === "PENDING" || status === "CONNECTING";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "btn btn-ghost relative flex items-center gap-1.5 px-2 py-2 rounded-lg transition-all duration-200",
        isConnected && "text-[#25D366]",
        isPending && "text-[#CA8A04]",
        !isConnected && !isPending && "text-[var(--ink-mute)]",
      )}
      style={{
        boxShadow:
          isConnected && hovered
            ? "0 0 0 2px rgba(37,211,102,0.2), 0 0 14px rgba(37,211,102,0.12)"
            : isPending && hovered
              ? "0 0 0 2px rgba(202,138,4,0.2)"
              : undefined,
      }}
    >
      {isConnected && hovered && (
        <span className="absolute inset-0 rounded-lg bg-[#25D366] opacity-[0.07] pointer-events-none" />
      )}

      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="relative z-10 flex-shrink-0"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M11.996 1.998C6.478 1.998 2 6.476 2 11.994c0 1.762.461 3.416 1.268 4.853L2 22l5.294-1.247a9.95 9.95 0 0 0 4.702 1.19c5.518 0 9.996-4.477 9.996-9.995 0-5.518-4.478-9.95-9.996-9.95zm0 18.19a8.187 8.187 0 0 1-4.18-1.148l-.3-.178-3.115.733.779-3.023-.196-.31A8.153 8.153 0 0 1 3.81 11.994c0-4.516 3.672-8.187 8.186-8.187s8.187 3.671 8.187 8.187c0 4.515-3.673 8.187-8.187 8.187z" />
      </svg>

      <span
        className={cn(
          "overflow-hidden whitespace-nowrap text-[11.5px] font-medium transition-all duration-200 relative z-10",
          isConnected && hovered && phone
            ? "max-w-[120px] opacity-100"
            : "max-w-0 opacity-0",
        )}
      >
        +{phone}
      </span>

      <span
        className={cn(
          "absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-[1.5px] border-[var(--surface)] transition-opacity duration-150",
          isConnected && "bg-[#25D366]",
          isPending && "bg-[#CA8A04] animate-pulse",
          !isConnected && !isPending && "bg-[var(--ink-mute)] opacity-50",
          isConnected && hovered && phone && "opacity-0",
        )}
      />
    </button>
  );
}
