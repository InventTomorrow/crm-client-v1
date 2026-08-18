// Mirrors the server's public blog projections (modules/blog/public-blog.repository.ts).

export interface BlogCategoryRef {
  name: string;
  slug: string;
}

export interface BlogPostCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  tags: string[];
  readingMinutes: number;
  publishedAt: string | null;
  authorName: string;
  isFeatured: boolean;
  category: BlogCategoryRef;
}

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface BlogPostDetail extends BlogPostCard {
  /** Sanitized on the server at write time — safe to render directly. */
  bodyHtml: string;
  toc: TocEntry[] | null;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostsPage {
  items: BlogPostCard[];
  nextCursor: string | null;
}

export interface BlogCategoryWithCount extends BlogCategoryRef {
  id: string;
  description: string | null;
  postCount: number;
}

export interface BlogPostSlug {
  slug: string;
  publishedAt: string | null;
  updatedAt: string;
}
