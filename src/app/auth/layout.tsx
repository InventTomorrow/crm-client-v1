import { Toaster } from "@/shared/ui/Sonner";
import type { Metadata } from "next";
import { AuthLayoutShell } from "@/features/auth/components/AuthLayoutShell";
import { PRIVATE_PAGE_ROBOTS } from "@/shared/seo/metadata";

export const metadata: Metadata = {
  title: "Auth",
  description: "Sign in or create your AsaanRabta workspace",
  robots: PRIVATE_PAGE_ROBOTS,
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthLayoutShell>
        {children}
        <p className="mt-8 text-[11px] text-[var(--ink-mute)] text-center">
          © {new Date().getFullYear()} AsaanRabta · All rights reserved
        </p>
      </AuthLayoutShell>
      <Toaster richColors position="top-right" />
    </>
  );
}
