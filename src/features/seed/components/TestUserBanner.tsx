"use client";
import { useMe } from "@/features/auth/hooks/useAuth";
import { FlaskConical } from "lucide-react";
import Link from "next/link";

export function TestUserBanner() {
  const { user } = useMe();
  if (!user?.isTester) return null;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 border-b border-dashed border-warning bg-warning-soft px-4 py-1.5 text-[12px] text-foreground"
    >
      <FlaskConical size={13} className="shrink-0 text-warning" />
      <span className="font-semibold">Test account</span>
      <span className="text-[var(--ink-soft)]">
        Everything here is for testing. Use the dashed seed buttons to add sample records.
      </span>
      <Link href="/settings/test-data" className="font-medium underline underline-offset-2">
        Test data
      </Link>
    </div>
  );
}
