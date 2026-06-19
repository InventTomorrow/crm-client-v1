"use client";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/shared/ui/Motion";
import {
  ArrowLeftRight,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Power,
  QrCode,
  RefreshCw,
  WifiOff,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  useUpdateWAConfig,
  useWAConfig,
  useWAConnect,
  useWADisconnect,
  useWAStatus,
  useWATakeoverConfirm,
  useWATakeoverDeny,
} from "../hooks/useWhatsApp";
import type { WASessionStatus } from "../types";

// ── Status pill ────────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: WASessionStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1 rounded-full",
        status === "CONNECTED" && "bg-[#DCFCE7] text-[#15803D]",
        status === "PENDING" && "bg-[#FEF9C3] text-[#854D0E]",
        status === "DISCONNECTED" &&
          "bg-[var(--surface-2)] text-[var(--ink-mute)]",
      )}
    >
      <span
        className={cn(
          "w-[6px] h-[6px] rounded-full flex-shrink-0",
          status === "CONNECTED" && "bg-[#15803D]",
          status === "PENDING" && "bg-[#CA8A04] animate-pulse",
          status === "DISCONNECTED" && "bg-[var(--ink-mute)]",
        )}
      />
      {status === "CONNECTED"
        ? "Connected"
        : status === "PENDING"
          ? "Connecting…"
          : "Disconnected"}
    </span>
  );
}

