import type { BlogPostCard, BlogPostDetail } from "./types";

/** "12 August 2026" — unambiguous for both PK and international readers. */
export function formatPublishedDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function blogPostPath(slug: string): string {
  return `/blog/${slug}`;
}

export function blogCategoryPath(slug: string): string {
  return `/blog/category/${slug}`;
}

/** Tags are free text ("whatsapp crm"), so URLs carry a slug of them. */
export function tagSlug(tag: string): string {
  return tag.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function blogTagPath(tag: string): string {
  return `/blog/tag/${tagSlug(tag)}`;
}

/** SEO title falls back to the post title; the same for description and excerpt. */
export function postMetaTitle(post: BlogPostDetail): string {
  return post.seoTitle?.trim() || post.title;
}

export function postMetaDescription(post: BlogPostCard & { seoDescription?: string | null }): string {
  return post.seoDescription?.trim() || post.excerpt;
}

/**
 * Deterministic accent per post, so a card without a cover image still looks
 * designed rather than blank — and keeps the same colour on every render.
 */
const COVER_GRADIENTS = [
  "from-brand-green/20 via-brand-mint to-brand-leaf/30",
  "from-brand-leaf/25 via-brand-mint-3 to-brand-green/20",
  "from-brand-mint-2 via-brand-mint to-brand-leaf-2/40",
  "from-brand-green/15 via-brand-mint-soft to-brand-mint-2",
];

export function coverGradient(slug: string): string {
  const seed = [...slug].reduce((total, char) => total + char.charCodeAt(0), 0);
  return COVER_GRADIENTS[seed % COVER_GRADIENTS.length];
}
