import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  SOCIAL_LINKS,
  SUPPORT_EMAIL,
  absoluteUrl,
} from "@/shared/lib/site";

type JsonLdNode = Record<string, unknown>;

const ORGANIZATION_ID = absoluteUrl("/#organization");
const WEBSITE_ID = absoluteUrl("/#website");

export function organizationSchema(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/asaanrabta-logo.png"),
      width: 880,
      height: 288,
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: SUPPORT_EMAIL,
      contactType: "customer support",
      availableLanguage: ["en", "ur"],
    },
    ...(SOCIAL_LINKS.length ? { sameAs: SOCIAL_LINKS } : {}),
  };
}

export function webSiteSchema(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function softwareApplicationSchema(): JsonLdNode {
  return {
    "@type": "SoftwareApplication",
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Customer Relationship Management",
    operatingSystem: "Web",
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    featureList: [
      "AI auto-replies in Urdu and English",
      "Shared team inbox for WhatsApp",
      "Lead CRM pipeline",
      "WhatsApp broadcast campaigns",
      "Excel/CSV lead import",
      "Multiple WhatsApp numbers in one dashboard",
    ],
    offers: {
      "@type": "Offer",
      price: "2999",
      priceCurrency: "PKR",
      url: absoluteUrl("/#pricing"),
      availability: "https://schema.org/InStock",
    },
  };
}

export function breadcrumbSchema(
  trail: Array<{ name: string; path: string }>,
): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function faqSchema(
  entries: Array<{ question: string; answer: string }>,
): JsonLdNode {
  return {
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}

export function webPageSchema({
  name,
  description,
  path,
  dateModified,
}: {
  name: string;
  description: string;
  path: string;
  dateModified?: string;
}): JsonLdNode {
  return {
    "@type": "WebPage",
    "@id": `${absoluteUrl(path)}#webpage`,
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: { "@id": WEBSITE_ID },
    inLanguage: "en",
    ...(dateModified ? { dateModified } : {}),
  };
}

/** A single article. `image` is omitted rather than faked when a post has no cover. */
export function blogPostingSchema({
  title,
  description,
  path,
  datePublished,
  dateModified,
  authorName,
  imageUrl,
  section,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  datePublished: string | null;
  dateModified: string;
  authorName: string;
  imageUrl?: string | null;
  section?: string;
  keywords?: string[];
}): JsonLdNode {
  return {
    "@type": "BlogPosting",
    "@id": `${absoluteUrl(path)}#article`,
    headline: title,
    description,
    url: absoluteUrl(path),
    mainEntityOfPage: { "@id": `${absoluteUrl(path)}#webpage` },
    ...(datePublished ? { datePublished } : {}),
    dateModified,
    author: { "@type": "Organization", name: authorName, url: SITE_URL },
    publisher: { "@id": ORGANIZATION_ID },
    isPartOf: { "@id": WEBSITE_ID },
    inLanguage: "en",
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(section ? { articleSection: section } : {}),
    ...(keywords?.length ? { keywords: keywords.join(", ") } : {}),
  };
}

/** The blog index itself, listing the posts currently on the first page. */
export function blogSchema({
  name,
  description,
  path,
  posts,
}: {
  name: string;
  description: string;
  path: string;
  posts: Array<{ title: string; slug: string }>;
}): JsonLdNode {
  return {
    "@type": "Blog",
    "@id": `${absoluteUrl(path)}#blog`,
    name,
    description,
    url: absoluteUrl(path),
    publisher: { "@id": ORGANIZATION_ID },
    isPartOf: { "@id": WEBSITE_ID },
    inLanguage: "en",
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: absoluteUrl(`/blog/${post.slug}`),
    })),
  };
}

// Renders schema.org nodes as one @graph script tag; "<" is escaped to block script injection.
export function JsonLd({ nodes }: { nodes: JsonLdNode[] }) {
  const json = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": nodes,
  }).replace(/</g, "\\u003c");

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}
