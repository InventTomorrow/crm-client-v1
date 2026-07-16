import { Button } from "@/shared/ui/Button";
import { Compass, Home } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GoBackButton } from "./GoBackButton";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist or has moved.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[var(--bg)] px-6 py-16 text-center">
      <Image
        src="/asaanrabta-logo.png"
        alt="AsaanRabta"
        width={895}
        height={290}
        priority
        className="h-9 w-auto"
      />

      <div className="flex flex-col items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-2)]">
          <Compass size={28} className="text-[var(--ink-mute)]" />
        </div>

        <div className="space-y-1.5">
          <p className="font-(--font-mono) text-sm font-semibold tracking-[0.2em] text-primary">
            404
          </p>
          <h1 className="text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
            Page not found
          </h1>
          <p className="max-w-sm text-sm text-[var(--ink-mute)]">
            The page you&apos;re looking for doesn&apos;t exist, may have
            moved, or the link might be broken.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <GoBackButton />
        <Button asChild>
          <Link href="/dashboard">
            <Home size={14} />
            Back to dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
