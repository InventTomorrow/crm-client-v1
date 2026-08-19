import { Mail, MessageCircle } from "lucide-react";
import Link from "next/link";
import Container from "../Container";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "../icons";
import Logo from "../Logo";
import NewsletterForm from "./NewsletterForm";

const SUPPORT_EMAIL = "support@asaanrabta.com";

const SOCIAL_LINKS = [
  {
    href: "https://www.instagram.com/asaanrabta/",
    label: "Instagram",
    Icon: InstagramIcon,
  },
  {
    href: "https://www.youtube.com/@AsaanRabta",
    label: "YouTube",
    Icon: YoutubeIcon,
  },
  {
    href: "https://www.facebook.com/people/Asaan-Rabta",
    label: "Facebook",
    Icon: FacebookIcon,
  },
];

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
    heading: "Company",
    links: [
      { href: "/#who-its-for", label: "Who it's for" },
      { href: "/#faq", label: "FAQ" },
      { href: "/auth/register", label: "Get started" },
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
];

export default function Footer() {
  return (
    <footer className="border-t border-brand-mint-2 bg-brand-mint-3 pt-16 pb-8">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div className="max-w-md">
            <Logo />
            <p className="mt-4 max-w-xs text-brand-text text-[14px]">
              WhatsApp sales, simplified. Turn every chat into a tracked lead,
              order, and follow-up without leaving WhatsApp.
            </p>
            <h3 className="mt-8 text-[14px] font-semibold text-brand-dark">
              Stay in the loop
            </h3>
            <NewsletterForm />
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_LINK_GROUPS.map((group) => (
              <nav key={group.heading} aria-label={group.heading}>
                <h3 className="text-[14px] font-semibold text-brand-dark">
                  {group.heading}
                </h3>
                <ul className="mt-4 space-y-2.5">
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
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="inline-flex items-center gap-2 text-brand-text text-[14px] transition-colors hover:text-brand-green"
                  >
                    <Mail className="size-4 text-brand-green" />
                    Email us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 text-brand-text text-[14px] transition-colors hover:text-brand-green"
                  >
                    <MessageCircle className="size-4 text-brand-green" />
                    Contact us
                  </Link>
                </li>
                {/* <li>
                  <Link
                    href="/#faq"
                    className="inline-flex items-center gap-2 text-brand-text text-[14px] transition-colors hover:text-brand-green"
                  >
                    <HelpCircle className="size-4 text-brand-green" />
                    Help centre
                  </Link>
                </li> */}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-14 flex flex-col-reverse items-center gap-6 border-t border-brand-mint-2 pt-6 sm:flex-row sm:justify-between">
          <p className="text-brand-text text-[13px]">
            © 2026 AsaanRabta. All rights reserved.
          </p>
          <ul className="flex items-center gap-3">
            {SOCIAL_LINKS.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-brand-mint-2 bg-white text-brand-text transition-colors hover:border-brand-green hover:bg-brand-green hover:text-white"
                >
                  <Icon className="size-[18px]" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
