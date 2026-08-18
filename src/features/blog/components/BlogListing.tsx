import Container from "@/features/landing/components/Container";
import type { BlogCategoryWithCount, BlogPostsPage } from "../types";
import BlogFeed from "./BlogFeed";
import CategoryFilter from "./CategoryFilter";

type BlogListingProps = {
  eyebrow: string;
  heading: string;
  description: string;
  categories: BlogCategoryWithCount[];
  firstPage: BlogPostsPage;
  activeCategory?: string;
  /** Set on tag pages, where no category pill should read as selected. */
  activeTag?: string;
  emptyMessage: string;
};

/** Shared shell for the blog index and its category/tag views. */
export default function BlogListing({
  eyebrow,
  heading,
  description,
  categories,
  firstPage,
  activeCategory,
  activeTag,
  emptyMessage,
}: BlogListingProps) {
  return (
    <main className="pb-20 pt-12 sm:pb-24 sm:pt-16">
      <Container className="!max-w-[1360px]">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-brand-green">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-balance text-[2.25rem] font-bold leading-[1.12] tracking-tight text-brand-dark sm:text-[2.75rem] lg:text-[3.25rem]">
            {heading}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-brand-text md:text-[17px]">
            {description}
          </p>
        </header>

        <div className="mt-10 sm:mt-12">
          <CategoryFilter
            categories={categories}
            {...(activeCategory ? { activeCategory } : {})}
          />
        </div>

        <div className="mt-12 sm:mt-16">
          {firstPage.items.length === 0 ? (
            <p className="py-16 text-center text-brand-text">{emptyMessage}</p>
          ) : (
            <BlogFeed
              initialPage={firstPage}
              {...(activeCategory ? { category: activeCategory } : {})}
              {...(activeTag ? { tag: activeTag } : {})}
            />
          )}
        </div>
      </Container>
    </main>
  );
}
