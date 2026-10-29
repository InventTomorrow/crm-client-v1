import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
] as const;

/** Slim bar under every CRM page. Hidden on phones, where the dock owns the bottom edge. */
export function AppFooter() {
  return (
    <footer className="hidden h-9 shrink-0 items-center justify-between gap-3 border-t border-[var(--line)] bg-[var(--surface)] px-4 text-[12px] text-[var(--ink-mute)] md:flex">
      <span>© {new Date().getFullYear()} AsaanRabta</span>
      <nav aria-label="Footer" className="flex items-center gap-4">
        {FOOTER_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[var(--ink)]"
          >
            {label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
