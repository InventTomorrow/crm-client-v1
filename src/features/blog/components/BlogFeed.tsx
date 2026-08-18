"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { BLOG_PAGE_SIZE } from "../blog.api";
import type { BlogPostCard as BlogPostCardType, BlogPostsPage } from "../types";
import BlogCard from "./BlogCard";

type BlogFeedProps = {
  initialPage: BlogPostsPage;
  category?: string;
  tag?: string;
};

/**
 * Server-rendered first page, then cursor pagination from the browser. Requests
 * go through the app's own /api/v1 rewrite, so there is no cross-origin hop.
 */
export default function BlogFeed({ initialPage, category, tag }: BlogFeedProps) {
  const [posts, setPosts] = useState<BlogPostCardType[]>(initialPage.items);
  const [cursor, setCursor] = useState<string | null>(initialPage.nextCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const loadMore = async () => {
    if (!cursor || isLoading) return;
    setIsLoading(true);
    setHasFailed(false);

    const query = new URLSearchParams({ cursor, limit: String(BLOG_PAGE_SIZE) });
    if (category) query.set("category", category);
    if (tag) query.set("tag", tag);

    try {
      const response = await fetch(`/api/v1/public/blog/posts?${query.toString()}`);
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      const payload = (await response.json()) as { data: BlogPostsPage };
      setPosts((current) => [...current, ...payload.data.items]);
      setCursor(payload.data.nextCursor);
    } catch {
      setHasFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <BlogCard key={post.id} post={post} priority={index === 0} />
        ))}
      </div>

      {cursor && (
        <div className="mt-12 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoading}
            className="inline-flex h-auto items-center gap-2 rounded-full border border-brand-mint-2 bg-white px-7 py-3 text-[15px] font-semibold text-brand-dark transition-all hover:-translate-y-0.5 hover:border-brand-green/40 hover:text-brand-green disabled:pointer-events-none disabled:opacity-60"
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {isLoading ? "Loading…" : "Load more articles"}
          </button>
          {hasFailed && (
            <p className="text-[13px] text-brand-text-soft">
              Could not load more right now. Please try again.
            </p>
          )}
        </div>
      )}
    </>
  );
}
