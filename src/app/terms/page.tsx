import LegalLayout from "@/features/legal/components/LegalLayout";
import {
  LEGAL_LAST_UPDATED_ISO,
  LEGAL_LAST_UPDATED_LABEL,
  LEGAL_ROUTES,
} from "@/features/legal/constants";
import { TERMS_SECTIONS } from "@/features/legal/data/termsContent";
import { JsonLd, breadcrumbSchema, webPageSchema } from "@/shared/seo/jsonLd";
import { buildPageMetadata } from "@/shared/seo/metadata";

const ROUTE = LEGAL_ROUTES[1];

export const metadata = buildPageMetadata({
  title: ROUTE.title,
  description: ROUTE.description,
  path: ROUTE.path,
  isPublic: true,
  ogType: "article",
  modifiedTime: LEGAL_LAST_UPDATED_ISO,
});

export default function TermsOfServicePage() {
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
        title="Terms of Service"
        subtitle="Terms and conditions governing your subscription, platform access, AI agent usage, and WhatsApp connection protocols."
        badge="Legal Agreement"
        lastUpdated={LEGAL_LAST_UPDATED_LABEL}
        sections={TERMS_SECTIONS}
      />
    </>
  );
}
