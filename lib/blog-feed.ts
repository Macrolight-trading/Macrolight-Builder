import { getAllPosts, getPostBySlug, type BlogPost } from "@/lib/blog";
import {
  fetchExternalPost,
  fetchSoroPosts,
  fetchVisboostPosts,
  type ExternalBlogListItem,
  type ExternalBlogPost,
} from "@/lib/external-blog";

export type BlogFeedSource = "mdx" | "visboost" | "soro";

export type BlogFeedEntry = {
  source: BlogFeedSource;
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  readTime: string;
  category: string;
  coverImage: string;
  coverAlt: string;
  ogImage: string;
  seoTitle?: string;
  externalId?: string;
};

function uniqueSlug(base: string, used: Set<string>): string {
  let slug = base;
  let suffix = 2;
  while (used.has(slug)) {
    slug = `${base}-${suffix++}`;
  }
  used.add(slug);
  return slug;
}

function mdxToFeedEntry(post: BlogPost): BlogFeedEntry {
  return {
    source: "mdx",
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    author: post.author,
    readTime: post.readTime,
    category: post.category,
    coverImage: post.coverImage,
    coverAlt: post.coverAlt,
    ogImage: post.ogImage,
    seoTitle: post.seoTitle,
  };
}

function externalToFeedEntry(
  post: ExternalBlogListItem,
  usedSlugs: Set<string>
): BlogFeedEntry {
  return {
    source: post.source,
    slug: uniqueSlug(post.slug, usedSlugs),
    title: post.title,
    description: post.description,
    date: post.date,
    author: post.author,
    readTime: post.readTime,
    category: post.category,
    coverImage: post.coverImage,
    coverAlt: post.coverAlt,
    ogImage: post.ogImage,
    externalId: post.externalId,
  };
}

export async function getAllBlogFeedEntries(): Promise<BlogFeedEntry[]> {
  const usedSlugs = new Set(getAllPosts().map((post) => post.slug));
  const [visboost, soro] = await Promise.all([fetchVisboostPosts(), fetchSoroPosts()]);

  const external = [...visboost, ...soro].map((post) =>
    externalToFeedEntry(post, usedSlugs)
  );
  const local = getAllPosts().map(mdxToFeedEntry);

  return [...local, ...external].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getBlogFeedEntry(slug: string): Promise<BlogFeedEntry | null> {
  const entries = await getAllBlogFeedEntries();
  return entries.find((entry) => entry.slug === slug) ?? null;
}

export async function getMdxPostBySlug(slug: string): Promise<BlogPost | undefined> {
  return getPostBySlug(slug);
}

export async function getExternalPostByFeedEntry(
  entry: BlogFeedEntry
): Promise<ExternalBlogPost | null> {
  if (entry.source === "mdx" || !entry.externalId) return null;

  return fetchExternalPost({
    source: entry.source,
    externalId: entry.externalId,
    slug: entry.slug,
    title: entry.title,
    description: entry.description,
    date: entry.date,
    author: entry.author,
    readTime: entry.readTime,
    category: entry.category,
    coverImage: entry.coverImage,
    coverAlt: entry.coverAlt,
    ogImage: entry.ogImage,
  });
}
