import ContactView from "@/features/contact/components/ContactView";
import { JsonLd, breadcrumbSchema, webPageSchema } from "@/shared/seo/jsonLd";
import { buildPageMetadata } from "@/shared/seo/metadata";

const TITLE = "Contact Us";
const DESCRIPTION =
  "Get help with AsaanRabta — setup, billing, or anything that isn't working. Send us a message and we reply within one business day.";

export const metadata = buildPageMetadata({
  title: `${TITLE} | AsaanRabta`,
  description: DESCRIPTION,
  path: "/contact",
  isPublic: true,
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        nodes={[
          webPageSchema({
            name: TITLE,
            description: DESCRIPTION,
            path: "/contact",
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: TITLE, path: "/contact" },
          ]),
        ]}
      />
      <ContactView />
    </>
  );
}
