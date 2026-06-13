/**
 * Server-side fetchers for VisBoost and Soro blog embeds.
 * Article lists are embedded in each provider's embed script; full bodies
 * load from their per-article JSON endpoints.
 */

const REVALIDATE_SECONDS = 300;

const VISBOOST_EMBED_URL =
  "https://visboost.com/api/embed/757dcc23-e26f-41a2-9b47-f2f665b6a023";
const SORO_EMBED_URL =
  "https://app.trysoro.com/api/embed/cd6baf9c-275f-4f66-9a3a-5a296574c4b2";

export type ExternalBlogSource = "visboost" | "soro";

type RawEmbedArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string | null;
  date: string;
  isoDate: string;
  image?: string | null;
};

export type ExternalBlogListItem = {
  source: ExternalBlogSource;
  externalId: string;
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
};

export type ExternalBlogPost = ExternalBlogListItem & {
  content: string;
  contentFormat: "html" | "text";
};

function estimateReadTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

function toIsoDate(isoDate: string, fallbackLabel: string): string {
  const parsed = new Date(isoDate);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  const fromLabel = new Date(fallbackLabel);
  if (!Number.isNaN(fromLabel.getTime())) {
    return fromLabel.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

function parseEmbedArticles(script: string, variableName: string): RawEmbedArticle[] {
  const marker = `var ${variableName} = `;
  const start = script.indexOf(marker);
  if (start === -1) return [];

  const arrayStart = start + marker.length;
  if (script[arrayStart] !== "[") return [];

  let depth = 0;
  for (let i = arrayStart; i < script.length; i++) {
    const ch = script[i];
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        try {
          const parsed = JSON.parse(script.slice(arrayStart, i + 1));
          return Array.isArray(parsed) ? (parsed as RawEmbedArticle[]) : [];
        } catch {
          return [];
        }
      }
    }
  }

  return [];
}

async function fetchEmbedScript(url: string): Promise<string> {
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) return "";
  return res.text();
}

function mapListItem(
  article: RawEmbedArticle,
  source: ExternalBlogSource
): ExternalBlogListItem {
  const coverImage = article.image?.trim() || "/og-default.png";
  const description = article.excerpt?.trim() || article.title;
  const readBasis = article.content || article.excerpt || article.title;

  return {
    source,
    externalId: article.id,
    slug: article.slug,
    title: article.title,
    description,
    date: toIsoDate(article.isoDate, article.date),
    author: "Macrolight Builder",
    readTime: estimateReadTime(readBasis),
    category: "",
    coverImage,
    coverAlt: article.title,
    ogImage: coverImage.startsWith("/") ? coverImage : coverImage,
  };
}

function articleContentUrl(source: ExternalBlogSource, articleId: string): string {
  if (source === "visboost") {
    return `${VISBOOST_EMBED_URL}/article/${articleId}`;
  }
  return `${SORO_EMBED_URL}/article/${articleId}`;
}

function detectContentFormat(content: string): "html" | "text" {
  return /<\/?[a-z][\s\S]*>/i.test(content) ? "html" : "text";
}

export async function fetchVisboostPosts(): Promise<ExternalBlogListItem[]> {
  const script = await fetchEmbedScript(VISBOOST_EMBED_URL);
  if (!script) return [];
  return parseEmbedArticles(script, "VISBOOST_ARTICLES").map((article) =>
    mapListItem(article, "visboost")
  );
}

export async function fetchSoroPosts(): Promise<ExternalBlogListItem[]> {
  const script = await fetchEmbedScript(SORO_EMBED_URL);
  if (!script) return [];
  return parseEmbedArticles(script, "SORO_ARTICLES").map((article) =>
    mapListItem(article, "soro")
  );
}

export async function fetchExternalPost(
  item: ExternalBlogListItem
): Promise<ExternalBlogPost | null> {
  const res = await fetch(articleContentUrl(item.source, item.externalId), {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) return null;

  const data = (await res.json().catch(() => null)) as { content?: string } | null;
  const content = typeof data?.content === "string" ? data.content.trim() : "";
  if (!content) return null;

  return {
    ...item,
    content,
    contentFormat: detectContentFormat(content),
  };
}
