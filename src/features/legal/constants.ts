export const LEGAL_LAST_UPDATED_ISO = "2026-07-29";
export const LEGAL_LAST_UPDATED_LABEL = "July 29, 2026";

export interface LegalRoute {
  path: string;
  title: string;
  description: string;
}

// Drives sitemap entries, page metadata, and breadcrumb JSON-LD for the legal docs.
export const LEGAL_ROUTES: LegalRoute[] = [
  {
    path: "/privacy-policy",
    title: "Privacy Policy",
    description:
      "Learn how AsaanRabta collects, uses, and safeguards your business data, customer contacts, and WhatsApp messaging metadata in full compliance with Meta Platform Policies.",
  },
  {
    path: "/terms",
    title: "Terms of Service",
    description:
      "Read the Terms of Service governing the use of AsaanRabta WhatsApp CRM, AI agents, multi-inbox capabilities, and connection policies.",
  },
  {
    path: "/data-deletion",
    title: "User Data Deletion Instructions",
    description:
      "Step-by-step instructions for deleting your account, personal data, and Facebook/Meta app permissions from AsaanRabta in compliance with Meta policy.",
  },
];
