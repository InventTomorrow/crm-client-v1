import Container from "@/features/landing/components/Container";
import Logo from "@/features/landing/components/Logo";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  CheckSquare,
  Clock,
  CreditCard,
  Database,
  Eye,
  FileText,
  Lock,
  Mail,
  RefreshCw,
  Scale,
  Share2,
  Shield,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

// Icons are referenced by name so section data can cross the server → client boundary
const SECTION_ICONS = {
  "alert-triangle": AlertTriangle,
  ban: Ban,
  "check-square": CheckSquare,
  clock: Clock,
  "credit-card": CreditCard,
  database: Database,
  eye: Eye,
  "file-text": FileText,
  lock: Lock,
  mail: Mail,
  "refresh-cw": RefreshCw,
  scale: Scale,
  "share-2": Share2,
  shield: Shield,
  "shield-check": ShieldCheck,
  smartphone: Smartphone,
  "trash-2": Trash2,
  "user-check": UserCheck,
} satisfies Record<string, LucideIcon>;

export type LegalSectionIconName = keyof typeof SECTION_ICONS;

export interface LegalSection {
  id: string;
  title: string;
  icon?: LegalSectionIconName;
  summary?: string;
  content: React.ReactNode;
  isWarning?: boolean;
}

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  badge: string;
  lastUpdated: string;
  sections: LegalSection[];
  warningBanner?: React.ReactNode;
}

export default function LegalLayout({
  title,
  subtitle,
  badge,
  lastUpdated,
  sections,
  warningBanner,
}: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-brand-dark flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-gray-100/80 shadow-xs">
        <Container>
          <div className="flex items-center justify-between h-20">
            <Link
              href="/"
              className="flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group"
              aria-label="Return to Home"
            >
              <div className="w-9 h-9 rounded-full bg-brand-mint-soft flex items-center justify-center group-hover:bg-brand-green group-hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <Logo />
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-brand-dark hover:text-brand-green transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white bg-brand-green rounded-full shadow-cta hover:bg-brand-green-hover transition-all hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </Container>
      </header>

      {/* Hero */}
      <section className="relative py-14 md:py-20 overflow-hidden border-b border-gray-100 hero-bg">
        <Container>
          <div className="max-w-5xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-mint-soft text-brand-green text-sm font-bold border border-brand-green/20">
              <span>{badge}</span>
              <span className="w-1 h-1 rounded-full bg-brand-green/40" />
              <span className="text-brand-text font-medium">
                Last updated: {lastUpdated}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-dark tracking-tight leading-tight">
              {title}
            </h1>

            <p className="text-base sm:text-lg text-brand-text max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          </div>
        </Container>
      </section>

      {/* Document Content */}
      <main className="flex-1 py-14 md:py-16">
        <Container>
          <div className="max-w-5xl mx-auto space-y-14">
            {warningBanner && <div>{warningBanner}</div>}

            {sections.map((sec, idx) => {
              const SectionIcon = sec.icon ? SECTION_ICONS[sec.icon] : FileText;

              return (
                <section key={sec.id} id={sec.id} className="scroll-mt-28">
                  <div className="flex items-start gap-4 mb-5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        sec.isWarning
                          ? "bg-amber-100 text-amber-700"
                          : "bg-brand-mint-soft text-brand-green"
                      }`}
                    >
                      <SectionIcon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-bold text-brand-dark tracking-tight">
                          {sec.title}
                        </h2>
                        {sec.isWarning && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-3.5 h-3.5" /> Warning &
                            Risk Alert
                          </span>
                        )}
                      </div>
                      {sec.summary && (
                        <p className="text-sm text-brand-text leading-relaxed">
                          {sec.summary}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-base text-brand-text leading-relaxed space-y-5">
                    {sec.content}
                  </div>

                  {idx < sections.length - 1 && (
                    <div className="mt-14 border-b border-gray-100" />
                  )}
                </section>
              );
            })}

            {/* Contact */}
            <section className="p-8 rounded-2xl bg-gradient-to-br from-brand-dark to-brand-dark/90 text-white space-y-3">
              <div className="flex items-center gap-2 text-lg font-bold">
                <Shield className="w-5 h-5 text-brand-green" />
                <span>Have Legal Questions?</span>
              </div>
              <p className="text-gray-300 text-base leading-relaxed max-w-2xl">
                Our compliance team is here to assist with data privacy,
                compliance, and terms inquiry.
              </p>
              <button
                type="button"
                disabled
                title="Support email coming soon"
                className="inline-flex items-center gap-1 text-base font-bold text-brand-leaf opacity-50 cursor-not-allowed"
              >
                Contact Support →
              </button>
            </section>
          </div>
        </Container>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 bg-white">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo />
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold">
              <Link
                href="/"
                className="text-brand-text hover:text-brand-green transition-colors"
              >
                Home
              </Link>
              <Link
                href="/privacy-policy"
                className="text-brand-text hover:text-brand-green transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-brand-text hover:text-brand-green transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/data-deletion"
                className="text-brand-text hover:text-brand-green transition-colors"
              >
                Data Deletion Instructions
              </Link>
              <Link
                href="/auth/login"
                className="text-brand-text hover:text-brand-green transition-colors"
              >
                Login
              </Link>
            </nav>
          </div>
          <p className="mt-8 text-center text-brand-text text-sm">
            © 2026 AsaanRabta. All rights reserved. WhatsApp CRM & AI
            Automation.
          </p>
        </Container>
      </footer>
    </div>
  );
}
