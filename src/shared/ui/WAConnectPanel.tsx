"use client";
import {
  useWAConnect,
  useWADisconnect,
  useWAStatus,
  useWATakeoverConfirm,
  useWATakeoverDeny,
} from "@/features/channels/whatsapp/hooks/useWhatsApp";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  CheckCircle2,
  Loader2,
  Lock,
  Power,
  QrCode,
  RefreshCw,
  Smartphone,
  WifiOff,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import { Skeleton } from "./Motion";

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

function ConnectingView({ phoneNumber }: { phoneNumber?: string }) {
  return (
    <div className="flex flex-col items-center gap-5 py-6 w-full">
      <div className="relative flex items-center justify-center w-20 h-20">
        <span
          className="absolute inset-0 rounded-full bg-[#25D366] opacity-10 animate-ping"
          style={{ animationDuration: "1.6s" }}
        />
        <span className="absolute inset-[5px] rounded-full bg-[#25D366] opacity-[0.08] animate-pulse" />
        <div className="relative w-16 h-16 rounded-full bg-[rgba(37,211,102,0.13)] flex items-center justify-center">
          <Smartphone size={30} className="text-[#25D366]" />
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
          only takes a moment — keep this open.
        </p>
      </div>

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

export interface WAConnectPanelState {
  status: string;
  phoneNumber?: string | null;
  showLoading: boolean;
}

/**
 * The WhatsApp connect flow (QR scan → connecting → connected). Shared between
 * the header dialog and the Channels page so the QR experience is identical in
 * both. Every state is driven by real server events streamed over SSE:
 * DISCONNECTED → PENDING (+qr, waiting for scan) → CONNECTING → CONNECTED.
 * `onStateChange` lets a host (e.g. the dialog header) mirror live status.
 */
export function WAConnectPanel({
  manualStart = false,
  canManage = true,
  showClose = false,
  onClose,
  onStateChange,
}: {
  /** Show a "Generate QR Code" gate first and never render a QR (even one the
   *  server already holds) until the user clicks it — avoids server overhead. */
  manualStart?: boolean;
  /** Gates every connect/disconnect control behind `channels:connect`. */
  canManage?: boolean;
  /** Shows a "Close" button in the connected state (dialog only). */
  showClose?: boolean;
  onClose?: () => void;
  onStateChange?: (s: WAConnectPanelState) => void;
}) {
  const { data: statusData } = useWAStatus();
  const connectMut = useWAConnect();
  const disconnectMut = useWADisconnect();
  const takeoverConfirmMut = useWATakeoverConfirm();
  const takeoverDenyMut = useWATakeoverDeny();

  const [starting, setStarting] = useState(false);
  // For manualStart: gate the QR behind an explicit "Generate" click.
  const [armed, setArmed] = useState(false);

  const status = statusData?.status ?? "DISCONNECTED";
  const phoneNumber = statusData?.phoneNumber;
  const qrCode = statusData?.qr;
  const connectionError = statusData?.error;
  const conflict = statusData?.conflict;
  // The server ends an unscanned pairing with this error — informational, not a failure.
  const qrExpired = !!connectionError?.startsWith("QR expired");

  const handleConnect = () => {
    setStarting(true);
    connectMut.mutate();
  };

  const handleDisconnect = () => {
    setStarting(false);
    setArmed(false);
    disconnectMut.mutate();
  };

  // Drop the "starting" shimmer as soon as the stream produces something real.
  useEffect(() => {
    if (
      qrCode ||
      conflict ||
      connectionError ||
      status === "CONNECTING" ||
      status === "CONNECTED"
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStarting(false);
    }
  }, [qrCode, conflict, connectionError, status]);

  const showLoading =
    starting && !qrCode && status !== "CONNECTED" && status !== "CONNECTING";

  useEffect(() => {
    onStateChange?.({
      status,
      phoneNumber,
      showLoading,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, phoneNumber, showLoading]);

  // Read-only view for members without channels:connect.
  if (!canManage) {
    return (
      <div className="p-5 flex flex-col items-center gap-3 text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--surface-2)] flex items-center justify-center">
          <Lock size={22} className="text-[var(--ink-mute)]" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[var(--ink)]">
            {status === "CONNECTED"
              ? "WhatsApp Connected"
              : "WhatsApp not connected"}
          </p>
          <p className="text-[12px] text-[var(--ink-mute)] mt-1 max-w-[260px]">
            You don&apos;t have permission to manage the WhatsApp connection.
            Ask a workspace owner for access.
          </p>
        </div>
      </div>
    );
  }

  // Manual-start gate: show a Generate button first and never render a QR
  // (even one the server already holds) until the user opts in.
  if (
    manualStart &&
    !armed &&
    status !== "CONNECTED" &&
    status !== "CONNECTING" &&
    !conflict
  ) {
    return (
      <div className="p-5 flex flex-col items-center gap-4 w-full">
        <QRSkeleton animate={false} />
        <Button
          className="w-full justify-center"
          onClick={() => {
            setArmed(true);
            handleConnect();
          }}
          disabled={connectMut.isPending}
        >
          {connectMut.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <QrCode size={14} />
          )}
          Generate QR Code
        </Button>
        <div className="flex items-start gap-2.5 text-[11.5px] text-[var(--ink-mute)]">
          <Smartphone size={13} className="shrink-0 mt-px" />
          <span>
            WhatsApp Web approach — the QR is generated only when you click, to
            keep the connection light.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 flex flex-col items-center gap-4">
      {/* PHONE CONFLICT */}
      {conflict && (
        <div className="flex flex-col items-center gap-4 w-full py-2">
          <div className="w-16 h-16 rounded-full bg-[rgba(202,138,4,0.1)] flex items-center justify-center">
            <ArrowLeftRight size={28} className="text-[#CA8A04]" />
          </div>
          <div className="text-center">
            <p className="text-[15px] font-semibold text-[var(--ink)]">
              Number Already Linked
            </p>
            <p className="text-[13px] text-[var(--ink-mute)] mt-1">
              <span className="font-medium text-[var(--ink)]">
                +{conflict.phoneNumber}
              </span>{" "}
              is currently connected to{" "}
              <span className="font-medium text-[var(--ink)]">
                {conflict.conflictWorkspaces.join(", ")}
              </span>
              .
            </p>
            <p className="text-[12px] text-[var(--ink-mute)] mt-2">
              Switch here? The other workspace will be disconnected.
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <Button
              className="w-full justify-center"
              onClick={() => takeoverConfirmMut.mutate()}
              disabled={
                takeoverConfirmMut.isPending || takeoverDenyMut.isPending
              }
            >
              {takeoverConfirmMut.isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <CheckCircle2 size={13} />
              )}
              Yes, switch here
            </Button>
            <Button
              variant="outline"
              className="w-full justify-center"
              onClick={() => {
                takeoverDenyMut.mutate(undefined, {
                  onSuccess: () => {
                    setStarting(true);
                    setTimeout(() => {
                      connectMut.mutate();
                    }, 300);
                  },
                });
              }}
              disabled={
                takeoverDenyMut.isPending || takeoverConfirmMut.isPending
              }
            >
              {takeoverDenyMut.isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <QrCode size={13} />
              )}
              No, use a different number
            </Button>
          </div>
        </div>
      )}

      {/* CONNECTED */}
      {!conflict && status === "CONNECTED" && (
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
                WhatsApp Connected
              </p>
              {phoneNumber && (
                <p className="text-[13px] text-[var(--ink-mute)] mt-1">
                  +{phoneNumber}
                </p>
              )}
            </div>
          </div>
          {showClose && onClose && (
            <Button
              variant="outline"
              className="w-full justify-center gap-2"
              onClick={onClose}
            >
              <X size={13} /> Close
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            disabled={disconnectMut.isPending}
            className="flex items-center gap-1.5 text-[var(--ink-mute)] hover:text-[#EF4444]"
          >
            {disconnectMut.isPending ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Power size={11} />
            )}
            Disconnect WhatsApp
          </Button>
        </>
      )}

      {!conflict && showLoading && <QRSkeleton label="Starting connection…" />}

      {/* QR SCANNED — the server detected the pairing and is finishing login */}
      {!conflict && !showLoading && status === "CONNECTING" && (
        <ConnectingView phoneNumber={phoneNumber ?? undefined} />
      )}

      {/* WAITING FOR SCAN */}
      {!conflict && !showLoading && status === "PENDING" && (
        <>
          {qrCode ? (
            <>
              <QRFrame src={qrCode} />
              <div className="text-center space-y-1">
                <p className="text-[13.5px] font-semibold text-[var(--ink)]">
                  Scan with WhatsApp
                </p>
                <p className="text-[12px] text-[var(--ink-mute)] leading-relaxed max-w-[280px]">
                  Open WhatsApp → tap{" "}
                  <span className="font-medium">Linked Devices</span> →{" "}
                  <span className="font-medium">Link a Device</span>
                </p>
                <p className="text-[11px] text-[var(--ink-mute)]">
                  QR expires in ~60 seconds
                </p>
              </div>
              <Button
                variant="outline"
                className="text-[12px] w-full justify-center"
                onClick={handleConnect}
              >
                <RefreshCw size={12} /> Refresh QR
              </Button>
            </>
          ) : (
            <QRSkeleton label="Generating QR code…" />
          )}
        </>
      )}

      {!conflict && !showLoading && status === "DISCONNECTED" && (
        <>
          {connectionError && qrExpired && (
            <div className="w-full flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
              <QrCode
                size={15}
                className="shrink-0 mt-px text-[var(--ink-mute)]"
              />
              <div>
                <p className="text-[12.5px] font-semibold text-[var(--ink)]">
                  QR code expired
                </p>
                <p className="text-[11.5px] mt-0.5 text-[var(--ink-mute)]">
                  Generate a new code to continue linking.
                </p>
              </div>
            </div>
          )}
          {connectionError && !qrExpired && (
            <div className="w-full flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B]">
              <WifiOff size={15} className="shrink-0 mt-px" />
              <div>
                <p className="text-[12.5px] font-semibold">Connection failed</p>
                <p className="text-[11.5px] mt-0.5 opacity-80 break-all">
                  {connectionError}
                </p>
              </div>
            </div>
          )}
          <QRSkeleton
            animate={connectMut.isPending}
            label={connectMut.isPending ? "Generating QR code…" : undefined}
          />
          <Button
            className="w-full justify-center"
            onClick={handleConnect}
            disabled={connectMut.isPending}
          >
            {connectMut.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <QrCode size={14} />
            )}
            {connectionError && !qrExpired
              ? "Retry Connection"
              : "Generate QR Code"}
          </Button>
        </>
      )}

      {!conflict && status !== "CONNECTED" && (
        <div className="flex items-start gap-2.5 text-[11.5px] text-[var(--ink-mute)]">
          <Smartphone size={13} className="flex-shrink-0 mt-px" />
          <span>
            WhatsApp Web approach — no API keys or monthly fees. Uses your
            personal or business number.
          </span>
        </div>
      )}
    </div>
  );
}
