import Link from "next/link";
import { MoveRight } from "lucide-react";
import type { BlogPostCard as BlogPostCardType } from "../types";
import BlogCard from "./BlogCard";

export default function RelatedPosts({ posts }: { posts: BlogPostCardType[] }) {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="related-articles" className="border-t border-brand-mint-2 pt-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2
          id="related-articles"
          className="text-[1.75rem] font-bold tracking-tight text-brand-dark sm:text-[2rem]"
        >
          Keep reading
        </h2>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-[15px] font-semibold text-brand-green transition-colors hover:text-brand-green-hover"
        >
          All articles <MoveRight className="size-4" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
