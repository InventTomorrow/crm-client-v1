import LegalLayout from "@/features/legal/components/LegalLayout";
import {
  LEGAL_LAST_UPDATED_ISO,
  LEGAL_LAST_UPDATED_LABEL,
  LEGAL_ROUTES,
} from "@/features/legal/constants";
import { PRIVACY_SECTIONS } from "@/features/legal/data/privacyContent";
import { JsonLd, breadcrumbSchema, webPageSchema } from "@/shared/seo/jsonLd";
import { buildPageMetadata } from "@/shared/seo/metadata";

const ROUTE = LEGAL_ROUTES[0];

export const metadata = buildPageMetadata({
  title: ROUTE.title,
  description: ROUTE.description,
  path: ROUTE.path,
  isPublic: true,
  ogType: "article",
  modifiedTime: LEGAL_LAST_UPDATED_ISO,
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <JsonLd
        nodes={[
          webPageSchema({
            name: ROUTE.title,
            description: ROUTE.description,
            path: ROUTE.path,
            dateModified: LEGAL_LAST_UPDATED_ISO,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: ROUTE.title, path: ROUTE.path },
          ]),
        ]}
      />
      <LegalLayout
        title="Privacy Policy"
        subtitle="Transparent data privacy, Meta Graph API standards, and security safeguards for your WhatsApp CRM and customer contacts."
        badge="Privacy & Trust"
        lastUpdated={LEGAL_LAST_UPDATED_LABEL}
        sections={PRIVACY_SECTIONS}
      />
    </>
  );
}