// ── Toggle switch ──────────────────────────────────────────────────────────────
function Toggle({
  enabled,
  onChange,
  disabled,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
        enabled ? "bg-[var(--accent)]" : "bg-[var(--line)]",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200",
          enabled ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

// ── QR frame with corner accents ───────────────────────────────────────────────
function QRFrame({ src }: { src: string }) {
  return (
    <div className="relative w-[216px] h-[216px] flex-shrink-0">
      {(["tl", "tr", "bl", "br"] as const).map((pos) => (
        <span
          key={pos}
          className={cn(
            "absolute w-5 h-5 border-[var(--accent)]",
            pos === "tl" &&
              "top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-[5px]",
            pos === "tr" &&
              "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-[5px]",
            pos === "bl" &&
              "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-[5px]",
            pos === "br" &&
              "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-[5px]",
          )}
        />
      ))}
      <div className="absolute inset-[7px] rounded-lg overflow-hidden bg-white p-1.5 shadow-sm border border-[var(--line)]">
        <Image
          src={src}
          alt="WhatsApp QR code"
          width={194}
          height={194}
          unoptimized
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}

// ── QR slot placeholder ──────────────────────────────────────────────────────
function QRSkeleton({
  label,
  animate = true,
}: {
  label?: string;
  animate?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="relative w-[216px] h-[216px] flex-shrink-0">
        {(["tl", "tr", "bl", "br"] as const).map((pos) => (
          <span
            key={pos}
            className={cn(
              "absolute w-5 h-5 border-[var(--accent)]",
              pos === "tl" &&
                "top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-[5px]",
              pos === "tr" &&
                "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-[5px]",
              pos === "bl" &&
                "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-[5px]",
              pos === "br" &&
                "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-[5px]",
            )}
          />
        ))}
        <div className="absolute inset-[7px] rounded-lg overflow-hidden bg-[var(--surface-2)]">
          {animate && <Skeleton className="absolute inset-0 rounded-none" />}
          <div className="absolute inset-0 flex items-center justify-center">
            <QrCode size={36} className="text-[var(--ink-mute)] opacity-30" />
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

// ── Step badge ─────────────────────────────────────────────────────────────────
function Step({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white text-[10.5px] font-bold flex items-center justify-center flex-shrink-0">
        {n}
      </div>
      <span className="text-[12.5px] text-[var(--ink-soft)]">{label}</span>
    </div>
  );
}

// ── Main view ──────────────────────────────────────────────────────────────────
export function ChannelsView() {
  const { data: statusData } = useWAStatus();
  const { data: config } = useWAConfig();
  const connectMut = useWAConnect();
  const disconnectMut = useWADisconnect();
  const updateConfigMut = useUpdateWAConfig();
  const takeoverConfirmMut = useWATakeoverConfirm();
  const takeoverDenyMut = useWATakeoverDeny();

  // All live status/QR/conflict flows through the wa-status query cache
  // (useWAStatusStream), so the cache is the single source of truth.
  const [starting, setStarting] = useState(false);

  const status: WASessionStatus = statusData?.status ?? "DISCONNECTED";
  const phoneNumber = statusData?.phoneNumber;
  const qrCode = statusData?.qr;
  const connectionError = statusData?.error;
  const conflict = statusData?.conflict ?? null;
  const showLoading =
    starting && !qrCode && !conflict && status !== "CONNECTED";

  // Drop the "starting" shimmer once the stream produces something real.
  useEffect(() => {
    if (qrCode || conflict || connectionError || status === "CONNECTED") {
      setStarting(false);
    }
  }, [qrCode, conflict, connectionError, status]);

  const handleConnect = () => {
    setStarting(true);
    connectMut.mutate();
  };

  const handleDisconnect = () => {
    setStarting(false);
    disconnectMut.mutate();
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-[22px] font-semibold font-[var(--font-head)]">
          Channels
        </h1>
        <p className="text-[13.5px] text-[var(--ink-mute)] mt-0.5">
          Connect your messaging channels to enable AI-powered conversations.
        </p>
      </div>

      {/* WhatsApp card */}
      <div className="card p-0 overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--line)]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#25D366" }}
            >
              <MessageCircle size={20} className="text-white" fill="white" />
            </div>
            <div>
              <p className="font-semibold text-[14.5px]">WhatsApp</p>
              <p className="text-[12px] text-[var(--ink-mute)] mt-px">
                {status === "CONNECTED" && phoneNumber
                  ? `+${phoneNumber}`
                  : "Scan QR to connect your number"}
              </p>
            </div>
          </div>
          <StatusPill status={status} />
        </div>

        {/* Body */}
        <div className="p-5">
          {/* ── PHONE CONFLICT — number already linked to another workspace ── */}
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
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <button
                  onClick={() => takeoverConfirmMut.mutate()}
                  disabled={
                    takeoverConfirmMut.isPending || takeoverDenyMut.isPending
                  }
                  className="btn btn-grad w-full justify-center"
                >
                  {takeoverConfirmMut.isPending ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={13} />
                  )}
                  Yes, switch here
                </button>
                <button
                  onClick={() =>
                    takeoverDenyMut.mutate(undefined, {
                      onSuccess: () => {
                        setStarting(true);
                        setTimeout(() => connectMut.mutate(), 300);
                      },
                    })
                  }
                  disabled={
                    takeoverDenyMut.isPending || takeoverConfirmMut.isPending
                  }
                  className="btn btn-outline w-full justify-center text-[12.5px]"
                >
                  {takeoverDenyMut.isPending ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <QrCode size={13} />
                  )}
                  No, use a different number
                </button>
              </div>
            </div>
          )}

          {/* ── CONNECTED ─────────────────────────────────────────────────── */}
          {!conflict && status === "CONNECTED" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
                <div className="w-10 h-10 rounded-full bg-[#DCFCE7] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={20} className="text-[#15803D]" />
                </div>
                <div>
                  <p className="text-[13.5px] font-semibold text-[#15803D]">
                    WhatsApp is active
                  </p>
                  <p className="text-[12px] text-[#166534] mt-px">
                    {phoneNumber
                      ? `+${phoneNumber}`
                      : "Your number is linked and receiving messages"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                disabled={disconnectMut.isPending}
                className="btn btn-outline self-start text-[12.5px] text-[#EF4444] border-[#FECACA] hover:bg-[#FEF2F2]"
              >
                {disconnectMut.isPending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Power size={13} />
                )}
                Disconnect
              </button>
            </div>
          )}

          {/* ── LOADING (waiting for first stream event) ──────────────────── */}
          {showLoading && <QRSkeleton label="Starting connection…" />}

          {/* ── PENDING ───────────────────────────────────────────────────── */}
          {!conflict && !showLoading && status === "PENDING" && (
            <div className="flex flex-col items-center gap-5 py-2">
              {qrCode ? (
                <>
                  <QRFrame src={qrCode} />
                  <div className="w-full space-y-2 bg-[var(--surface-2)] rounded-xl p-4">
                    <p className="text-[12px] font-semibold text-[var(--ink-soft)] mb-3">
                      How to scan
                    </p>
                    <Step n={1} label="Open WhatsApp on your phone" />
                    <Step n={2} label='Tap Menu → "Linked Devices"' />
                    <Step n={3} label='"Link a Device" → scan this QR' />
                  </div>
                  <p className="text-[11.5px] text-[var(--ink-mute)]">
                    QR expires in ~60 seconds
                  </p>
                  <button
                    onClick={() => {
                      setStarting(true);
                      connectMut.mutate();
                    }}
                    className="btn btn-outline text-[12px]"
                  >
                    <RefreshCw size={12} /> Refresh QR
                  </button>
                </>
              ) : (
                <QRSkeleton label="Generating QR code…" />
              )}
            </div>
          )}

          {/* ── DISCONNECTED ──────────────────────────────────────────────── */}
          {!conflict && !showLoading && status === "DISCONNECTED" && (
            <div className="flex flex-col items-center gap-5 py-4">
              {connectionError && (
                <div className="w-full flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B]">
                  <WifiOff size={14} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[12.5px] font-semibold">
                      Connection failed
                    </p>
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
              <p className="text-[12.5px] text-[var(--ink-mute)] text-center max-w-xs">
                Link your WhatsApp number so the AI can receive and reply to
                customer messages automatically.
              </p>
              <button
                onClick={handleConnect}
                disabled={connectMut.isPending}
                className="btn btn-grad px-6 py-2.5"
              >
                {connectMut.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <QrCode size={14} />
                )}
                {connectionError ? "Retry Connection" : "Generate QR Code"}
              </button>
            </div>
          )}
        </div>

        {/* AI Settings — only when connected */}
        {status === "CONNECTED" && (
          <div className="border-t border-[var(--line)] px-5 py-4 space-y-4">
            <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[var(--ink-mute)]">
              AI Settings
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0">
                  <Zap size={14} className="text-[var(--accent)]" />
                </div>
                <div>
                  <p className="text-[13px] font-medium">Auto-Reply</p>
                  <p className="text-[12px] text-[var(--ink-mute)] mt-px">
                    {config?.autoReply
                      ? "AI sends replies automatically to leads"
                      : "AI drafts replies — you review before sending"}
                  </p>
                </div>
              </div>
              <Toggle
                enabled={config?.autoReply ?? false}
                onChange={(v) => updateConfigMut.mutate({ autoReply: v })}
                disabled={updateConfigMut.isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[rgba(239,68,68,0.08)] flex items-center justify-center flex-shrink-0">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-medium">
                    Allow Order Cancellation via Chat
                  </p>
                  <p className="text-[12px] text-[var(--ink-mute)] mt-px">
                    {config?.allowOrderCancellation
                      ? "Customers can cancel PENDING or CONFIRMED orders through the chatbot"
                      : "Customers are directed to contact support for cancellations"}
                  </p>
                </div>
              </div>
              <Toggle
                enabled={config?.allowOrderCancellation ?? true}
                onChange={(v) =>
                  updateConfigMut.mutate({ allowOrderCancellation: v })
                }
                disabled={updateConfigMut.isPending}
              />
            </div>

            {config?.aiEnabled ? (
              <p className="text-[12px] text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg px-3 py-2">
                AI is enabled — responding to lead messages
              </p>
            ) : (
              <p className="text-[12px] text-[#854D0E] bg-[#FEF9C3] border border-[#FDE68A] rounded-lg px-3 py-2">
                AI is disabled — enable the chatbot in Settings to start
                auto-replying
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
