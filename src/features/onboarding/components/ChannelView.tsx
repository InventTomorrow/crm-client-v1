"use client";
import { useWAEmbeddedSignup, useWAState } from "@/features/channels/hooks/useWhatsApp";
import { Button } from "@/shared/ui/Button";
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useSkipOnboarding } from "../hooks/useOnboarding";
import { OnboardingShell } from "./OnboardingShell";

export function ChannelView() {
  const { mutate: skip, isPending: isSkipping } = useSkipOnboarding();
  const { data: stateData } = useWAState();
  const { openSignup, isConnecting } = useWAEmbeddedSignup();

  const status = stateData?.status ?? "DISCONNECTED";
  const phoneNumber = stateData?.phoneNumber;

  // Auto-advance onboarding once connection is confirmed
  useEffect(() => {
    if (status === "CONNECTED") {
      setTimeout(() => skip(), 1500);
    }
  }, [status, skip]);

  return (
    <OnboardingShell currentStep="CHANNEL">
      <div className="mb-6 text-center">
        <h1 className="text-[22px] font-semibold text-[var(--ink)]">
          Connect your channel
        </h1>
        <p className="text-[13px] mt-1 text-[var(--ink-mute)]">
          Link your WhatsApp Business number via Meta
        </p>
      </div>

      <div className="card p-6 flex flex-col gap-5">
        {status === "CONNECTED" ? (
          /* Success state */
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-14 h-14 rounded-full bg-[rgba(37,211,102,0.12)] flex items-center justify-center">
              <CheckCircle2 size={28} className="text-[#25D366]" />
            </div>
            <p className="text-[14px] font-semibold text-[var(--ink)]">
              WhatsApp Business connected!
            </p>
            {phoneNumber && (
              <p className="text-[12px] text-[var(--ink-mute)]">{phoneNumber}</p>
            )}
            <p className="text-[12px] text-[var(--ink-mute)]">Redirecting…</p>
          </div>
        ) : (
          /* Connect prompt */
          <>
            {/* WhatsApp channel button */}
            <button
              type="button"
              id="onboarding-wa-connect-btn"
              onClick={openSignup}
              disabled={isConnecting}
              className="flex items-center gap-3.5 p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[#25D366] hover:bg-[rgba(37,211,102,0.04)] text-left transition-all"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(37,211,102,0.1)" }}
              >
                {isConnecting ? (
                  <Loader2 size={18} className="animate-spin text-[#25D366]" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M11.996 1.998C6.478 1.998 2 6.476 2 11.994c0 1.762.461 3.416 1.268 4.853L2 22l5.294-1.247a9.95 9.95 0 0 0 4.702 1.19c5.518 0 9.996-4.477 9.996-9.995 0-5.518-4.478-9.95-9.996-9.95zm0 18.19a8.187 8.187 0 0 1-4.18-1.148l-.3-.178-3.115.733.779-3.023-.196-.31A8.153 8.153 0 0 1 3.81 11.994c0-4.516 3.672-8.187 8.186-8.187s8.187 3.671 8.187 8.187c0 4.515-3.673 8.187-8.187 8.187z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-medium text-[var(--ink)] flex items-center gap-2">
                  WhatsApp Business
                  <ExternalLink size={12} className="text-[var(--ink-mute)]" />
                </div>
                <p className="text-[12px] text-[var(--ink-mute)] mt-0.5">
                  {isConnecting
                    ? "Opening Meta login…"
                    : "Connect via Meta Embedded Signup — official API"}
                </p>
              </div>
            </button>

            <Button
              type="button"
              variant="outline"
              className="w-full justify-center text-[13px] mt-1"
              onClick={() => skip()}
              disabled={isSkipping}
            >
              {isSkipping ? <Loader2 size={13} className="animate-spin" /> : null}
              Skip for now — set up later in Channels
            </Button>
          </>
        )}
      </div>
    </OnboardingShell>
  );
}
