import Link from "next/link";
import type { Metadata } from "next";

// No robots key on purpose — Next injects noindex on not-found itself.
export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist or has been moved.",
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--bg)] text-[var(--ink)] px-4 text-center">
      <p className="text-sm font-semibold text-[var(--ink-mute)]">404</p>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-sm text-[var(--ink-mute)] max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-[var(--ink)] px-5 py-2 text-sm font-semibold text-[var(--bg)]"
      >
        Back to home
      </Link>
    </main>
  );
}
