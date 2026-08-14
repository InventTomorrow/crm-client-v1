import LegalLayout from "@/features/legal/components/LegalLayout";
import {
  LEGAL_LAST_UPDATED_ISO,
  LEGAL_LAST_UPDATED_LABEL,
  LEGAL_ROUTES,
} from "@/features/legal/constants";
import { DELETION_SECTIONS } from "@/features/legal/data/deletionContent";
import { JsonLd, breadcrumbSchema, webPageSchema } from "@/shared/seo/jsonLd";
import { buildPageMetadata } from "@/shared/seo/metadata";

const ROUTE = LEGAL_ROUTES[2];

export const metadata = buildPageMetadata({
  title: ROUTE.title,
  description: ROUTE.description,
  path: ROUTE.path,
  isPublic: true,
  ogType: "article",
  modifiedTime: LEGAL_LAST_UPDATED_ISO,
});

export default function DataDeletionPage() {
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
        title="User Data Deletion Instructions"
        subtitle="Complete guide for requesting data erasure, revoking Meta Facebook app authorizations, and purging CRM workspace records."
        badge="Meta & GDPR Compliance"
        lastUpdated={LEGAL_LAST_UPDATED_LABEL}
        sections={DELETION_SECTIONS}
      />
    </>
  );
}
