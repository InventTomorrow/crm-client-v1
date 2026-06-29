"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  MessageCircle,
  Power,
  WifiOff,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  useUpdateWAConfig,
  useWAConfig,
  useWADisconnect,
  useWAEmbeddedSignup,
  useWAManualConnect,
  useWAState,
} from "../hooks/useWhatsApp";
import {
  manualConnectSchema,
  type ManualConnectData,
  type WAChannelStatus,
} from "../types";

// ── Dev manual connect ──────────────────────────────────────────────────────

/**
 * Collapsible form to connect via credentials pasted from Meta's "API Setup"
 * page. A stopgap until the app is approved as a Tech Provider for Embedded Signup.
 */
function ManualConnect() {
  const [open, setOpen] = useState(false);
  const manualConnect = useWAManualConnect();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ManualConnectData>({ resolver: zodResolver(manualConnectSchema) });

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[11.5px] text-[var(--ink-mute)] underline underline-offset-2 hover:text-[var(--ink-soft)]"
      >
        Connect manually with API credentials (developer)
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((data) => manualConnect.mutate(data))}
      className="w-full space-y-2.5 bg-[var(--surface-2)] rounded-xl p-4 text-left"
    >
      <p className="text-[12px] font-semibold text-[var(--ink-soft)]">
        Manual connect — paste from WhatsApp → API Setup
      </p>
      {(
        [
          { name: "phoneNumberId", label: "Phone number ID" },
          { name: "wabaId", label: "WhatsApp Business Account ID" },
          { name: "accessToken", label: "Access token" },
        ] as const
      ).map(({ name, label }) => (
        <div key={name}>
          <label className="text-[11.5px] text-[var(--ink-mute)]">{label}</label>
          <Input
            {...register(name)}
            type={name === "accessToken" ? "password" : "text"}
            autoComplete="off"
            className="mt-0.5 text-[12.5px]"
          />
          {errors[name] && (
            <p className="text-[11px] text-[#EF4444] mt-0.5">
              {errors[name]?.message}
            </p>
          )}
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" disabled={manualConnect.isPending}>
          {manualConnect.isPending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : null}
          Connect
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Status pill ────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: WAChannelStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1 rounded-full",
        status === "CONNECTED" && "bg-[#DCFCE7] text-[#15803D]",
        status === "ERROR" && "bg-[#FEF2F2] text-[#991B1B]",
        status === "DISCONNECTED" &&
          "bg-[var(--surface-2)] text-[var(--ink-mute)]",
      )}
    >
      <span
        className={cn(
          "w-[6px] h-[6px] rounded-full flex-shrink-0",
          status === "CONNECTED" && "bg-[#15803D]",
          status === "ERROR" && "bg-[#EF4444] animate-pulse",
          status === "DISCONNECTED" && "bg-[var(--ink-mute)]",
        )}
      />
      {status === "CONNECTED"
        ? "Connected"
        : status === "ERROR"
          ? "Error"
          : "Disconnected"}
    </span>
  );
}

// ── Toggle ─────────────────────────────────────────────────────────────────

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

// ── Step badge ─────────────────────────────────────────────────────────────

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

// ── Main view ──────────────────────────────────────────────────────────────

export function ChannelsView() {
  const { data: stateData } = useWAState();
  const { data: config } = useWAConfig();
  const disconnectMut = useWADisconnect();
  const updateConfigMut = useUpdateWAConfig();
  const { openSignup, isConnecting } = useWAEmbeddedSignup();

  const status: WAChannelStatus = stateData?.status ?? "DISCONNECTED";
  const phoneNumber = stateData?.phoneNumber;
  const errorMessage = stateData?.errorMessage;

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
                  ? phoneNumber
                  : "Connect via Meta Business"}
              </p>
            </div>
          </div>
          <StatusPill status={status} />
        </div>

        {/* Body */}
        <div className="p-5">
          {/* ── CONNECTED ───────────────────────────────────────────────── */}
          {status === "CONNECTED" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
                <div className="w-10 h-10 rounded-full bg-[#DCFCE7] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={20} className="text-[#15803D]" />
                </div>
                <div>
                  <p className="text-[13.5px] font-semibold text-[#15803D]">
                    WhatsApp Business is active
                  </p>
                  <p className="text-[12px] text-[#166534] mt-px">
                    {phoneNumber ??
                      "Your number is linked and receiving messages"}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => disconnectMut.mutate()}
                disabled={disconnectMut.isPending}
                className="self-start text-[12.5px] text-[#EF4444] border-[#FECACA] hover:bg-[#FEF2F2] hover:text-[#EF4444]"
              >
                {disconnectMut.isPending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Power size={13} />
                )}
                Disconnect
              </Button>
            </div>
          )}

          {/* ── ERROR ───────────────────────────────────────────────────── */}
          {status === "ERROR" && (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B]">
                <WifiOff size={14} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12.5px] font-semibold">
                    Connection error
                  </p>
                  <p className="text-[11.5px] mt-0.5 opacity-80 break-all">
                    {errorMessage ?? "An unexpected error occurred."}
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                onClick={openSignup}
                disabled={isConnecting}
                className="self-start px-6"
              >
                {isConnecting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ExternalLink size={14} />
                )}
                Reconnect via Meta
              </Button>
            </div>
          )}

          {/* ── DISCONNECTED ────────────────────────────────────────────── */}
          {status === "DISCONNECTED" && (
            <div className="flex flex-col items-center gap-5 py-4">
              {/* Illustration */}
              <div className="w-[200px] h-[180px] rounded-2xl border-2 border-dashed border-[var(--line)] bg-[var(--surface-2)] flex flex-col items-center justify-center gap-3">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(37,211,102,0.12)" }}
                >
                  <MessageCircle
                    size={30}
                    style={{ color: "#25D366" }}
                    fill="rgba(37,211,102,0.3)"
                  />
                </div>
                <p className="text-[12.5px] text-[var(--ink-mute)]">
                  Not connected
                </p>
              </div>

              {/* Explainer */}
              <div className="w-full space-y-2 bg-[var(--surface-2)] rounded-xl p-4">
                <p className="text-[12px] font-semibold text-[var(--ink-soft)] mb-3">
                  How to connect
                </p>
                <Step n={1} label="Click Connect via Meta below" />
                <Step
                  n={2}
                  label="Log in to your Facebook / Meta Business account"
                />
                <Step
                  n={3}
                  label="Select your WhatsApp Business account and phone number"
                />
                <Step
                  n={4}
                  label="Done — messages start flowing automatically"
                />
              </div>

              <p className="text-[12px] text-[var(--ink-mute)] text-center max-w-xs">
                Uses the official Meta WhatsApp Business API — no phone ban
                risk, fully TOS-compliant.
              </p>

              <Button
                id="wa-connect-btn"
                size="lg"
                onClick={openSignup}
                disabled={isConnecting}
                className="px-6"
              >
                {isConnecting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ExternalLink size={14} />
                )}
                {isConnecting ? "Connecting…" : "Connect via Meta"}
              </Button>

              <ManualConnect />
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
