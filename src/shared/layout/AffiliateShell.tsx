"use client";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { useAppStore } from "@/lib/appStore";
import { Button } from "@/shared/ui/Button";
import { Toaster } from "@/shared/ui/Sonner";
import { Building2, LogOut, Moon, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/** Chrome for an affiliate who has no workspace: no CRM navigation, just their dashboard. */
export function AffiliateShell({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useAppStore();
  const logout = useLogout();

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)]">
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--surface)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Image
              src="/asaanrabta-icon.png"
              alt="AsaanRabta"
              width={40}
              height={40}
              priority
              className="h-9 w-9 shrink-0 rounded-[10px] sm:h-10 sm:w-10"
            />
            <span className="font-[var(--font-head)] text-[17px] font-bold tracking-[-0.02em] text-[var(--ink)] sm:text-[18px]">
              Asaan<span className="text-[var(--accent)]">Rabta</span>
            </span>
            <span className="hidden text-[13px] text-[var(--ink-mute)] sm:inline">Affiliate</span>
          </Link>

          <div className="flex items-center gap-1.5">
            <Button asChild variant="outline" size="sm">
              <Link href="/onboarding/workspace">
                <Building2 />
                <span className="hidden sm:inline">Create a workspace</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun /> : <Moon />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              aria-label="Sign out"
            >
              <LogOut />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">{children}</main>
      <Toaster richColors position="top-right" closeButton theme="system" />
    </div>
  );
}
