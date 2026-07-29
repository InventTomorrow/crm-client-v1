import React from "react";
import Link from "next/link";
import { Share2, ShieldCheck } from "lucide-react";
import { LegalSection } from "../components/LegalLayout";

export const DELETION_SECTIONS: LegalSection[] = [
  {
    id: "deletion-overview",
    title: "1. Data Deletion Policy & Meta Compliance",
    icon: "trash-2",
    defaultOpen: true,
    summary: "Our commitment to data erasure, GDPR compliance, and Meta Data Deletion callback support.",
    content: (
      <div className="space-y-3">
        <p>
          At <strong>AsaanRabta</strong>, we respect your privacy and provide full control over your personal information, connected business data, and messaging account authorizations.
        </p>
        <p>
          In compliance with Meta Platform Terms, General Data Protection Regulation (GDPR), and global privacy standards, this document provides step-by-step instructions on how you can delete your data from AsaanRabta or revoke Facebook / Meta App permissions at any time.
        </p>
        <div className="p-3.5 bg-brand-mint-soft rounded-xl border border-brand-green/20 text-xs text-brand-dark flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Meta Facebook App Review Data Deletion Instructions:</strong>
            <span>If you signed in or linked your account via Meta / Facebook Login, you can request immediate removal of all associated data using Option 1, Option 2, or Option 3 below.</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "option-1-in-app",
    title: "2. Option 1: Instant In-App Data & Account Deletion (Self-Service)",
    icon: "smartphone",
    defaultOpen: true,
    summary: "Delete your workspace, customer contacts, and session data directly from the AsaanRabta dashboard.",
    content: (
      <div className="space-y-3">
        <p>You can instantly initiate the deletion of your account and all associated customer data directly from your dashboard:</p>
        <ol className="list-decimal pl-5 space-y-2 text-xs">
          <li>Log into your account at <a href="https://asaanrabta.com/auth/login" className="text-brand-green font-semibold underline">https://asaanrabta.com/auth/login</a>.</li>
          <li>Navigate to <strong>Settings</strong> from the main navigation sidebar (or top menu).</li>
          <li>Select the <strong>Account & Security</strong> tab.</li>
          <li>Scroll down to the <strong>Danger Zone</strong> section.</li>
          <li>Click <strong>&quot;Delete Account & Erase All Workspace Data&quot;</strong>.</li>
          <li>Confirm your deletion request by entering your password or verification code.</li>
        </ol>
        <p className="text-xs text-brand-text italic pt-1">
          Once confirmed, your active sessions, connected WhatsApp device tokens, customer chats, and leads will be permanently soft-deleted immediately and queued for complete purge.
        </p>
      </div>
    ),
  },
  {
    id: "option-2-meta-facebook",
    title: "3. Option 2: Revoking Meta / Facebook App Access & Data Deletion Callback",
    icon: "share-2",
    defaultOpen: true,
    summary: "How to remove AsaanRabta from your Facebook Settings and request automatic Meta data deletion.",
    content: (
      <div className="space-y-3">
        <p>If you authorized AsaanRabta using Facebook Login or Meta Graph API, you can revoke access and trigger Meta Data Deletion callback by following these steps:</p>
        
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-brand-dark">
            <Share2 className="w-4 h-4 text-blue-600" />
            <span>Steps to Remove AsaanRabta on Facebook:</span>
          </div>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Log into your Facebook account associated with AsaanRabta.</li>
            <li>Go to <strong>Settings & Privacy</strong> → <strong>Settings</strong>.</li>
            <li>In the left sidebar menu, select <strong>Apps and Websites</strong>.</li>
            <li>Find <strong>AsaanRabta</strong> in the list of active apps and click <strong>Remove</strong>.</li>
            <li>Check the box to delete all posts, videos, or events published by the app (if applicable) and click <strong>Remove</strong>.</li>
            <li>Click <strong>View Removed Apps and Websites</strong>.</li>
            <li>Beside AsaanRabta, click <strong>Send Request</strong> to trigger the automated Data Deletion Callback URL.</li>
          </ol>
        </div>

        <p className="text-xs text-brand-text">
          Upon receiving the automated Meta Data Deletion callback, our system validates the Facebook User ID and purges all linked tokens and profile metadata associated with that ID within 24 hours.
        </p>
      </div>
    ),
  },
  {
    id: "option-3-email-request",
    title: "4. Option 3: Manual Deletion Request via Email",
    icon: "mail",
    defaultOpen: true,
    summary: "Submit a written data removal request to our compliance team.",
    content: (
      <div className="space-y-3">
        <p>If you prefer to submit a manual deletion request, you can send an email directly to our Data Protection Officer:</p>
        
        <div className="p-4 bg-brand-mint-soft/50 rounded-xl border border-brand-green/30 space-y-2 text-xs">
          <p><strong>Email Address:</strong> <a href="mailto:support@asaanrabta.com" className="text-brand-green font-bold underline">support@asaanrabta.com</a> or <a href="mailto:privacy@asaanrabta.com" className="text-brand-green font-bold underline">privacy@asaanrabta.com</a></p>
          <p><strong>Subject Line:</strong> Data Deletion Request - [Your Registered Email or Phone]</p>
          <p><strong>Required Information:</strong> Please provide your registered account email, connected WhatsApp number, or business name so we can identify your records.</p>
        </div>

        <p className="text-xs text-brand-text">
          Manual email requests are acknowledged within 24 business hours and fully processed within 7 business days.
        </p>
      </div>
    ),
  },
  {
    id: "deletion-timeline",
    title: "5. Processing Timeline & Data Purge Guarantee",
    icon: "clock",
    defaultOpen: false,
    summary: "What happens to your data after a deletion request is initiated.",
    content: (
      <div className="space-y-3">
        <p>Here is what happens to your data following a confirmed deletion request:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-[11px] font-mono font-bold text-brand-green">STAGE 1</span>
            <h4 className="font-bold text-brand-dark text-xs mt-1 mb-1">Immediate Disconnection (0-24 Hours)</h4>
            <p className="text-xs text-brand-text">WhatsApp QR session keys, access tokens, and active logins are revoked immediately.</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-[11px] font-mono font-bold text-brand-green">STAGE 2</span>
            <h4 className="font-bold text-brand-dark text-xs mt-1 mb-1">Database Soft Purge (1-7 Days)</h4>
            <p className="text-xs text-brand-text">Leads, message logs, AI chat history, and customer records are anonymized and removed from active CRM databases.</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-[11px] font-mono font-bold text-brand-green">STAGE 3</span>
            <h4 className="font-bold text-brand-dark text-xs mt-1 mb-1">Complete Backup Purge (30 Days)</h4>
            <p className="text-xs text-brand-text">Encrypted system backups rotate and permanently erase all residual encrypted fragments.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "legal-retention-exceptions",
    title: "6. Mandatory Legal Retention Exceptions",
    icon: "shield-check",
    defaultOpen: false,
    summary: "Records retained solely to comply with tax, invoice, and statutory legal requirements.",
    content: (
      <div className="space-y-3">
        <p>
          In accordance with statutory legal requirements, financial regulations, and tax compliance laws, certain non-messaging transactional data cannot be erased immediately:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-brand-text">
          <li>Paid invoice records, payment receipt IDs, and transaction amounts (retained for statutory audit periods).</li>
          <li>Fraud prevention audit logs associated with blocked or abused accounts.</li>
        </ul>
        <p className="text-xs text-brand-text pt-1">
          These retained records are isolated, encrypted, and accessible solely to authorized financial audit personnel.
        </p>
      </div>
    ),
  },
];
