import {
  BLOG_PAGE_SIZE,
  fetchBlogCategories,
  fetchBlogPosts,
} from "@/features/blog/blog.api";
import BlogListing from "@/features/blog/components/BlogListing";
import { JsonLd, blogSchema, breadcrumbSchema } from "@/shared/seo/jsonLd";
import { buildPageMetadata } from "@/shared/seo/metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_DESCRIPTION, BLOG_TITLE } from "../../page";

export const revalidate = 900;
export const dynamicParams = true;

export async function generateStaticParams() {
  const categories = await fetchBlogCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await fetchBlogCategories();
  const category = categories.find((entry) => entry.slug === slug);
  if (!category) {
    return buildPageMetadata({ title: "Category not found", description: "", path: `/blog/category/${slug}` });
  }

  return buildPageMetadata({
    title: `${category.name} — ${BLOG_TITLE} | AsaanRabta`,
    description: category.description ?? BLOG_DESCRIPTION,
    path: `/blog/category/${category.slug}`,
    isPublic: true,
  });
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [categories, firstPage] = await Promise.all([
    fetchBlogCategories(),
    fetchBlogPosts({ limit: BLOG_PAGE_SIZE, category: slug }),
  ]);

  const category = categories.find((entry) => entry.slug === slug);
  if (!category) notFound();

  return (
    <>
      <JsonLd
        nodes={[
          blogSchema({
            name: `${category.name} — ${BLOG_TITLE}`,
            description: category.description ?? BLOG_DESCRIPTION,
            path: `/blog/category/${category.slug}`,
            posts: firstPage.items.map((post) => ({ title: post.title, slug: post.slug })),
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: category.name, path: `/blog/category/${category.slug}` },
          ]),
        ]}
      />
      <BlogListing
        eyebrow="AsaanRabta Blog"
        heading={category.name}
        description={category.description ?? BLOG_DESCRIPTION}
        categories={categories}
        firstPage={firstPage}
        activeCategory={category.slug}
        emptyMessage="Nothing published in this category yet."
      />
    </>
  );
}
