import React from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { LegalSection } from "../components/LegalLayout";

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: "overview",
    title: "1. Overview & Data Controller",
    icon: "shield",
    summary: "Scope of privacy policy and our commitment to protecting your business data.",
    content: (
      <div className="space-y-3">
        <p>
          Welcome to <strong>AsaanRabta</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). AsaanRabta provides a specialized WhatsApp CRM, multi-agent inbox, lead classification engine, and AI-driven automated conversational sales platform operating at <strong>https://asaanrabta.com</strong>.
        </p>
        <p>
          This Privacy Policy explains how we collect, use, store, process, and safeguard your personal information, customer data, and connected messaging metadata when you access our platform, use our AI tools, or connect your messaging channels (including WhatsApp via QR Code / WebSockets or Meta Graph API).
        </p>
        <p className="bg-brand-mint-soft p-3.5 rounded-xl text-brand-dark font-medium border border-brand-green/20">
          By signing up for AsaanRabta, connecting a WhatsApp device, or authorizing Meta / Facebook App permissions, you acknowledge and agree to the data collection and processing practices described in this Policy.
        </p>
      </div>
    ),
  },
  {
    id: "information-collected",
    title: "2. Information We Collect",
    icon: "eye",
    summary: "Personal details, WhatsApp conversation logs, customer records, and system telemetry.",
    content: (
      <div className="space-y-3">
        <p>To provide our automated CRM and AI customer support service, we collect the following categories of information:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Account & Profile Data:</strong> Name, business email address, phone number, company name, password hash, subscription plan, and billing records.
          </li>
          <li>
            <strong>Connected WhatsApp Device Information:</strong> Connected phone numbers, session keys, connection status, device metadata, and QR connection tokens.
          </li>
          <li>
            <strong>Customer & Lead Data:</strong> Customer contact phone numbers, lead names, tags, status, notes, custom fields, and order histories submitted or synced into your CRM.
          </li>
          <li>
            <strong>Messages & Conversation Logs:</strong> Inbound and outbound WhatsApp text messages, voice notes, media attachments, and AI response logs processed to assist your team in customer service.
          </li>
          <li>
            <strong>Meta / Facebook Platform Permissions:</strong> If you connect via Meta OAuth / Facebook Login, we receive authorized account identifiers, Facebook Page tokens, and basic profile details as permitted by your scope selection.
          </li>
          <li>
            <strong>Usage & Technical Telemetry:</strong> Log files, IP address, browser type, device identifiers, app usage statistics, and cookies for session authentication.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "how-we-use-data",
    title: "3. How We Use Your Information",
    icon: "database",
    summary: "Purpose of data processing for AI response, order booking, and CRM operations.",
    content: (
      <div className="space-y-3">
        <p>We process your data strictly to operate, improve, and secure our CRM services. Specific processing purposes include:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80">
            <h4 className="font-bold text-brand-dark text-sm mb-1">AI Lead Classification & Auto-Reply</h4>
            <p className="text-sm text-brand-text">Analyzing customer intent, extracting order inquiries, and rendering automated 24/7 AI responses to your WhatsApp leads.</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80">
            <h4 className="font-bold text-brand-dark text-sm mb-1">Unified Multi-Agent Inbox</h4>
            <p className="text-sm text-brand-text">Routing inbound chats to team members, managing agent performance, tracking response times, and maintaining audit logs.</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80">
            <h4 className="font-bold text-brand-dark text-sm mb-1">Broadcasts & Order Booking</h4>
            <p className="text-sm text-brand-text">Executing customer broadcast campaigns, menu lookups, address collection, and invoice generation.</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80">
            <h4 className="font-bold text-brand-dark text-sm mb-1">Security & System Uptime</h4>
            <p className="text-sm text-brand-text">Detecting fraudulent activity, securing session tokens, preventing rate abuse, and maintaining high platform stability.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "meta-whatsapp-policy",
    title: "4. Meta Platform & WhatsApp Data Rights",
    icon: "share-2",
    summary: "Strict adherence to Meta Developer Policies and Meta Graph API data rules.",
    content: (
      <div className="space-y-3">
        <p>
          AsaanRabta integrates with Meta Platforms (including Facebook Login, WhatsApp Business APIs, and web socket session protocols). We strictly comply with Meta Platform Terms and Developer Policies:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>No Sale of Data:</strong> We do NOT sell, rent, or trade your personal data, customer contacts, or WhatsApp messages to any third-party ad networks or data brokers.</li>
          <li><strong>No Data Scraping:</strong> We do not engage in unauthorized harvesting of user contacts or non-permitted profiling.</li>
          <li><strong>Limited Sharing:</strong> Data is shared only with sub-processors essential for infrastructure (e.g. cloud database hosting, encrypted server nodes, and AI model runtimes) under strict non-disclosure obligations.</li>
          <li><strong>Meta App Permissions:</strong> Any permissions granted via Facebook Login or Meta Graph API are used solely for the functionality authorized by you.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "data-security",
    title: "5. Data Storage & Encryption",
    icon: "lock",
    summary: "Technical and organizational measures to safeguard your credentials and message data.",
    content: (
      <div className="space-y-3">
        <p>
          We employ industry-standard encryption and security protocols to safeguard your data both in transit and at rest:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>TLS/SSL 1.3 encryption for all web communications and API endpoints.</li>
          <li>Encrypted session key storage for WhatsApp web socket instances.</li>
          <li>Role-based access control (RBAC) ensuring only authorized account operators can access workspace leads.</li>
          <li>Automated security patch management and regular database backup integrity checks.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "data-retention-rights",
    title: "6. Retention, Export & Deletion Rights",
    icon: "user-check",
    summary: "Your right to access, export, or permanently erase your data at any time.",
    content: (
      <div className="space-y-3">
        <p>
          You retain full ownership of your data. You have the right to request access to, export, or complete erasure of your workspace records and customer database.
        </p>
        <p>
          To delete your account data or revoke Meta App authorizations, please visit our dedicated instruction page:
        </p>
        <div className="pt-1">
          <Link
            href="/data-deletion"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green text-white font-bold text-sm rounded-xl hover:bg-brand-green-hover transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            View Data Deletion Instructions →
          </Link>
        </div>
      </div>
    ),
  },
  {
    id: "privacy-contact",
    title: "7. Contact Compliance Team",
    icon: "mail",
    summary: "How to reach our Data Protection Officer for inquiries or privacy requests.",
    content: (
      <div className="space-y-3">
        <p>If you have any questions, privacy concerns, or data requests regarding this Privacy Policy, please reach out to our team:</p>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm space-y-1">
          <p className="font-bold text-brand-dark">AsaanRabta Privacy Compliance Team</p>
          <p className="text-brand-text">Website: <a href="https://asaanrabta.com" className="text-brand-green underline">https://asaanrabta.com</a></p>
          <p className="text-brand-text">Email: <a href="mailto:support@asaanrabta.com" className="text-brand-green underline">support@asaanrabta.com</a></p>
        </div>
      </div>
    ),
  },
];
