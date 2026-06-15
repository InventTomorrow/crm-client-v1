"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AcceptInviteVisualPanel,
  ForgotPasswordVisualPanel,
  LoginVisualPanel,
  RegisterVisualPanel,
  ResetPasswordVisualPanel,
} from "./AuthVisualPanels";

/* ── Brand Mark Component ── */
function BrandMark() {
  return (
    <Link
      href="/"
      className="flex items-center no-underline"
      aria-label="AsaanRabta"
    >
      <Image
        src="/asaanrabta-logo.png"
        alt="AsaanRabta"
        width={220}
        height={72}
        priority
        className="h-16 w-auto"
      />
    </Link>
  );
}

/* ── Contextual Top Right Link based on Route ── */
function HeaderActionLink({ pathname }: { pathname: string }) {
  if (pathname.includes("/auth/login")) {
    return (
      <Link
        href="/auth/register"
        className="text-[13px] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
      >
        Don&apos;t have an account?{" "}
        <span className="text-[var(--accent)] font-medium">Sign up</span>
      </Link>
    );
  }
  if (
    pathname.includes("/auth/register") ||
    pathname.includes("/auth/accept-invite")
  ) {
    return (
      <Link
        href="/auth/login"
        className="text-[13px] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
      >
        Already have an account?{" "}
        <span className="text-[var(--accent)] font-medium">Sign in</span>
      </Link>
    );
  }
  return null;
}

/* ── MAIN SHELL COMPONENT ── */
export function AuthLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";

  const headerLink = <HeaderActionLink pathname={pathname} />;

  let VisualPanel = LoginVisualPanel;
  if (pathname.includes("/auth/register")) {
    VisualPanel = RegisterVisualPanel;
  } else if (pathname.includes("/auth/forgot-password")) {
    VisualPanel = ForgotPasswordVisualPanel;
  } else if (pathname.includes("/auth/reset-password")) {
    VisualPanel = ResetPasswordVisualPanel;
  } else if (pathname.includes("/auth/accept-invite")) {
    VisualPanel = AcceptInviteVisualPanel;
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left: Form Pane ── */}
      <section className="relative flex flex-col w-full lg:w-1/2 bg-[var(--surface)] overflow-y-auto min-h-screen">
        {/* Top Header Row */}
        <div className="flex items-center justify-between px-8 py-5 flex-shrink-0">
          <BrandMark />
          {headerLink}
        </div>

        {/* Centered Children View */}
        <div className="flex flex-col justify-center items-center flex-1 px-8 py-8 lg:py-10">
          {children}
        </div>
      </section>

      {/* ── Right: Visual Pane ── */}
      <aside className="hidden lg:flex flex-1 relative overflow-hidden bg-[linear-gradient(135deg,#0F7A40_0%,#23A75B_100%)] min-h-screen">
        {/* Static decorative depth — no animation */}
        <span className="absolute w-[300px] h-[300px] rounded-full bg-white/20 blur-[50px] -top-16 -right-12 pointer-events-none" />
        <span className="absolute w-[220px] h-[220px] rounded-full bg-white/12 blur-[50px] top-[42%] -left-16 pointer-events-none" />
        <span className="absolute w-[180px] h-[180px] rounded-full bg-[rgba(37,211,102,0.28)] blur-[50px] bottom-[20%] right-[8%] pointer-events-none" />
        <VisualPanel />
      </aside>
    </div>
  );
}
