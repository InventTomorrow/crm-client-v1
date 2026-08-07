import Link from "next/link";
import { Mail } from "lucide-react";
import Container from "../Container";
import Logo from "../Logo";

const SUPPORT_EMAIL = "support@asaanrabta.com";

const FOOTER_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#who-its-for", label: "Who it's for" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/data-deletion", label: "Data Deletion" },
];

export default function Footer() {
  return (
    <footer className="py-12 border-t border-gray-100 bg-white">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo />
          <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[14px]">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-brand-text transition-colors hover:text-brand-green"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 flex justify-center">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center gap-2 text-[14px] text-brand-text transition-colors hover:text-brand-green"
          >
            <Mail className="size-4" aria-hidden="true" />
            {SUPPORT_EMAIL}
          </a>
        </div>
        <p className="mt-8 text-center text-brand-text text-[14px]">
          © 2026 AsaanRabta. WhatsApp sales, simplified.
        </p>
      </Container>
    </footer>
  );
}
