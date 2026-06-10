"use client";
import {
  useWAConnect,
  useWADisconnect,
  useWAEventStream,
} from "@/features/channels/hooks/useWhatsApp";
import { cn } from "@/lib/utils";
import {
  Building2,
  CheckCircle2,
  Loader2,
  QrCode,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useOnboardingStatus, useSkipOnboarding } from "../hooks/useOnboarding";
import { OnboardingShell } from "./OnboardingShell";

// ── QR panel (inline for onboarding, not a modal) ───────────────────────────

function QRFrame({ src }: { src: string }) {
  return (
    <div className="relative flex items-center justify-center">
      <div className="relative w-[200px] h-[200px]">
        {(["tl", "tr", "bl", "br"] as const).map((pos) => (
          <span
            key={pos}
            className={cn(
              "absolute w-[20px] h-[20px] border-[#25D366]",
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
        <div className="absolute inset-[8px] rounded-lg overflow-hidden bg-white p-2 border border-[var(--line)]">
          <Image
            src={src}
            alt="WhatsApp QR code"
            width={180}
            height={180}
            unoptimized
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}

function QRPanel({ onSuccess }: { onSuccess: () => void }) {
  const { mutate: connectWA, isPending: isConnecting } = useWAConnect();
  const { mutate: disconnectWA } = useWADisconnect();
  const [streamActive, setStreamActive] = useState(false);
  const { qr, liveStatus, liveError } = useWAEventStream(streamActive);

  useEffect(() => {
    connectWA(undefined, {
      onSuccess: () => setStreamActive(true),
    });
    return () => setStreamActive(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (liveStatus === "CONNECTED") onSuccess();
  }, [liveStatus, onSuccess]);

  const handleRetry = () => {
    disconnectWA();
    setStreamActive(false);
    setTimeout(() => {
      connectWA(undefined, { onSuccess: () => setStreamActive(true) });
    }, 800);
  };

  if (liveStatus === "CONNECTED") {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="w-14 h-14 rounded-full bg-[rgba(37,211,102,0.12)] flex items-center justify-center">
          <CheckCircle2 size={28} className="text-[#25D366]" />
        </div>
        <p className="text-[14px] font-semibold text-[var(--ink)]">
          WhatsApp connected!
        </p>
        <p className="text-[12px] text-[var(--ink-mute)]">Redirecting…</p>
      </div>
    );
  }

  if (liveError) {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="w-12 h-12 rounded-full bg-[rgba(220,38,38,0.08)] flex items-center justify-center">
          <WifiOff size={22} className="text-[#DC2626]" />
        </div>
        <p className="text-[13px] text-[var(--ink)] text-center">{liveError}</p>
        <button className="btn btn-outline text-[13px]" onClick={handleRetry}>
          <RefreshCw size={13} /> Retry
        </button>
      </div>
    );
  }

  if (qr) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-[12px] text-[var(--ink-mute)] text-center">
          Open WhatsApp on your phone → <strong>Linked Devices</strong> →{" "}
          <strong>Link a Device</strong> → Scan QR
        </p>
        <QRFrame src={qr} />
        <p className="text-[11px] text-[var(--ink-mute)]">
          QR expires in ~60 seconds
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      {isConnecting || streamActive ? (
        <>
          <div className="w-[200px] h-[200px] rounded-xl border-2 border-dashed border-[var(--line)] flex flex-col items-center justify-center gap-3 bg-[var(--surface-2)]">
            <Loader2 size={24} className="animate-spin text-[#25D366]" />
            <p className="text-[12px] text-[var(--ink-mute)]">
              {isConnecting ? "Starting session…" : "Generating QR code…"}
            </p>
          </div>
        </>
      ) : (
        <div className="w-[200px] h-[200px] rounded-xl border-2 border-dashed border-[var(--line)] flex flex-col items-center justify-center gap-2 bg-[var(--surface-2)]">
          <QrCode size={28} className="text-[var(--ink-mute)] opacity-40" />
          <p className="text-[12px] text-[var(--ink-mute)]">Initialising…</p>
        </div>
      )}
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function ChannelView() {
  const [connecting, setConnecting] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const { data: status } = useOnboardingStatus();
  const { mutate: skip, isPending: isSkipping } = useSkipOnboarding();

  useEffect(() => {
    if (status?.workspaceName)
      setWorkspaceName((prev) => prev || status.workspaceName);
  }, [status?.workspaceName]);

  const handleConnected = () => {
    setTimeout(() => skip(), 1200);
  };

  return (
    <OnboardingShell currentStep="CHANNEL">
      <div className="mb-6 text-center">
        <h1 className="text-[22px] font-semibold text-[var(--ink)]">
          Connect your channel
        </h1>
        <p className="text-[13px] mt-1 text-[var(--ink-mute)]">
          Scan the QR code to link your WhatsApp
        </p>
      </div>

      <div className="card p-6 flex flex-col gap-5">
        {/* Workspace name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[var(--ink-soft)] flex items-center gap-1.5">
            <Building2 size={13} className="text-[var(--accent)]" /> Workspace
            name
          </label>
          <input
            className="input text-[13px]"
            placeholder="e.g. Acme Boutique"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
          />
          <p className="text-[11px] text-[var(--ink-mute)]">
            This is how your business appears across the app.
          </p>
        </div>

        {/* WhatsApp card */}
        {!connecting ? (
          <button
            type="button"
            onClick={() => setConnecting(true)}
            className="flex items-center gap-3.5 p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[#25D366] hover:bg-[rgba(37,211,102,0.04)] text-left transition-all"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(37,211,102,0.1)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M11.996 1.998C6.478 1.998 2 6.476 2 11.994c0 1.762.461 3.416 1.268 4.853L2 22l5.294-1.247a9.95 9.95 0 0 0 4.702 1.19c5.518 0 9.996-4.477 9.996-9.995 0-5.518-4.478-9.95-9.996-9.95zm0 18.19a8.187 8.187 0 0 1-4.18-1.148l-.3-.178-3.115.733.779-3.023-.196-.31A8.153 8.153 0 0 1 3.81 11.994c0-4.516 3.672-8.187 8.186-8.187s8.187 3.671 8.187 8.187c0 4.515-3.673 8.187-8.187 8.187z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-medium text-[var(--ink)]">
                WhatsApp
              </div>
              <p className="text-[12px] text-[var(--ink-mute)] mt-0.5">
                Connect via QR code scan — no API keys needed
              </p>
            </div>
          </button>
        ) : (
          <div className="border-t border-[var(--line)] pt-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[12.5px] font-medium text-[var(--ink-soft)] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#25D366] inline-block" />
                WhatsApp — Scan to connect
              </p>
              <button
                type="button"
                className="text-[12px] text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
                onClick={() => setConnecting(false)}
              >
                ← Back
              </button>
            </div>
            <QRPanel onSuccess={handleConnected} />
          </div>
        )}

        <button
          type="button"
          className="btn btn-outline w-full justify-center text-[13px] mt-1"
          onClick={() => skip()}
          disabled={isSkipping}
        >
          {isSkipping ? <Loader2 size={13} className="animate-spin" /> : null}
          Skip for now — set up later in Settings
        </button>
      </div>
    </OnboardingShell>
  );
}
