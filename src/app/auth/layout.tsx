import { Toaster } from "@/shared/ui/Sonner";
import type { Metadata } from "next";
import { AuthLayoutShell } from "@/features/auth/components/AuthLayoutShell";

export const metadata: Metadata = {
  title: "SaleFlow CRM — Auth",
  description: "Sign in or create your SaleFlow workspace",
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
          © {new Date().getFullYear()} SaleFlow CRM · All rights reserved
        </p>
      </AuthLayoutShell>
      <Toaster richColors position="top-right" />
    </>
  );
}
