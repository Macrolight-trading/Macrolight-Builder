import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface BlogPost {
  slug: string;
  title: string;
  /**
   * Optional shorter title used for the HTML <title> tag and OG title.
   * Use this when `title` exceeds the SERP truncation budget once the
   * " | Macrolight Builder" template (22 chars) is appended — i.e.
   * keep `seoTitle` ≤38 chars to stay under ~60 chars total.
   * Falls back to `title` when not provided.
   */
  seoTitle?: string;
  description: string;
  date: string;
  author: string;
  readTime: string;
  category: string;
  /** Raw MDX body (frontmatter stripped). Pass this to MDXRemote. */
  content: string;
  ogImage: string;
  coverImage: string;
  coverAlt: string;
  /** Key into the `authors` record in lib/authors.ts */
  authorKey?: string;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}

/* ------------------------------------------------------------------ */
/*  Filesystem loader                                                  */
/*                                                                     */
/*  Posts live as MDX files in `/content/blog/{slug}.mdx`. Each file   */
/*  has YAML frontmatter for metadata and an MDX body (no leading H1   */
/*  — the page renders the title separately).                          */
/*                                                                     */
/*  We read once at module load (Next bundles this for the server),    */
/*  so the file is touched at build/start, not per request.            */
/* ------------------------------------------------------------------ */

const POSTS_DIR = path.join(process.cwd(), "content", "blog");

function requireString(slug: string, field: string, value: unknown): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(
      `Blog post "${slug}" is missing required frontmatter field "${field}"`
    );
  }
  return value;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function optionalFaqs(
  slug: string,
  value: unknown
): Array<{ question: string; answer: string }> | undefined {
  if (value == null) return undefined;
  if (!Array.isArray(value)) {
    throw new Error(
      `Blog post "${slug}" has invalid frontmatter field "faqs"; expected an array`
    );
  }

  return value.map((item, index) => {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as { question?: unknown }).question !== "string" ||
      typeof (item as { answer?: unknown }).answer !== "string"
    ) {
      throw new Error(
        `Blog post "${slug}" has invalid FAQ entry at index ${index}`
      );
    }

    return {
      question: (item as { question: string }).question,
      answer: (item as { answer: string }).answer,
    };
  });
}

function loadPosts(): BlogPost[] {
  let entries: string[];
  try {
    entries = fs.readdirSync(POSTS_DIR);
  } catch {
    // Content directory missing — return empty so the site still builds.
    return [];
  }

  const posts: BlogPost[] = [];

  for (const file of entries) {
    if (!file.endsWith(".mdx") && !file.endsWith(".md")) continue;

    const slug = file.replace(/\.mdx?$/, "");
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data, content } = matter(raw);

    posts.push({
      slug,
      title: requireString(slug, "title", data.title),
      seoTitle: optionalString(data.seoTitle),
      description: requireString(slug, "description", data.description),
      date: requireString(slug, "date", data.date),
      author: requireString(slug, "author", data.author),
      authorKey: optionalString(data.authorKey),
      readTime: requireString(slug, "readTime", data.readTime),
      category: requireString(slug, "category", data.category),
      ogImage: requireString(slug, "ogImage", data.ogImage),
      coverImage: requireString(slug, "coverImage", data.coverImage),
      coverAlt: requireString(slug, "coverAlt", data.coverAlt),
      content: content.trimStart(),
      faqs: optionalFaqs(slug, data.faqs),
    });
  }

  return posts;
}

// Cache the loader result so each request after the first is free.
let cached: BlogPost[] | null = null;
function allPosts(): BlogPost[] {
  if (cached === null) cached = loadPosts();
  return cached;
}

export function getAllPosts(): BlogPost[] {
  return [...allPosts()].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return allPosts().find((post) => post.slug === slug);
}
