import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  blogCategoryPath,
  coverGradient,
  formatPublishedDate,
} from "../blog.utils";
import type { BlogPostDetail } from "../types";

export default function ArticleHeader({ post }: { post: BlogPostDetail }) {
  return (
    <header>
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-[13px] text-brand-text-soft"
      >
        <Link href="/" className="transition-colors hover:text-brand-green">
          Home
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <Link href="/blog" className="transition-colors hover:text-brand-green">
          Blog
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="text-brand-dark/70">{post.category.name}</span>
      </nav>

      <Link
        href={blogCategoryPath(post.category.slug)}
        className="mt-6 inline-flex items-center rounded-full bg-brand-mint px-3.5 py-1.5 text-[13px] font-semibold text-brand-green transition-colors hover:bg-brand-mint-2"
      >
        {post.category.name}
      </Link>

      <h1 className="mt-4 text-balance text-[2rem] font-bold leading-[1.14] tracking-tight text-brand-dark sm:text-[2.5rem] lg:text-[3rem]">
        {post.title}
      </h1>

      <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-brand-text">
        {post.excerpt}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-brand-text-soft">
        <span className="font-medium text-brand-dark">{post.authorName}</span>
        {post.publishedAt && (
          <>
            <span className="size-1 rounded-full bg-brand-mint-2" aria-hidden />
            <time dateTime={post.publishedAt}>{formatPublishedDate(post.publishedAt)}</time>
          </>
        )}
        <span className="size-1 rounded-full bg-brand-mint-2" aria-hidden />
        <span>{post.readingMinutes} min read</span>
      </div>

      {post.coverImageUrl ? (
        /* Sized from the file itself, so the cover is shown whole and never
           cropped. The width/height pair only reserves space until it loads. */
        <Image
          src={post.coverImageUrl}
          alt={post.coverImageAlt ?? post.title}
          width={1600}
          height={900}
          priority
          sizes="(max-width: 1024px) 100vw, 900px"
          className="mt-9 h-auto w-full rounded-3xl border border-brand-mint-2 bg-brand-mint object-contain"
        />
      ) : (
        <div className="relative mt-9 aspect-[16/8] w-full overflow-hidden rounded-3xl border border-brand-mint-2 bg-brand-mint">
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${coverGradient(post.slug)}`}
          >
            <span className="px-8 text-center text-sm font-semibold uppercase tracking-[0.2em] text-brand-dark/40">
              {post.category.name}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
