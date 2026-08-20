import { fetchBlogPost, fetchBlogSlugs } from "@/features/blog/blog.api";
import { blogTagPath, postMetaDescription, postMetaTitle } from "@/features/blog/blog.utils";
import ArticleBody from "@/features/blog/components/ArticleBody";
import ArticleHeader from "@/features/blog/components/ArticleHeader";
import RelatedPosts from "@/features/blog/components/RelatedPosts";
import ShareRow from "@/features/blog/components/ShareRow";
import TableOfContents from "@/features/blog/components/TableOfContents";
import Container from "@/features/landing/components/Container";
import { PrimaryCta } from "@/features/landing/components/LandingCta";
import { SITE_LOCALE, SITE_NAME, absoluteUrl } from "@/shared/lib/site";
import {
  JsonLd,
  blogPostingSchema,
  breadcrumbSchema,
  webPageSchema,
} from "@/shared/seo/jsonLd";
import { buildPageMetadata } from "@/shared/seo/metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 3600;
/** Posts published after the last build are rendered on first request, then cached. */
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await fetchBlogSlugs();
  return slugs.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchBlogPost(slug);
  if (!result) return buildPageMetadata({ title: "Article not found", description: "", path: `/blog/${slug}` });

  const { post } = result;
  const metadata = buildPageMetadata({
    title: postMetaTitle(post),
    description: postMetaDescription(post),
    path: `/blog/${post.slug}`,
    isPublic: true,
    ogType: "article",
    modifiedTime: post.updatedAt,
    keywords: post.tags,
  });

  return {
    ...metadata,
    openGraph: {
      type: "article",
      title: postMetaTitle(post),
      description: postMetaDescription(post),
      url: absoluteUrl(`/blog/${post.slug}`),
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      modifiedTime: post.updatedAt,
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
      authors: [post.authorName],
      section: post.category.name,
      tags: post.tags,
      ...(post.coverImageUrl ? { images: [{ url: post.coverImageUrl }] } : {}),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await fetchBlogPost(slug);
  if (!result) notFound();

  const { post, related } = result;
  const canonicalUrl = absoluteUrl(`/blog/${post.slug}`);
  const toc = post.toc ?? [];

  return (
    <main className="pb-20 pt-10 sm:pt-14">
      <JsonLd
        nodes={[
          webPageSchema({
            name: postMetaTitle(post),
            description: postMetaDescription(post),
            path: `/blog/${post.slug}`,
            dateModified: post.updatedAt,
          }),
          blogPostingSchema({
            title: post.title,
            description: postMetaDescription(post),
            path: `/blog/${post.slug}`,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            authorName: post.authorName,
            imageUrl: post.coverImageUrl,
            section: post.category.name,
            keywords: post.tags,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />

      <Container>
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-12 xl:grid-cols-[minmax(0,1fr)_240px]">
          <article className="min-w-0 max-w-3xl">
            <ArticleHeader post={post} />
            <ArticleBody html={post.bodyHtml} />

            {post.tags.length > 0 && (
              <div className="mt-12 flex flex-wrap items-center gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={blogTagPath(tag)}
                    className="rounded-full border border-brand-mint-2 px-3.5 py-1.5 text-[13px] text-brand-text transition-colors hover:border-brand-green/40 hover:text-brand-green"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-8 border-t border-brand-mint-2 pt-6">
              <ShareRow url={canonicalUrl} title={post.title} />
            </div>

            <aside className="mt-12 rounded-3xl bg-brand-mint px-7 py-9 sm:px-10">
              <h2 className="text-balance text-[1.6rem] font-bold leading-tight tracking-tight text-brand-dark">
                Stop losing WhatsApp leads to slow replies
              </h2>
              <p className="mt-3 max-w-lg text-[15.5px] leading-relaxed text-brand-text">
                AsaanRabta gives your team one shared WhatsApp inbox, a lead
                pipeline, and AI replies in Urdu and English.
              </p>
              <PrimaryCta signedInTarget="dashboard" className="mt-6 inline-flex h-auto rounded-full bg-brand-green px-6 py-3 text-[15px] font-semibold text-white shadow-cta transition-all hover:-translate-y-0.5 hover:bg-brand-green-hover hover:shadow-cta-hover">
                Get started free
              </PrimaryCta>
            </aside>
          </article>

          {toc.length > 0 && (
            <div className="hidden xl:block">
              <div className="sticky top-28">
                <TableOfContents entries={toc} />
              </div>
            </div>
          )}
        </div>

        <div className="mx-auto mt-20 max-w-[1100px]">
          <RelatedPosts posts={related} />
        </div>
      </Container>
    </main>
  );
}
