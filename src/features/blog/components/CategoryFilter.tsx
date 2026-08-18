import Link from "next/link";
import { blogCategoryPath } from "../blog.utils";
import type { BlogCategoryWithCount } from "../types";

type CategoryFilterProps = {
  categories: BlogCategoryWithCount[];
  activeCategory?: string;
};

const PILL_BASE =
  "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[14px] font-medium transition-all";

export default function CategoryFilter({
  categories,
  activeCategory,
}: CategoryFilterProps) {
  if (categories.length === 0) return null;

  const totalPosts = categories.reduce((total, category) => total + category.postCount, 0);

  return (
    <nav aria-label="Article categories" className="flex flex-wrap justify-center gap-2.5">
      <Link
        href="/blog"
        aria-current={activeCategory ? undefined : "page"}
        className={`${PILL_BASE} ${
          activeCategory
            ? "border-brand-mint-2 bg-white text-brand-text hover:border-brand-green/40 hover:text-brand-green"
            : "border-brand-green bg-brand-green text-white"
        }`}
      >
        All articles
        <span className={activeCategory ? "text-brand-text-soft" : "text-white/70"}>
          {totalPosts}
        </span>
      </Link>

      {categories.map((category) => {
        const isActive = category.slug === activeCategory;
        return (
          <Link
            key={category.slug}
            href={blogCategoryPath(category.slug)}
            aria-current={isActive ? "page" : undefined}
            className={`${PILL_BASE} ${
              isActive
                ? "border-brand-green bg-brand-green text-white"
                : "border-brand-mint-2 bg-white text-brand-text hover:border-brand-green/40 hover:text-brand-green"
            }`}
          >
            {category.name}
            <span className={isActive ? "text-white/70" : "text-brand-text-soft"}>
              {category.postCount}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
