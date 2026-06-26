"use client";
import {
  useWAConnect,
  useWADisconnect,
  useWATakeoverConfirm,
  useWATakeoverDeny,
  useWAStatus,
} from "@/features/channels/hooks/useWhatsApp";
import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  CheckCircle2,
  Loader2,
  Power,
  QrCode,
  RefreshCw,
  Smartphone,
  WifiOff,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./Dialog";
import { Skeleton } from "./Motion";

interface WAConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function FrameCorners() {
  return (
    <>
      {(["tl", "tr", "bl", "br"] as const).map((pos) => (
        <span
          key={pos}
          className={cn(
            "absolute w-[22px] h-[22px] border-[var(--accent)]",
            pos === "tl" &&
              "top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-[6px]",
            pos === "tr" &&
              "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-[6px]",
            pos === "bl" &&
              "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-[6px]",
            pos === "br" &&
              "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-[6px]",
          )}
        />
      ))}
    </>
  );
}

function QRFrame({ src }: { src: string }) {
  return (
    <div className="relative flex items-center justify-center">
      <div className="relative w-[220px] h-[220px]">
        <FrameCorners />
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

/**
 * QR slot placeholder. Keeps the QR-frame footprint whenever there's no code
 * yet; shimmers while a code is actively being fetched (`animate`) and falls
 * back to a static muted box when idle.
 */
function QRSkeleton({
  label,
  animate = true,
}: {
  label?: string;
  animate?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 w-full">
      <div className="relative w-[220px] h-[220px]">
        <FrameCorners />
        <div className="absolute inset-[8px] rounded-xl overflow-hidden bg-[var(--surface-2)]">
          {animate && <Skeleton className="absolute inset-0 rounded-none" />}
          <div className="absolute inset-0 flex items-center justify-center">
            <QrCode size={36} className="text-[var(--ink-mute)] opacity-40" />
          </div>
        </div>
      </div>
      {label && (
        <div className="flex items-center gap-2">
          {animate && (
            <Loader2 size={14} className="animate-spin text-[var(--accent)]" />
          )}
          <p className="text-[12.5px] text-[var(--ink-mute)]">{label}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Shown in the window between the QR being scanned and the socket reaching
 * CONNECTED. Replaces the old behaviour where the QR vanished back to a
 * "Generating QR…" placeholder before snapping to connected. Pulsing rings +
 * a sweeping progress shimmer read as "we're linking your device, almost there".
 */
function ConnectingView({ phoneNumber }: { phoneNumber?: string }) {
  return (
    <div className="flex flex-col items-center gap-5 py-6 w-full">
      <div className="relative flex items-center justify-center w-20 h-20">
        {/* concentric pulse rings */}
        <span
          className="absolute inset-0 rounded-full bg-[#25D366] opacity-10 animate-ping"
          style={{ animationDuration: "1.6s" }}
        />
        <span className="absolute inset-[5px] rounded-full bg-[#25D366] opacity-[0.08] animate-pulse" />
        <div className="relative w-16 h-16 rounded-full bg-[rgba(37,211,102,0.13)] flex items-center justify-center">
          <Smartphone size={30} className="text-[#25D366]" />
          {/* spinning badge to signal active work */}
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center shadow-sm">
            <Loader2 size={13} className="animate-spin text-[#25D366]" />
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-[14px] font-semibold text-[var(--ink)]">
          QR scanned — connecting
        </p>
        <p className="text-[12px] text-[var(--ink-mute)] mt-1 max-w-[270px]">
          Linking your WhatsApp{phoneNumber ? ` (+${phoneNumber})` : ""}. This
          only takes a moment — keep this window open.
        </p>
      </div>

      {/* sweeping progress shimmer */}
      <div className="relative w-full max-w-[240px] h-1.5 rounded-full overflow-hidden bg-[var(--surface-2)]">
        <motion.div
          className="absolute top-0 bottom-0 w-1/3 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, #25D366, transparent)",
          }}
          animate={{ x: ["-110%", "320%"] }}
          transition={{ duration: 1.25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

export function WAConnectDialog({ open, onOpenChange }: WAConnectDialogProps) {
  const { data: statusData } = useWAStatus();
  const connectMut = useWAConnect();
  const disconnectMut = useWADisconnect();
  const takeoverConfirmMut = useWATakeoverConfirm();
  const takeoverDenyMut = useWATakeoverDeny();
  // Tracks the gap between clicking connect and the first SSE event landing in
  // the cache. All live status/QR/conflict now flows through the wa-status
  // query (useWAStatusStream), so the cache is the single source of truth.
  const [starting, setStarting] = useState(false);
  // True from the moment the QR is scanned (it disappears while still PENDING)
  // until the socket reaches CONNECTED — drives the "connecting" animation.
  const [scanned, setScanned] = useState(false);
  const qrShownRef = useRef(false);

  const status = statusData?.status ?? "DISCONNECTED";
  const phoneNumber = statusData?.phoneNumber;
  const qrCode = statusData?.qr;
  const connectionError = statusData?.error;
  const conflict = statusData?.conflict;

  const handleConnect = () => {
    setStarting(true);
    connectMut.mutate();
  };

  const handleDisconnect = () => {
    setStarting(false);
    disconnectMut.mutate();
  };

  const handleRefreshQR = () => {
    setStarting(true);
    connectMut.mutate();
  };

  // Drop the "starting" shimmer as soon as the stream produces something real.
  useEffect(() => {
    if (qrCode || conflict || connectionError || status === "CONNECTED") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStarting(false);
    }
  }, [qrCode, conflict, connectionError, status]);

  // Detect the scan: once a QR has been presented and it then clears while the
  // session is still PENDING (no error, no conflict), the user has scanned and
  // the device is linking. Show the connecting animation instead of bouncing
  // back to the QR placeholder.
  useEffect(() => {
    if (qrCode) {
      qrShownRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScanned(false);
    } else if (
      qrShownRef.current &&
      status === "PENDING" &&
      !connectionError &&
      !conflict
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScanned(true);
    }
  }, [qrCode, status, connectionError, conflict]);

  // Reset the scan tracker whenever we leave the linking flow.
  useEffect(() => {
    if (!open || status === "CONNECTED" || status === "DISCONNECTED" || conflict) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScanned(false);
      qrShownRef.current = false;
    }
  }, [open, status, conflict]);

  // Auto-start on open if disconnected.
  useEffect(() => {
    if (open && status === "DISCONNECTED" && !connectMut.isPending) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleConnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Show the shimmer while waiting for the first event after clicking connect.
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
            <DialogTitle className="text-[15px] font-semibold">
              WhatsApp
            </DialogTitle>
            <p className="text-[11.5px] text-[var(--ink-mute)] mt-px">
              {status === "CONNECTED"
                ? `Connected · +${phoneNumber ?? ""}`
                : scanned
                  ? "Connecting…"
                  : status === "PENDING" || showLoading
                    ? "Waiting for scan…"
                    : "Not connected"}
            </p>
          </div>
          <StatusDot status={status} loading={showLoading} connecting={scanned} />
        </DialogHeader>

        {/* Body */}
        <div className="p-5 flex flex-col items-center gap-4">
          {/* PHONE CONFLICT — number already linked to another workspace */}
          {conflict && (
            <div className="flex flex-col items-center gap-4 w-full py-2">
              <div className="w-16 h-16 rounded-full bg-[rgba(202,138,4,0.1)] flex items-center justify-center">
                <ArrowLeftRight size={28} className="text-[#CA8A04]" />
              </div>
              <div className="text-center">
                <p className="text-[15px] font-semibold text-[var(--ink)]">Number Already Linked</p>
                <p className="text-[13px] text-[var(--ink-mute)] mt-1">
                  <span className="font-medium text-[var(--ink)]">+{conflict.phoneNumber}</span> is currently
                  connected to{" "}
                  <span className="font-medium text-[var(--ink)]">
                    {conflict.conflictWorkspaces.join(", ")}
                  </span>.
                </p>
                <p className="text-[12px] text-[var(--ink-mute)] mt-2">
                  Switch here? The other workspace will be disconnected.
                </p>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => takeoverConfirmMut.mutate()}
                  disabled={takeoverConfirmMut.isPending || takeoverDenyMut.isPending}
                  className="btn btn-grad w-full justify-center"
                >
                  {takeoverConfirmMut.isPending
                    ? <Loader2 size={13} className="animate-spin" />
                    : <CheckCircle2 size={13} />}
                  Yes, switch here
                </button>
                <button
                  onClick={() => {
                    takeoverDenyMut.mutate(undefined, {
                      onSuccess: () => {
                        setStarting(true);
                        setTimeout(() => { connectMut.mutate(); }, 300);
                      },
                    });
                  }}
                  disabled={takeoverDenyMut.isPending || takeoverConfirmMut.isPending}
                  className="btn btn-outline w-full justify-center text-[12.5px]"
                >
                  {takeoverDenyMut.isPending
                    ? <Loader2 size={13} className="animate-spin" />
                    : <QrCode size={13} />}
                  No, use a different number
                </button>
              </div>
            </div>
          )}

          {/* CONNECTED / QR / DISCONNECTED — hidden while conflict prompt is shown */}
          {!conflict && status === "CONNECTED" && (
            <>
              <div className="flex flex-col items-center gap-3 py-4 w-full">
                <div className="relative flex items-center justify-center w-20 h-20">
                  <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-10 animate-ping" style={{ animationDuration: '2s' }} />
                  <span className="absolute inset-[6px] rounded-full bg-[#25D366] opacity-[0.08]" />
                  <div className="relative w-16 h-16 rounded-full bg-[rgba(37,211,102,0.13)] flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-[#25D366]" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-semibold text-[var(--ink)]">WhatsApp Connected</p>
                  {phoneNumber && <p className="text-[13px] text-[var(--ink-mute)] mt-1">+{phoneNumber}</p>}
                </div>
              </div>
              <button onClick={() => onOpenChange(false)} className="btn btn-grad w-full justify-center gap-2">
                <X size={13} /> Close
              </button>
              <button
                onClick={handleDisconnect}
                disabled={disconnectMut.isPending}
                className="flex items-center gap-1.5 text-[11.5px] text-[var(--ink-mute)] hover:text-[#EF4444] transition-colors duration-150 py-1"
              >
                {disconnectMut.isPending ? <Loader2 size={11} className="animate-spin" /> : <Power size={11} />}
                Disconnect WhatsApp
              </button>
            </>
          )}

          {!conflict && showLoading && (
            <QRSkeleton label="Starting connection…" />
          )}

          {!conflict && !showLoading && status === "PENDING" && (
            <>
              {qrCode ? (
                <>
                  <QRFrame src={qrCode} />
                  <div className="text-center space-y-1">
                    <p className="text-[13.5px] font-semibold text-[var(--ink)]">Scan with WhatsApp</p>
                    <p className="text-[12px] text-[var(--ink-mute)] leading-relaxed max-w-[280px]">
                      Open WhatsApp → tap <span className="font-medium">Linked Devices</span> → <span className="font-medium">Link a Device</span>
                    </p>
                    <p className="text-[11px] text-[var(--ink-mute)]">QR expires in ~60 seconds</p>
                  </div>
                  <button onClick={handleRefreshQR} className="btn btn-outline text-[12px] w-full justify-center">
                    <RefreshCw size={12} /> Refresh QR
                  </button>
                </>
              ) : scanned ? (
                <ConnectingView phoneNumber={phoneNumber} />
              ) : (
                <QRSkeleton label="Generating QR code…" />
              )}
            </>
          )}

          {!conflict && !showLoading && status === "DISCONNECTED" && (
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
              <QRSkeleton
                animate={connectMut.isPending}
                label={connectMut.isPending ? "Generating QR code…" : undefined}
              />
              <button onClick={handleConnect} disabled={connectMut.isPending} className="btn btn-grad w-full justify-center">
                {connectMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <QrCode size={14} />}
                {connectionError ? "Retry Connection" : "Generate QR Code"}
              </button>
            </>
          )}
        </div>

        {!conflict && status !== "CONNECTED" && (
          <div className="px-5 pb-4 flex items-start gap-2.5 text-[11.5px] text-[var(--ink-mute)]">
            <Smartphone size={13} className="flex-shrink-0 mt-px" />
            <span>
              WhatsApp Web approach — no API keys or monthly fees. Uses your
              personal or business number.
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatusDot({
  status,
  loading,
  connecting,
}: {
  status: string;
  loading?: boolean;
  connecting?: boolean;
}) {
  return (
    <span
      className={cn(
        "w-2.5 h-2.5 rounded-full flex-shrink-0",
        status === "CONNECTED" && "bg-[#25D366]",
        // Post-scan linking — green pulse signals "almost connected".
        connecting && status !== "CONNECTED" && "bg-[#25D366] animate-pulse",
        !connecting &&
          (status === "PENDING" || loading) &&
          "bg-[#CA8A04] animate-pulse",
        status === "DISCONNECTED" &&
          !loading &&
          !connecting &&
          "bg-[var(--ink-mute)] opacity-40",
      )}
    />
  );
}

export function WAStatusButton({ onClick }: { onClick: () => void }) {
  const { data: statusData } = useWAStatus();
  const status = statusData?.status ?? "DISCONNECTED";
  const phone = statusData?.phoneNumber;
  const [hovered, setHovered] = useState(false);

  const isConnected = status === "CONNECTED";
  const isPending = status === "PENDING";

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
        boxShadow: isConnected && hovered
          ? '0 0 0 2px rgba(37,211,102,0.2), 0 0 14px rgba(37,211,102,0.12)'
          : isPending && hovered
            ? '0 0 0 2px rgba(202,138,4,0.2)'
            : undefined,
      }}
    >
      {isConnected && hovered && (
        <span className="absolute inset-0 rounded-lg bg-[#25D366] opacity-[0.07] pointer-events-none" />
      )}

      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="relative z-10 flex-shrink-0">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M11.996 1.998C6.478 1.998 2 6.476 2 11.994c0 1.762.461 3.416 1.268 4.853L2 22l5.294-1.247a9.95 9.95 0 0 0 4.702 1.19c5.518 0 9.996-4.477 9.996-9.995 0-5.518-4.478-9.95-9.996-9.95zm0 18.19a8.187 8.187 0 0 1-4.18-1.148l-.3-.178-3.115.733.779-3.023-.196-.31A8.153 8.153 0 0 1 3.81 11.994c0-4.516 3.672-8.187 8.186-8.187s8.187 3.671 8.187 8.187c0 4.515-3.673 8.187-8.187 8.187z" />
      </svg>

      <span
        className={cn(
          "overflow-hidden whitespace-nowrap text-[11.5px] font-medium transition-all duration-200 relative z-10",
          isConnected && hovered && phone ? "max-w-[120px] opacity-100" : "max-w-0 opacity-0",
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
