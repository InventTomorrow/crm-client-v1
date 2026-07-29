import React from "react";
import { ShieldAlert } from "lucide-react";
import { LegalSection } from "../components/LegalLayout";

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    icon: "file-text",
    summary: "Binding agreement between you and AsaanRabta governing platform usage.",
    content: (
      <div className="space-y-3">
        <p>
          These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User,&quot; &quot;Customer,&quot; or &quot;Subscriber&quot;) and <strong>AsaanRabta</strong> (&quot;Company,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), governing your access to and use of the AsaanRabta website at <strong>https://asaanrabta.com</strong>, dashboard, WhatsApp CRM, AI multi-agent software, and web applications.
        </p>
        <p>
          By creating an account, connecting a WhatsApp device, or subscribing to any of our plans, you represent that you have read, understood, and agreed to be bound by these Terms and our Privacy Policy.
        </p>
      </div>
    ),
  },
  {
    id: "whatsapp-qr-disclaimer",
    title: "2. IMPORTANT: WhatsApp & QR Code Connection Disclaimer (No Ban Guarantee)",
    icon: "alert-triangle",
    isWarning: true,
    summary: "Critical warning regarding WhatsApp account ban risks when connecting via QR code / web sessions.",
    content: (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-base text-amber-950">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
            <span>PLEASE READ CAREFULLY: NO GUARANTEE AGAINST WHATSAPP ACCOUNT BANS</span>
          </div>
          <p className="text-sm leading-relaxed font-medium">
            AsaanRabta provides WhatsApp integration capabilities utilizing Web Socket / QR Code connection protocols (such as Baileys technology) as well as Meta APIs. Connecting your WhatsApp account via QR Code or web session is done at your own risk.
          </p>
        </div>

        <ul className="list-disc pl-5 space-y-2.5 text-sm">
          <li>
            <strong>No Guarantee of Account Safety or Anti-Ban Protection:</strong> WhatsApp (Meta Platforms, Inc.) strictly monitors automated messaging and enforces anti-spam policies. <strong>AsaanRabta DOES NOT GUARANTEE that your WhatsApp number or account will not be restricted, temporarily suspended, or permanently banned by WhatsApp or Meta.</strong>
          </li>
          <li>
            <strong>Disclaimer of Liability for Banned Numbers:</strong> Under no circumstances shall AsaanRabta, its directors, developers, or affiliates be liable for any loss of WhatsApp numbers, banned accounts, lost customer messages, operational downtime, or business losses resulting from account restrictions imposed by Meta / WhatsApp.
          </li>
          <li>
            <strong>Sole User Responsibility:</strong> You acknowledge that you connect your WhatsApp number via QR code at your sole risk and discretion. You are solely responsible for ensuring that your message volume, messaging practices, and contact lists comply with Meta&apos;s WhatsApp Terms of Service and Anti-Spam Guidelines.
          </li>
          <li>
            <strong>Best Practices to Reduce Ban Risk:</strong> We strongly advise users to:
            <ul className="list-circle pl-5 pt-1 space-y-1 text-sm text-gray-600">
              <li>Use established WhatsApp Business numbers with prior conversation history rather than freshly registered SIM cards.</li>
              <li>Send broadcast messages only to customers who have explicitly opted in or initiated a conversation with your business.</li>
              <li>Avoid sending high-volume unsolicited promotional blasts, spam links, or repetitive bulk messages.</li>
              <li>Warm up new WhatsApp accounts gradually before increasing daily message throughput.</li>
            </ul>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "service-description",
    title: "3. Scope of Service & Platform Capabilities",
    icon: "check-square",
    summary: "Overview of CRM features, multi-agent routing, AI auto-replies, and ordering tools.",
    content: (
      <div className="space-y-3">
        <p>AsaanRabta grants subscribers a non-exclusive, non-transferable, revocable license to access our platform services, which include:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-sm">
          <li>Multi-agent unified inbox for managing WhatsApp, Instagram, and web lead conversations.</li>
          <li>AI-powered automated lead qualification, intent classification, and order booking agents.</li>
          <li>Lead management kanban, tag assignment, customer notes, and analytics dashboards.</li>
          <li>WhatsApp broadcast management and campaign tools (subject to WhatsApp rate limits).</li>
        </ul>
      </div>
    ),
  },
  {
    id: "acceptable-use",
    title: "4. User Conduct & Acceptable Use Policy",
    icon: "ban",
    summary: "Prohibited activities, spam restrictions, and compliance with anti-spam laws.",
    content: (
      <div className="space-y-3">
        <p>When using AsaanRabta, you agree NOT to engage in any of the following prohibited activities:</p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Sending unsolicited commercial spam, pyramid schemes, fraudulent offers, or deceptive claims via WhatsApp.</li>
          <li>Harassing, stalking, or threatening any individual or sending illegal, offensive, or hate speech content.</li>
          <li>Attempting to bypass platform security, reverse engineer software components, or overload server infrastructure.</li>
          <li>Selling, reselling, or sublicensing access to AsaanRabta without express written authorization.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "subscriptions-billing",
    title: "5. Subscriptions, Fees & Refunds",
    icon: "credit-card",
    summary: "Subscription cycles, renewal terms, cancellations, and non-refundable plan policies.",
    content: (
      <div className="space-y-3">
        <p>
          Services are billed on a recurring subscription basis (monthly or annually) according to your selected plan.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><strong>Billing & Renewal:</strong> Subscriptions automatically renew at the end of each billing period unless cancelled prior to the renewal date.</li>
          <li><strong>Cancellations:</strong> You can cancel your subscription at any time through your dashboard settings. Cancellation takes effect at the conclusion of the current prepaid billing period.</li>
          <li><strong>Refund Policy:</strong> Unless required by law, subscription fees are non-refundable once billed due to server provisioning and API compute costs incurred.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "limitation-liability",
    title: "6. Limitation of Liability & Warranty Disclaimer",
    icon: "scale",
    summary: "Service provided 'AS IS' with capped maximum financial liability.",
    content: (
      <div className="space-y-3">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, ASAANRABTA AND ITS PROVIDERS DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-sm text-brand-dark font-medium">
          IN NO EVENT SHALL ASAANRABTA BE LIABLE FOR INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES, OR FOR LOSS OF PROFITS, DATA, GOODWILL, OR WHATSAPP ACCOUNT ACCESS, REGARDLESS OF THE THEORY OF LIABILITY.
        </p>
      </div>
    ),
  },
  {
    id: "modifications-law",
    title: "7. Modifications to Terms & Governing Law",
    icon: "refresh-cw",
    summary: "Right to update terms and governing legal jurisdiction.",
    content: (
      <div className="space-y-3">
        <p>
          We reserve the right to amend or update these Terms at any time by posting the updated version on <strong>https://asaanrabta.com/terms</strong>. Your continued use of the platform after updates signifies your acceptance of the revised Terms.
        </p>
        <p>
          These Terms shall be governed by and construed in accordance with the applicable laws of Pakistan, without regard to its conflict of law principles.
        </p>
      </div>
    ),
  },
];
