"use client";
import {
  useWADisconnect,
  useWAEmbeddedSignup,
  useWAState,
} from "@/features/channels/hooks/useWhatsApp";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  Power,
  WifiOff,
  X,
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./Dialog";

interface WAConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WAConnectDialog({ open, onOpenChange }: WAConnectDialogProps) {
  const { data: stateData } = useWAState();
  const disconnectMut = useWADisconnect();
  const { openSignup, isConnecting } = useWAEmbeddedSignup();

  const status = stateData?.status ?? "DISCONNECTED";
  const phoneNumber = stateData?.phoneNumber;
  const errorMessage = stateData?.errorMessage;
  const [hovered, setHovered] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="flex-row items-center gap-3 px-5 py-4 border-b border-[var(--line)] bg-[var(--surface)]">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#25D366" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M11.996 1.998C6.478 1.998 2 6.476 2 11.994c0 1.762.461 3.416 1.268 4.853L2 22l5.294-1.247a9.95 9.95 0 0 0 4.702 1.19c5.518 0 9.996-4.477 9.996-9.995 0-5.518-4.478-9.95-9.996-9.95zm0 18.19a8.187 8.187 0 0 1-4.18-1.148l-.3-.178-3.115.733.779-3.023-.196-.31A8.153 8.153 0 0 1 3.81 11.994c0-4.516 3.672-8.187 8.186-8.187s8.187 3.671 8.187 8.187c0 4.515-3.673 8.187-8.187 8.187z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-[15px] font-semibold">
              WhatsApp Business
            </DialogTitle>
            <p className="text-[11.5px] text-[var(--ink-mute)] mt-px">
              {status === "CONNECTED"
                ? `Connected · ${phoneNumber ?? ""}`
                : isConnecting
                  ? "Opening Meta login…"
                  : "Connect via Meta Embedded Signup"}
            </p>
          </div>
          {/* Status dot */}
          <span
            className={cn(
              "w-2.5 h-2.5 rounded-full flex-shrink-0",
              status === "CONNECTED" && "bg-[#25D366]",
              status === "ERROR" && "bg-[#EF4444] animate-pulse",
              status === "DISCONNECTED" && "bg-[var(--ink-mute)] opacity-40",
            )}
          />
        </DialogHeader>

        {/* Body */}
        <div className="p-5 flex flex-col items-center gap-4">
          {/* ── CONNECTED ─────────────────────────────────────────────────── */}
          {status === "CONNECTED" && (
            <>
              <div className="flex flex-col items-center gap-3 py-4 w-full">
                <div className="relative flex items-center justify-center w-20 h-20">
                  <span
                    className="absolute inset-0 rounded-full bg-[#25D366] opacity-10 animate-ping"
                    style={{ animationDuration: "2s" }}
                  />
                  <span className="absolute inset-[6px] rounded-full bg-[#25D366] opacity-[0.08]" />
                  <div className="relative w-16 h-16 rounded-full bg-[rgba(37,211,102,0.13)] flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-[#25D366]" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-semibold text-[var(--ink)]">
                    WhatsApp Business Connected
                  </p>
                  {phoneNumber && (
                    <p className="text-[13px] text-[var(--ink-mute)] mt-1">
                      {phoneNumber}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="btn btn-grad w-full justify-center gap-2"
              >
                <X size={13} /> Close
              </button>
              <button
                onClick={() => disconnectMut.mutate()}
                disabled={disconnectMut.isPending}
                className="flex items-center gap-1.5 text-[11.5px] text-[var(--ink-mute)] hover:text-[#EF4444] transition-colors duration-150 py-1"
              >
                {disconnectMut.isPending ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Power size={11} />
                )}
                Disconnect WhatsApp
              </button>
            </>
          )}

          {/* ── ERROR ───────────────────────────────────────────────────── */}
          {status === "ERROR" && (
            <>
              <div className="w-full flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B]">
                <WifiOff size={15} className="flex-shrink-0 mt-px" />
                <div>
                  <p className="text-[12.5px] font-semibold">Connection error</p>
                  <p className="text-[11.5px] mt-0.5 opacity-80 break-all">
                    {errorMessage ?? "An unexpected error occurred."}
                  </p>
                </div>
              </div>
              <button
                onClick={openSignup}
                disabled={isConnecting}
                className="btn btn-grad w-full justify-center"
              >
                {isConnecting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ExternalLink size={14} />
                )}
                Reconnect via Meta
              </button>
            </>
          )}

          {/* ── DISCONNECTED ────────────────────────────────────────────── */}
          {status === "DISCONNECTED" && (
            <>
              <div className="flex flex-col items-center gap-3 py-4 w-full">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(37,211,102,0.1)" }}
                >
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="#25D366"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M11.996 1.998C6.478 1.998 2 6.476 2 11.994c0 1.762.461 3.416 1.268 4.853L2 22l5.294-1.247a9.95 9.95 0 0 0 4.702 1.19c5.518 0 9.996-4.477 9.996-9.995 0-5.518-4.478-9.95-9.996-9.95zm0 18.19a8.187 8.187 0 0 1-4.18-1.148l-.3-.178-3.115.733.779-3.023-.196-.31A8.153 8.153 0 0 1 3.81 11.994c0-4.516 3.672-8.187 8.186-8.187s8.187 3.671 8.187 8.187c0 4.515-3.673 8.187-8.187 8.187z" />
                  </svg>
                </div>
                <p className="text-[14px] font-semibold text-[var(--ink)] text-center">
                  Connect WhatsApp Business
                </p>
                <p className="text-[12px] text-[var(--ink-mute)] text-center max-w-[280px] leading-relaxed">
                  Log in with your Meta Business account to link your WhatsApp Business number securely.
                </p>
              </div>
              <button
                id="wa-dialog-connect-btn"
                onClick={openSignup}
                disabled={isConnecting}
                className="btn btn-grad w-full justify-center"
              >
                {isConnecting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ExternalLink size={14} />
                )}
                {isConnecting ? "Opening Meta login…" : "Connect via Meta"}
              </button>
              <p className="text-[11px] text-[var(--ink-mute)] text-center">
                Official Meta API — TOS-compliant, no ban risk
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── WAStatusButton (used in AppTopBar) ─────────────────────────────────────

export function WAStatusButton({ onClick }: { onClick: () => void }) {
  const { data: stateData } = useWAState();
  const status = stateData?.status ?? "DISCONNECTED";
  const phone = stateData?.phoneNumber;
  const [hovered, setHovered] = useState(false);

  const isConnected = status === "CONNECTED";
  const isError = status === "ERROR";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "btn btn-ghost relative flex items-center gap-1.5 px-2 py-2 rounded-lg transition-all duration-200",
        isConnected && "text-[#25D366]",
        isError && "text-[#EF4444]",
        !isConnected && !isError && "text-[var(--ink-mute)]",
      )}
      style={{
        boxShadow:
          isConnected && hovered
            ? "0 0 0 2px rgba(37,211,102,0.2), 0 0 14px rgba(37,211,102,0.12)"
            : isError && hovered
              ? "0 0 0 2px rgba(239,68,68,0.2)"
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
        {phone}
      </span>

      <span
        className={cn(
          "absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-[1.5px] border-[var(--surface)] transition-opacity duration-150",
          isConnected && "bg-[#25D366]",
          isError && "bg-[#EF4444] animate-pulse",
          !isConnected && !isError && "bg-[var(--ink-mute)] opacity-50",
          isConnected && hovered && phone && "opacity-0",
        )}
      />
    </button>
  );
}
