import {
  BLOG_PAGE_SIZE,
  fetchBlogCategories,
  fetchBlogPosts,
} from "@/features/blog/blog.api";
import BlogListing from "@/features/blog/components/BlogListing";
import { JsonLd, blogSchema, breadcrumbSchema } from "@/shared/seo/jsonLd";
import { buildPageMetadata } from "@/shared/seo/metadata";

export const BLOG_TITLE = "WhatsApp Sales & CRM Blog";
export const BLOG_DESCRIPTION =
  "Practical guides for WhatsApp-first businesses in Pakistan — replying faster, running broadcasts that work, and turning chats into a sales pipeline.";

export const revalidate = 900;

export const metadata = buildPageMetadata({
  title: `${BLOG_TITLE} | AsaanRabta`,
  description: BLOG_DESCRIPTION,
  path: "/blog",
  isPublic: true,
  keywords: [
    "WhatsApp CRM blog",
    "WhatsApp marketing Pakistan",
    "WhatsApp broadcast guide",
    "lead management tips",
  ],
});

export default async function BlogIndexPage() {
  const [firstPage, categories] = await Promise.all([
    fetchBlogPosts({ limit: BLOG_PAGE_SIZE }),
    fetchBlogCategories(),
  ]);

  return (
    <>
      <JsonLd
        nodes={[
          blogSchema({
            name: BLOG_TITLE,
            description: BLOG_DESCRIPTION,
            path: "/blog",
            posts: firstPage.items.map((post) => ({ title: post.title, slug: post.slug })),
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        ]}
      />
      <BlogListing
        eyebrow="AsaanRabta Blog"
        heading="WhatsApp sales, explained"
        description={BLOG_DESCRIPTION}
        categories={categories}
        firstPage={firstPage}
        emptyMessage="No articles published yet — check back shortly."
      />
    </>
  );
}
