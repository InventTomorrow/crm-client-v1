import AffiliateApplicationView from "@/features/affiliate/components/apply/AffiliateApplicationView";
import { JsonLd, breadcrumbSchema, webPageSchema } from "@/shared/seo/jsonLd";
import { buildPageMetadata } from "@/shared/seo/metadata";

const TITLE = "Affiliate Programme";
const DESCRIPTION =
  "Recommend AsaanRabta to businesses you know, give them a discount, and earn commission on their first payment.";

export const metadata = buildPageMetadata({
  title: `${TITLE} | AsaanRabta`,
  description: DESCRIPTION,
  path: "/affiliate-program",
  isPublic: true,
});

export default function AffiliateProgramPage() {
  return (
    <>
      <JsonLd
        nodes={[
          webPageSchema({ name: TITLE, description: DESCRIPTION, path: "/affiliate-program" }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: TITLE, path: "/affiliate-program" },
          ]),
        ]}
      />
      <AffiliateApplicationView />
    </>
  );
}
