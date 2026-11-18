"use client";
import { AlertCircle, Handshake, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAffiliateInvitePreview } from "../../hooks/useAffiliateJoin";
import { AffiliateJoinForm } from "./AffiliateJoinForm";

const UNUSABLE_LINK_COPY = {
  NOT_FOUND: {
    title: "This link isn't valid",
    body: "It may have been used already or replaced by a newer one. Ask us for a fresh link.",
  },
  EXPIRED: {
    title: "This link has expired",
    body: "Join links last 7 days. Ask us to send you a new one.",
  },
} as const;

function UnusableLink({ title, body }: { title: string; body: string }) {
  return (
    <div className="card flex items-start gap-3 border-[var(--destructive)]/30 bg-[var(--destructive-soft)] p-6">
      <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-[var(--destructive)]" />
      <div>
        <div className="text-[13.5px] font-medium text-[var(--ink)]">{title}</div>
        <div className="mt-0.5 text-[12px] text-[var(--ink-mute)]">{body}</div>
        <Link href="/auth/login" className="mt-2 inline-block text-[12px] font-medium text-[var(--accent)] hover:underline">
          Already joined? Sign in
        </Link>
      </div>
    </div>
  );
}

export function AffiliateJoinView() {
  const token = useSearchParams().get("token") ?? "";
  const { data: invite, isLoading, isError } = useAffiliateInvitePreview(token);

  if (!token || isError) return <UnusableLink {...UNUSABLE_LINK_COPY.NOT_FOUND} />;

  if (isLoading || !invite) {
    return (
      <div className="card flex items-center justify-center gap-2.5 p-8 text-[var(--ink-mute)]">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-[13px]">Checking your link…</span>
      </div>
    );
  }

  if (invite.status !== "VALID") return <UnusableLink {...UNUSABLE_LINK_COPY[invite.status]} />;

  return (
    <div className="card flex flex-col gap-5 p-8 shadow-[var(--shadow-2)]">
      <div>
        <h1 className="text-[22px] font-semibold text-[var(--ink)]">
          {invite.method === "SIGNUP" ? "Create your affiliate account" : "Set your password"}
        </h1>
        <p className="mt-1 text-[13px] text-[var(--ink-mute)]">
          Track your referral codes, sign-ups and commission. No business workspace needed.
        </p>
      </div>

      <div className="flex items-start gap-2.5 rounded-lg border border-[var(--accent)]/25 bg-[var(--accent-soft)] px-3.5 py-3">
        <Handshake size={16} className="mt-0.5 flex-shrink-0 text-[var(--accent)]" />
        <div className="text-[12.5px] leading-snug text-[var(--ink-soft)]">
          Joining the affiliate programme as <strong className="text-[var(--ink)]">{invite.name}</strong>
          <div className="mt-0.5 text-[11.5px] text-[var(--ink-mute)]">{invite.email}</div>
        </div>
      </div>

      <AffiliateJoinForm token={token} invite={invite} />

      <p className="text-center text-[11.5px] text-[var(--ink-mute)]">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-[var(--accent)] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
