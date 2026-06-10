"use client";
import {
  useWAConnect,
  useWADisconnect,
  useWAEventStream,
  useWAStatus,
} from "@/features/channels/hooks/useWhatsApp";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Loader2,
  Power,
  QrCode,
  RefreshCw,
  Smartphone,
  WifiOff,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./Dialog";

interface WAConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function QRFrame({ src }: { src: string }) {
  return (
    <div className="relative flex items-center justify-center">
      <div className="relative w-[220px] h-[220px]">
        {(["tl", "tr", "bl", "br"] as const).map((pos) => (
          <span
            key={pos}
            className={cn(
              "absolute w-[22px] h-[22px] border-[var(--accent)]",
              pos === "tl" && "top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-[6px]",
              pos === "tr" && "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-[6px]",
              pos === "bl" && "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-[6px]",
              pos === "br" && "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-[6px]",
            )}
          />
        ))}
        <div className="absolute inset-[8px] rounded-xl overflow-hidden bg-white p-2 shadow-sm border border-[var(--line)]">
          <Image
            src={src}
            alt="WhatsApp QR code"
            width={196}
            height={196}
            unoptimized
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}

function QRPlaceholder({ label }: { label: string }) {
  return (
    <div className="w-[220px] h-[220px] rounded-xl border-2 border-dashed border-[var(--line)] flex flex-col items-center justify-center gap-3 bg-[var(--surface-2)]">
      <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
      <p className="text-[12.5px] text-[var(--ink-mute)]">{label}</p>
    </div>
  );
}

export function WAConnectDialog({ open, onOpenChange }: WAConnectDialogProps) {
  const qc = useQueryClient();
  const { data: statusData } = useWAStatus();
  const connectMut = useWAConnect();
  const disconnectMut = useWADisconnect();
  const [streamActive, setStreamActive] = useState(false);
  // Tracks whether we've just fired the connect call — shows loading UI immediately.
  const [starting, setStarting] = useState(false);

  const { qr, liveStatus, livePhone, liveError } = useWAEventStream(streamActive);

  const status = liveStatus ?? statusData?.status ?? "DISCONNECTED";
  const phoneNumber = livePhone ?? statusData?.phoneNumber;
  const qrCode = qr ?? statusData?.qr;
  const connectionError = liveError ?? statusData?.error;

  // Sync query cache instantly when SSE emits a definitive status.
  useEffect(() => {
    if (!liveStatus) return;
    qc.setQueryData(["wa-status"], (old: any) => ({
      ...old,
      status: liveStatus,
      phoneNumber: livePhone ?? old?.phoneNumber,
      error: liveError ?? null,
    }));
    if (liveStatus !== "PENDING") setStarting(false);
    if (liveStatus === "DISCONNECTED") setStreamActive(false);
  }, [liveStatus, livePhone, liveError, qc]);

  // Auto-start on open if disconnected.
  useEffect(() => {
    if (open && status === "DISCONNECTED" && !streamActive && !connectMut.isPending) {
      handleConnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleConnect = () => {
    setStarting(true);
    setStreamActive(true);
    connectMut.mutate();
  };

  const handleDisconnect = () => {
    setStreamActive(false);
    setStarting(false);
    disconnectMut.mutate();
  };

  const handleRefreshQR = () => {
    setStarting(true);
    setStreamActive(false);
    setTimeout(() => {
      setStreamActive(true);
      connectMut.mutate();
    }, 300);
  };

  // Show loading placeholder while waiting for first SSE event after clicking connect.
  const showLoading = starting && !qrCode && status !== "CONNECTED";

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
            <DialogTitle className="text-[15px] font-semibold">WhatsApp</DialogTitle>
            <p className="text-[11.5px] text-[var(--ink-mute)] mt-px">
              {status === "CONNECTED"
                ? `Connected · +${phoneNumber ?? ""}`
                : status === "PENDING" || showLoading
                  ? "Waiting for scan…"
                  : "Not connected"}
            </p>
          </div>
          <StatusDot status={status} loading={showLoading} />
        </DialogHeader>

        {/* Body */}
        <div className="p-5 flex flex-col items-center gap-4">
          {/* CONNECTED */}
          {status === "CONNECTED" && (
            <>
              <div className="flex flex-col items-center gap-3 py-4 w-full">
                <div className="w-16 h-16 rounded-full bg-[rgba(37,211,102,0.12)] flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-[#25D366]" />
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-semibold text-[var(--ink)]">WhatsApp Connected</p>
                  {phoneNumber && (
                    <p className="text-[13px] text-[var(--ink-mute)] mt-1">+{phoneNumber}</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                disabled={disconnectMut.isPending}
                className="btn btn-outline text-[12.5px] text-[#EF4444] border-[#FECACA] hover:bg-[#FEF2F2] w-full justify-center"
              >
                {disconnectMut.isPending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Power size={13} />
                )}
                Disconnect WhatsApp
              </button>
            </>
          )}

          {/* Loading — clicked connect but SSE not fired yet */}
          {showLoading && (
            <div className="flex flex-col items-center gap-3 py-6">
              <QRPlaceholder label="Starting connection…" />
            </div>
          )}

          {/* PENDING - QR or waiting */}
          {!showLoading && status === "PENDING" && (
            <>
              {qrCode ? (
                <>
                  <QRFrame src={qrCode} />
                  <div className="text-center space-y-1">
                    <p className="text-[13.5px] font-semibold text-[var(--ink)]">Scan with WhatsApp</p>
                    <p className="text-[12px] text-[var(--ink-mute)] leading-relaxed max-w-[280px]">
                      Open WhatsApp → tap{" "}
                      <span className="font-medium">Linked Devices</span> →{" "}
                      <span className="font-medium">Link a Device</span>
                    </p>
                    <p className="text-[11px] text-[var(--ink-mute)]">QR expires in ~60 seconds</p>
                  </div>
                  <button
                    onClick={handleRefreshQR}
                    className="btn btn-outline text-[12px] w-full justify-center"
                  >
                    <RefreshCw size={12} /> Refresh QR
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-6">
                  <QRPlaceholder label="Generating QR code…" />
                </div>
              )}
            </>
          )}

          {/* DISCONNECTED */}
          {!showLoading && status === "DISCONNECTED" && (
            <>
              {connectionError && (
                <div className="w-full flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B]">
                  <WifiOff size={15} className="flex-shrink-0 mt-px" />
                  <div>
                    <p className="text-[12.5px] font-semibold">Connection failed</p>
                    <p className="text-[11.5px] mt-0.5 opacity-80 break-all">{connectionError}</p>
                  </div>
                </div>
              )}
              <div className="flex flex-col items-center gap-3 py-6 w-full">
                <div className="w-[220px] h-[220px] rounded-xl border-2 border-dashed border-[var(--line)] flex flex-col items-center justify-center gap-3 bg-[var(--surface-2)]">
                  <QrCode size={36} className="text-[var(--ink-mute)] opacity-40" />
                  <p className="text-[12.5px] text-[var(--ink-mute)]">No QR generated</p>
                </div>
              </div>
              <button
                onClick={handleConnect}
                disabled={connectMut.isPending}
                className="btn btn-grad w-full justify-center"
              >
                {connectMut.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <QrCode size={14} />
                )}
                {connectionError ? "Retry Connection" : "Generate QR Code"}
              </button>
            </>
          )}
        </div>

        {status !== "CONNECTED" && (
          <div className="px-5 pb-4 flex items-start gap-2.5 text-[11.5px] text-[var(--ink-mute)]">
            <Smartphone size={13} className="flex-shrink-0 mt-px" />
            <span>
              WhatsApp Web approach — no API keys or monthly fees. Uses your personal or business number.
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatusDot({ status, loading }: { status: string; loading?: boolean }) {
  return (
    <span
      className={cn(
        "w-2.5 h-2.5 rounded-full flex-shrink-0",
        status === "CONNECTED" && "bg-[#25D366]",
        (status === "PENDING" || loading) && "bg-[#CA8A04] animate-pulse",
        status === "DISCONNECTED" && !loading && "bg-[var(--ink-mute)] opacity-40",
      )}
    />
  );
}

export function WAStatusButton({ onClick }: { onClick: () => void }) {
  const { data: statusData } = useWAStatus();
  const status = statusData?.status ?? "DISCONNECTED";

  return (
    <button
      onClick={onClick}
      title={
        status === "CONNECTED"
          ? `WhatsApp connected · +${statusData?.phoneNumber ?? ""}`
          : status === "PENDING"
            ? "WhatsApp connecting…"
            : "Connect WhatsApp"
      }
      className={cn(
        "btn btn-ghost relative p-2 flex items-center gap-1.5",
        status === "CONNECTED" && "text-[#25D366]",
        status === "PENDING" && "text-[#CA8A04]",
        status === "DISCONNECTED" && "text-[var(--ink-mute)]",
      )}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M11.996 1.998C6.478 1.998 2 6.476 2 11.994c0 1.762.461 3.416 1.268 4.853L2 22l5.294-1.247a9.95 9.95 0 0 0 4.702 1.19c5.518 0 9.996-4.477 9.996-9.995 0-5.518-4.478-9.95-9.996-9.95zm0 18.19a8.187 8.187 0 0 1-4.18-1.148l-.3-.178-3.115.733.779-3.023-.196-.31A8.153 8.153 0 0 1 3.81 11.994c0-4.516 3.672-8.187 8.186-8.187s8.187 3.671 8.187 8.187c0 4.515-3.673 8.187-8.187 8.187z" />
      </svg>
      <span
        className={cn(
          "absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-[1.5px] border-[var(--surface)]",
          status === "CONNECTED" && "bg-[#25D366]",
          status === "PENDING" && "bg-[#CA8A04] animate-pulse",
          status === "DISCONNECTED" && "bg-[var(--ink-mute)] opacity-50",
        )}
      />
    </button>
  );
}
