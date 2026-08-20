import Image from "next/image";
import Link from "next/link";
import {
  blogPostPath,
  coverGradient,
  formatPublishedDate,
} from "../blog.utils";
import type { BlogPostCard as BlogPostCardType } from "../types";

type BlogCardProps = {
  post: BlogPostCardType;
  /** The first card on the listing page carries the LCP image. */
  priority?: boolean;
};

export default function BlogCard({ post, priority = false }: BlogCardProps) {
  return (
    <article className="group h-full">
      <Link
        href={blogPostPath(post.slug)}
        className="flex h-full flex-col overflow-hidden rounded-3xl border border-brand-mint-2 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-green/30 hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-mint">
          {post.coverImageUrl ? (
            <Image
              src={post.coverImageUrl}
              alt={post.coverImageAlt ?? post.title}
              fill
              priority={priority}
              loading="eager"
              sizes="(max-width: 1000px) 100vw, (max-width: 1024px) 50vw, 440px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${coverGradient(post.slug)}`}
            >
              <span className="px-6 text-center text-[13px] font-semibold uppercase tracking-[0.18em] text-brand-dark/45">
                {post.category.name}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[12px] font-medium text-brand-green">
            <span>{post.category.name}</span>
            <span className="size-1 rounded-full bg-brand-leaf" aria-hidden />
            <span className="text-brand-text-soft">
              {post.readingMinutes} min read
            </span>
          </div>

          <h3 className="mt-3 text-balance text-[20px] font-semibold leading-snug tracking-tight text-brand-dark transition-colors group-hover:text-brand-green">
            {post.title}
          </h3>

          <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-brand-text">
            {post.excerpt}
          </p>

          <div className="mt-5 flex items-center gap-2 border-t border-brand-mint-2 pt-4 text-[13px] text-brand-text-soft">
            <span className="font-medium text-brand-dark/70">
              {post.authorName}
            </span>
            {post.publishedAt && (
              <>
                <span
                  className="size-1 rounded-full bg-brand-mint-2"
                  aria-hidden
                />
                <time dateTime={post.publishedAt}>
                  {formatPublishedDate(post.publishedAt)}
                </time>
              </>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
