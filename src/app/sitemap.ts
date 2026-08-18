import { fetchBlogCategories, fetchBlogSlugs } from "@/features/blog/blog.api";
import {
  LEGAL_LAST_UPDATED_ISO,
  LEGAL_ROUTES,
} from "@/features/legal/constants";
import { SITE_URL, absoluteUrl } from "@/shared/lib/site";
import type { MetadataRoute } from "next";

// Only the indexable surface belongs here: the landing page, the blog + its
// articles, and legal docs. Auth, onboarding, and all (app) CRM routes are
// noindexed and robots-disallowed.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories] = await Promise.all([
    fetchBlogSlugs(),
    fetchBlogCategories(),
  ]);

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: posts[0]?.updatedAt ? new Date(posts[0].updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...categories.map((category) => ({
      url: absoluteUrl(`/blog/category/${category.slug}`),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...LEGAL_ROUTES.map((legalRoute) => ({
      url: absoluteUrl(legalRoute.path),
      lastModified: new Date(LEGAL_LAST_UPDATED_ISO),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
