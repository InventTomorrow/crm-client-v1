import { Mail } from "lucide-react";
import Link from "next/link";
import Container from "../Container";
import Logo from "../Logo";

const FOOTER_LINK_GROUPS = [
  {
    heading: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#pricing", label: "Pricing" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/data-deletion", label: "Data Deletion" },
    ],
  },
  {
    heading: "Account",
    links: [{ href: "/auth/login", label: "Login" }],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-brand-mint-2 bg-brand-mint-3 py-14">
      <Container>
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-brand-text text-[14px]">
              WhatsApp sales, simplified.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_LINK_GROUPS.map((group) => (
              <nav key={group.heading} aria-label={group.heading}>
                <h3 className="text-[14px] font-semibold text-brand-dark">
                  {group.heading}
                </h3>
                <ul className="mt-4 space-y-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-brand-text text-[14px] transition-colors hover:text-brand-green"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <nav aria-label="Support">
              <h3 className="text-[14px] font-semibold text-brand-dark">
                Support
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="mailto:support@asaanrabta.com"
                    className="inline-flex items-center gap-2 text-brand-text text-[14px] transition-colors hover:text-brand-green"
                  >
                    <Mail className="size-4 text-brand-green" />
                    Contact Support
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        <p className="mt-10 border-t border-brand-mint-2 pt-6 text-center text-brand-text text-[14px]">
          © 2026 AsaanRabta. WhatsApp sales, simplified.
        </p>
      </Container>
    </footer>
  );
}
