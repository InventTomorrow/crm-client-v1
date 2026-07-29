import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import LegalLayout from "@/features/legal/components/LegalLayout";
import { TERMS_SECTIONS } from "@/features/legal/data/termsContent";

export const metadata: Metadata = {
  title: "Terms of Service · AsaanRabta",
  description:
    "Read the Terms of Service governing the use of AsaanRabta WhatsApp CRM, AI agents, multi-inbox capabilities, and connection policies.",
  openGraph: {
    title: "Terms of Service · AsaanRabta",
    description:
      "Read the Terms of Service governing the use of AsaanRabta WhatsApp CRM, AI agents, multi-inbox capabilities, and connection policies.",
    url: "https://asaanrabta.com/terms",
  },
};

export default function TermsOfServicePage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Terms and conditions governing your subscription, platform access, AI agent usage, and WhatsApp connection protocols."
      badge="Legal Agreement"
      lastUpdated="July 29, 2026"
      activeTab="terms"
      sections={TERMS_SECTIONS}
      warningBanner={
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border-2 border-amber-400/80 rounded-2xl p-6 shadow-lg shadow-amber-500/5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-950 tracking-tight">
                IMPORTANT WHATSAPP QR CONNECTION & BAN DISCLAIMER
              </h2>
              <p className="text-xs text-amber-900/90 font-medium">
                No Uptime or Anti-Ban Guarantee for WhatsApp Accounts Connected via QR Code
              </p>
            </div>
          </div>
          <div className="text-xs text-amber-950/90 leading-relaxed space-y-2 border-t border-amber-300/60 pt-3">
            <p>
              AsaanRabta provides WhatsApp account linking features using QR code / web socket technology (Baileys protocol). WhatsApp (Meta Platforms, Inc.) enforces strict automated spam detection algorithms and policy rules.
            </p>
            <p className="font-bold text-amber-900 bg-amber-100/80 p-2.5 rounded-lg border border-amber-300">
              ⚠️ ASAANRABTA DOES NOT GUARANTEE THAT YOUR WHATSAPP ACCOUNT WILL NOT BE BANNED, SUSPENDED, OR RESTRICTED BY WHATSAPP. USERS CONNECT THEIR WHATSAPP ACCOUNTS VIA QR CODE AT THEIR OWN RISK AND DISCRETION. ASAANRABTA ASSUMES ZERO LIABILITY FOR BANNED NUMBERS OR BLOCKED MESSAGES.
            </p>
            <p className="text-[11px] text-amber-900/80">
              For full details on acceptable bulk messaging limits and best practices, please consult Section 2.0 of these Terms below.
            </p>
          </div>
        </div>
      }
    />
  );
}
