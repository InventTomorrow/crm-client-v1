import {
  BLOG_PAGE_SIZE,
  fetchBlogCategories,
  fetchBlogPosts,
  fetchBlogTags,
} from "@/features/blog/blog.api";
import { tagSlug } from "@/features/blog/blog.utils";
import BlogListing from "@/features/blog/components/BlogListing";
import { JsonLd, breadcrumbSchema } from "@/shared/seo/jsonLd";
import { buildPageMetadata } from "@/shared/seo/metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_DESCRIPTION, BLOG_TITLE } from "../../page";

export const revalidate = 900;
export const dynamicParams = true;

/** Resolves a URL slug back to the raw tag the API filters on. */
async function resolveTag(slug: string): Promise<string | null> {
  const tags = await fetchBlogTags();
  return tags.find((entry) => tagSlug(entry.tag) === slug)?.tag ?? null;
}

export async function generateStaticParams() {
  const tags = await fetchBlogTags();
  return tags.map((entry) => ({ tag: tagSlug(entry.tag) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag: slug } = await params;
  const tag = await resolveTag(slug);

  // Tag views slice the same articles the category pages already index, so they
  // are crawlable but kept out of the index to avoid thin duplicates.
  return {
    ...buildPageMetadata({
      title: `Articles on ${tag ?? slug} — ${BLOG_TITLE}`,
      description: BLOG_DESCRIPTION,
      path: `/blog/tag/${slug}`,
    }),
    robots: { index: false, follow: true },
  };
}

export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: slug } = await params;
  const tag = await resolveTag(slug);
  if (!tag) notFound();

  const [categories, firstPage] = await Promise.all([
    fetchBlogCategories(),
    fetchBlogPosts({ limit: BLOG_PAGE_SIZE, tag }),
  ]);

  return (
    <>
      <JsonLd
        nodes={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: tag, path: `/blog/tag/${slug}` },
          ]),
        ]}
      />
      <BlogListing
        eyebrow="Tagged"
        heading={tag}
        description={`Every article tagged “${tag}”.`}
        categories={categories}
        firstPage={firstPage}
        activeTag={tag}
        emptyMessage="Nothing tagged this yet."
      />
    </>
  );
}
