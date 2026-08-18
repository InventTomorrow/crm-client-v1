import featuredSnapshot from "./generated/featured-posts.json";
import type {
  BlogCategoryWithCount,
  BlogPostCard,
  BlogPostDetail,
  BlogPostSlug,
  BlogPostsPage,
} from "./types";

/**
 * Server-side data access for the public blog. Every response is cached at the
 * fetch layer, so a marketing page never waits on the API twice.
 */

/** Articles change rarely — an hour of staleness is a fair trade for speed. */
const ARTICLE_REVALIDATE_SECONDS = 3600;
/** The listing feed moves more often than a single article. */
const FEED_REVALIDATE_SECONDS = 900;

export const BLOG_PAGE_SIZE = 9;

function apiOrigin(): string | null {
  const url = process.env.NEXT_PUBLIC_API_URL;
  return url ? url.replace(/\/+$/, "") : null;
}

/** Never let a blog fetch take a marketing page down — callers get a fallback instead. */
async function fetchBlog<T>(
  path: string,
  revalidate: number,
  fallback: T,
): Promise<T> {
  const origin = apiOrigin();
  if (!origin) return fallback;

  try {
    const response = await fetch(`${origin}/api/v1/public/blog${path}`, {
      next: { revalidate, tags: ["blog"] },
    });
    if (!response.ok) return fallback;
    const payload = (await response.json()) as { data?: T };
    return payload.data ?? fallback;
  } catch {
    return fallback;
  }
}

export function fetchBlogPosts(params: {
  cursor?: string;
  limit?: number;
  category?: string;
  tag?: string;
}): Promise<BlogPostsPage> {
  const query = new URLSearchParams({
    limit: String(params.limit ?? BLOG_PAGE_SIZE),
  });
  if (params.cursor) query.set("cursor", params.cursor);
  if (params.category) query.set("category", params.category);
  if (params.tag) query.set("tag", params.tag);

  return fetchBlog<BlogPostsPage>(
    `/posts?${query.toString()}`,
    FEED_REVALIDATE_SECONDS,
    { items: [], nextCursor: null },
  );
}

export async function fetchBlogPost(
  slug: string,
): Promise<{ post: BlogPostDetail; related: BlogPostCard[] } | null> {
  return fetchBlog<{ post: BlogPostDetail; related: BlogPostCard[] } | null>(
    `/posts/${encodeURIComponent(slug)}`,
    ARTICLE_REVALIDATE_SECONDS,
    null,
  );
}

export function fetchBlogCategories(): Promise<BlogCategoryWithCount[]> {
  return fetchBlog<BlogCategoryWithCount[]>(
    "/categories",
    FEED_REVALIDATE_SECONDS,
    [],
  );
}

export function fetchBlogTags(): Promise<{ tag: string; postCount: number }[]> {
  return fetchBlog<{ tag: string; postCount: number }[]>(
    "/tags",
    FEED_REVALIDATE_SECONDS,
    [],
  );
}

export function fetchBlogSlugs(): Promise<BlogPostSlug[]> {
  return fetchBlog<BlogPostSlug[]>("/slugs", FEED_REVALIDATE_SECONDS, []);
}

/**
 * Featured posts for the landing page. The API is the source of truth so an
 * admin edit shows up on the next revalidation (or immediately, via
 * /api/revalidate); the snapshot written at build time is only a fallback for
 * when the API is unreachable.
 */
export async function fetchFeaturedPosts(limit = 3): Promise<BlogPostCard[]> {
  const fetched = await fetchBlog<BlogPostCard[]>(
    `/featured?limit=${limit}`,
    FEED_REVALIDATE_SECONDS,
    [],
  );
  if (fetched.length > 0) return fetched.slice(0, limit);

  const snapshot = featuredSnapshot as BlogPostCard[];
  return snapshot.slice(0, limit);
}
