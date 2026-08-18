import BlogCard from "@/features/blog/components/BlogCard";
import type { BlogPostCard } from "@/features/blog/types";
import { MoveRight } from "lucide-react";
import Link from "next/link";
import Container from "../Container";
import Reveal from "../Reveal";

/** Three across keeps each card wide enough for the title and excerpt to breathe. */
const LANDING_CARD_COUNT = 3;

/**
 * Renders from the build-time snapshot the blog API layer resolves, so the
 * landing page pays nothing at request time. Hidden entirely when empty.
 */
export default function LatestArticles({ posts }: { posts: BlogPostCard[] }) {
  if (posts.length === 0) return null;

  const visiblePosts = posts.slice(0, LANDING_CARD_COUNT);

  return (
    <section id="blog" className="scroll-mt-28 bg-white py-14 sm:py-20 md:py-24">
      <Container className="!max-w-[1360px]">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <Reveal
              as="h2"
              className="text-balance text-[2rem] font-bold leading-[1.12] tracking-tight text-brand-dark sm:text-[2.25rem] md:text-[2.75rem]"
            >
              WhatsApp sales, explained
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-4 text-base leading-relaxed text-brand-text md:text-[17px]">
                Practical guides on replying faster, running broadcasts, and
                turning WhatsApp chats into a pipeline you can actually work.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <Link
              href="/blog"
              className="inline-flex h-auto items-center gap-2 rounded-full bg-brand-green px-6 py-3 text-[15px] font-semibold text-white shadow-cta transition-all hover:-translate-y-0.5 hover:bg-brand-green-hover hover:shadow-cta-hover"
            >
              View all articles <MoveRight className="size-4" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {visiblePosts.map((post, index) => (
            <Reveal key={post.id} delay={index * 0.06} className="h-full">
              <BlogCard post={post} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
