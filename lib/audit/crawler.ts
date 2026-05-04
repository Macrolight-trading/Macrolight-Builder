import * as cheerio from "cheerio";

/**
 * Shared site crawler used by the technical and on-page modules.
 *
 * Strategy: starting from the homepage, BFS across same-origin links until
 * we hit `maxPages` or run out of new URLs. Each fetched page is parsed once
 * with cheerio and its meta tags / headings / link metadata are pre-extracted
 * so module code doesn't have to re-parse the HTML.
 *
 * Concurrency is capped at MAX_CONCURRENCY to be polite. We obey a global
 * deadline (`totalTimeoutMs`) so the audit never blows past the 90s SLA.
 */

const MAX_CONCURRENCY = 3;
const MAX_HTML_BYTES = 2_000_000; // 2MB hard cap per page

export interface PageMeta {
  title: string | null;
  description: string | null;
  canonical: string | null;
  robots: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string | null;
  /** Number of <h1> elements found on the page. */
  h1Count: number;
  /** Text of the first <h1> if present. */
  h1Text: string | null;
  /** Counts of h2-h6 (indices 0..4 = h2..h6). */
  hCounts: [number, number, number, number, number];
  /** Total <img> count and how many have a non-empty alt attribute. */
  imageCount: number;
  imagesWithAlt: number;
  /** Same-origin links found on the page (raw href values, not deduped). */
  internalLinks: string[];
  /** Cross-origin links. */
  externalLinks: string[];
  /** Approximate visible word count (text in <body> minus script/style). */
  wordCount: number;
  /** Raw JSON-LD payloads found in <script type="application/ld+json">. */
  jsonLdBlocks: unknown[];
  /** True if a JSON-LD block declares @type LocalBusiness or any subtype. */
  hasLocalBusinessSchema: boolean;
}

export interface CrawledPage {
  url: string;
  status: number;
  /** Raw HTML body, truncated to MAX_HTML_BYTES. */
  html: string;
  /** Plain text from <body>, used for keyword density / NAP scanning. */
  textContent: string;
  /** Response time in milliseconds. */
  responseTimeMs: number;
  /** Final URL after any redirects. */
  finalUrl: string;
  /** Redirect chain length (0 = direct fetch). */
  redirectCount: number;
  contentType: string | null;
  headers: Record<string, string>;
  meta: PageMeta;
  /** Depth from the root URL (0 = homepage). */
  depth: number;
}

export interface CrawlResult {
  rootUrl: string;
  pages: CrawledPage[];
  robotsTxt: string | null;
  sitemapUrl: string | null;
  sitemapXml: string | null;
  brokenLinks: Array<{ from: string; to: string; status: number }>;
  durationMs: number;
}

export interface CrawlOptions {
  maxPages?: number;
  requestTimeoutMs?: number;
  totalTimeoutMs?: number;
  userAgent?: string;
}

const DEFAULT_OPTIONS: Required<CrawlOptions> = {
  maxPages: 20,
  requestTimeoutMs: 10000,
  totalTimeoutMs: 60000,
  userAgent: "MacrolightAuditBot/1.0 (+https://macrolightbuilders.com/about)",
};

export async function crawl(
  rootUrl: string,
  options: CrawlOptions = {}
): Promise<CrawlResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const start = Date.now();
  const deadline = start + opts.totalTimeoutMs;
  const rootOrigin = safeOrigin(rootUrl);

  // Fetch robots.txt + try to discover sitemap URL.
  const { robotsTxt, sitemapUrlFromRobots } = await fetchRobots(
    rootOrigin,
    opts
  );
  const sitemapUrl =
    sitemapUrlFromRobots ?? (rootOrigin ? `${rootOrigin}/sitemap.xml` : null);
  const sitemapXml = sitemapUrl
    ? await fetchTextSafely(sitemapUrl, opts).catch(() => null)
    : null;

  // BFS queue.
  const visited = new Set<string>();
  const queue: Array<{ url: string; depth: number }> = [
    { url: rootUrl, depth: 0 },
  ];
  const pages: CrawledPage[] = [];
  const brokenLinks: CrawlResult["brokenLinks"] = [];

  while (queue.length > 0 && pages.length < opts.maxPages) {
    if (Date.now() > deadline) break;

    // Take up to MAX_CONCURRENCY items from the queue.
    const batch = queue
      .splice(0, MAX_CONCURRENCY)
      .filter((item) => {
        const norm = normalizeUrl(item.url);
        if (!norm || visited.has(norm)) return false;
        visited.add(norm);
        return true;
      });

    if (batch.length === 0) continue;

    const remainingTime = deadline - Date.now();
    if (remainingTime <= 0) break;

    const results = await Promise.all(
      batch.map((item) =>
        fetchAndParse(item.url, opts).then(
          (page) => ({ ok: true as const, item, page }),
          (err: unknown) => ({
            ok: false as const,
            item,
            error: err instanceof Error ? err.message : String(err),
          })
        )
      )
    );

    for (const r of results) {
      if (!r.ok) {
        // Couldn't even fetch — record as broken if it was reached from a known page.
        brokenLinks.push({
          from: rootUrl,
          to: r.item.url,
          status: 0,
        });
        continue;
      }

      const page = r.page;
      page.depth = r.item.depth;
      pages.push(page);

      if (page.status >= 400) {
        brokenLinks.push({
          from: rootUrl,
          to: page.finalUrl,
          status: page.status,
        });
        continue;
      }

      // Enqueue same-origin links discovered on this page.
      if (rootOrigin && page.depth < 5) {
        for (const href of page.meta.internalLinks) {
          const resolved = resolveUrl(href, page.finalUrl);
          if (!resolved) continue;
          if (safeOrigin(resolved) !== rootOrigin) continue;
          const norm = normalizeUrl(resolved);
          if (!norm || visited.has(norm)) continue;
          // Don't enqueue beyond the cap (we'll stop the loop anyway).
          if (pages.length + queue.length >= opts.maxPages) break;
          queue.push({ url: resolved, depth: page.depth + 1 });
        }
      }
    }
  }

  return {
    rootUrl,
    pages,
    robotsTxt,
    sitemapUrl: sitemapXml ? sitemapUrl : null,
    sitemapXml,
    brokenLinks,
    durationMs: Date.now() - start,
  };
}

/* ── Single-page convenience (used by Local SEO module) ─────────────────── */

export async function fetchSinglePage(
  url: string,
  options: CrawlOptions = {}
): Promise<CrawledPage | null> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  try {
    return await fetchAndParse(url, opts);
  } catch {
    return null;
  }
}

/* ── Internals ──────────────────────────────────────────────────────────── */

async function fetchAndParse(
  url: string,
  opts: Required<CrawlOptions>
): Promise<CrawledPage> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), opts.requestTimeoutMs);
  const startTime = Date.now();

  let res: Response;
  try {
    res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": opts.userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
  } finally {
    clearTimeout(timeoutId);
  }

  const responseTimeMs = Date.now() - startTime;
  const finalUrl = res.url || url;
  const redirectCount = countRedirects(url, finalUrl, res);
  const contentType = res.headers.get("content-type");

  // We only parse HTML — non-HTML responses return a sparse CrawledPage.
  const isHtml = !contentType || /text\/html|application\/xhtml/i.test(contentType);

  let html = "";
  let textContent = "";
  let meta: PageMeta = emptyMeta();

  if (isHtml && res.body) {
    html = await readLimited(res, MAX_HTML_BYTES);
    if (html) {
      const parsed = parseHtml(html, finalUrl);
      textContent = parsed.text;
      meta = parsed.meta;
    }
  }

  const headers: Record<string, string> = {};
  for (const [k, v] of res.headers.entries()) {
    if (
      k === "cache-control" ||
      k === "x-robots-tag" ||
      k === "content-type" ||
      k === "content-length"
    ) {
      headers[k] = v;
    }
  }

  // X-Robots-Tag header has the same authority as a meta robots tag — fold
  // it into meta.robots so downstream code only checks one place.
  if (headers["x-robots-tag"] && !meta.robots) {
    meta = { ...meta, robots: headers["x-robots-tag"] };
  }

  return {
    url,
    status: res.status,
    html,
    textContent,
    responseTimeMs,
    finalUrl,
    redirectCount,
    contentType,
    headers,
    meta,
    depth: 0,
  };
}

async function readLimited(res: Response, maxBytes: number): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const chunks: string[] = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      chunks.push(decoder.decode(value, { stream: true }));
      if (total >= maxBytes) {
        try {
          await reader.cancel();
        } catch {
          /* ignore */
        }
        break;
      }
    }
  } catch {
    // Network hiccup mid-stream — return what we got.
  }
  chunks.push(decoder.decode());
  return chunks.join("");
}

interface ParsedHtml {
  meta: PageMeta;
  text: string;
}

function parseHtml(html: string, baseUrl: string): ParsedHtml {
  const $ = cheerio.load(html);

  const title = $("head title").first().text().trim() || null;
  const description =
    $('head meta[name="description"]').attr("content")?.trim() || null;
  const canonical =
    $('head link[rel="canonical"]').attr("href")?.trim() || null;
  const robots =
    $('head meta[name="robots"]').attr("content")?.trim() || null;
  const ogTitle =
    $('head meta[property="og:title"]').attr("content")?.trim() || null;
  const ogDescription =
    $('head meta[property="og:description"]').attr("content")?.trim() || null;
  const ogImage =
    $('head meta[property="og:image"]').attr("content")?.trim() || null;
  const twitterCard =
    $('head meta[name="twitter:card"]').attr("content")?.trim() || null;

  const h1s = $("body h1");
  const h1Count = h1s.length;
  const h1Text = h1s.first().text().trim() || null;

  const hCounts: [number, number, number, number, number] = [
    $("body h2").length,
    $("body h3").length,
    $("body h4").length,
    $("body h5").length,
    $("body h6").length,
  ];

  const images = $("body img");
  let imageCount = 0;
  let imagesWithAlt = 0;
  images.each((_, el) => {
    imageCount++;
    const alt = $(el).attr("alt");
    if (alt != null && alt.trim().length > 0) imagesWithAlt++;
  });

  const internalLinks: string[] = [];
  const externalLinks: string[] = [];
  const baseOrigin = safeOrigin(baseUrl);
  $("body a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    if (
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:")
    ) {
      return;
    }
    const resolved = resolveUrl(href, baseUrl);
    if (!resolved) return;
    if (baseOrigin && safeOrigin(resolved) === baseOrigin) {
      internalLinks.push(resolved);
    } else {
      externalLinks.push(resolved);
    }
  });

  // Word count: strip script/style/nav/header/footer noise and count words.
  $("script, style, noscript").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = text ? text.split(/\s+/).length : 0;

  // JSON-LD blocks.
  const jsonLdBlocks: unknown[] = [];
  let hasLocalBusinessSchema = false;
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      jsonLdBlocks.push(parsed);
      if (containsLocalBusinessType(parsed)) hasLocalBusinessSchema = true;
    } catch {
      // Malformed JSON-LD blocks are flagged elsewhere if needed; ignore here.
    }
  });

  return {
    text,
    meta: {
      title,
      description,
      canonical,
      robots,
      ogTitle,
      ogDescription,
      ogImage,
      twitterCard,
      h1Count,
      h1Text,
      hCounts,
      imageCount,
      imagesWithAlt,
      internalLinks,
      externalLinks,
      wordCount,
      jsonLdBlocks,
      hasLocalBusinessSchema,
    },
  };
}

/**
 * Recursively check JSON-LD payload for any LocalBusiness type or subtype.
 * schema.org defines many subtypes (Restaurant, Plumber, etc.) that all
 * inherit from LocalBusiness — we treat any of those as a match.
 */
const LOCAL_BUSINESS_TYPES = new Set([
  "LocalBusiness",
  "Restaurant",
  "Plumber",
  "Electrician",
  "Dentist",
  "Physician",
  "AutoRepair",
  "RealEstateAgent",
  "ProfessionalService",
  "HomeAndConstructionBusiness",
  "GeneralContractor",
  "Roofing",
  "HVACBusiness",
  "MovingCompany",
  "Store",
  "FinancialService",
  "MedicalBusiness",
  "LegalService",
  "Locksmith",
  "ChildCare",
  "BeautySalon",
  "HairSalon",
  "DaySpa",
  "FoodEstablishment",
]);

function containsLocalBusinessType(node: unknown): boolean {
  if (!node || typeof node !== "object") return false;
  if (Array.isArray(node)) return node.some(containsLocalBusinessType);
  const obj = node as Record<string, unknown>;
  const type = obj["@type"];
  if (typeof type === "string" && LOCAL_BUSINESS_TYPES.has(type)) return true;
  if (Array.isArray(type) && type.some((t) => typeof t === "string" && LOCAL_BUSINESS_TYPES.has(t))) {
    return true;
  }
  // Walk @graph or nested objects.
  if (Array.isArray(obj["@graph"])) {
    return obj["@graph"].some(containsLocalBusinessType);
  }
  for (const value of Object.values(obj)) {
    if (typeof value === "object" && value !== null) {
      if (containsLocalBusinessType(value)) return true;
    }
  }
  return false;
}

function emptyMeta(): PageMeta {
  return {
    title: null,
    description: null,
    canonical: null,
    robots: null,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    twitterCard: null,
    h1Count: 0,
    h1Text: null,
    hCounts: [0, 0, 0, 0, 0],
    imageCount: 0,
    imagesWithAlt: 0,
    internalLinks: [],
    externalLinks: [],
    wordCount: 0,
    jsonLdBlocks: [],
    hasLocalBusinessSchema: false,
  };
}

async function fetchRobots(
  rootOrigin: string | null,
  opts: Required<CrawlOptions>
): Promise<{ robotsTxt: string | null; sitemapUrlFromRobots: string | null }> {
  if (!rootOrigin) return { robotsTxt: null, sitemapUrlFromRobots: null };

  const robotsTxt = await fetchTextSafely(`${rootOrigin}/robots.txt`, opts).catch(
    () => null
  );
  if (!robotsTxt) return { robotsTxt: null, sitemapUrlFromRobots: null };

  // Find first Sitemap: directive.
  const m = /^\s*Sitemap:\s*(\S+)/im.exec(robotsTxt);
  const sitemapUrlFromRobots = m ? m[1].trim() : null;

  return { robotsTxt, sitemapUrlFromRobots };
}

async function fetchTextSafely(
  url: string,
  opts: Required<CrawlOptions>
): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), opts.requestTimeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": opts.userAgent },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function safeOrigin(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function resolveUrl(href: string, base: string): string | null {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function normalizeUrl(url: string): string | null {
  try {
    const u = new URL(url);
    u.hash = "";
    // Drop trailing slash on the path so /foo and /foo/ collide.
    if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
      u.pathname = u.pathname.slice(0, -1);
    }
    return u.toString();
  } catch {
    return null;
  }
}

function countRedirects(originalUrl: string, finalUrl: string, _res: Response): number {
  // The Fetch API doesn't expose per-hop redirect history. We approximate by
  // checking whether the final URL differs from the requested URL — that's
  // either 0 (direct) or "at least 1". For deeper analysis we'd need a custom
  // redirect handler.
  if (originalUrl === finalUrl) return 0;
  try {
    const a = new URL(originalUrl);
    const b = new URL(finalUrl);
    // If only the trailing slash or scheme differs, count as 1 hop.
    if (a.protocol !== b.protocol) return 1;
    if (a.hostname !== b.hostname) return 1;
    if (a.pathname.replace(/\/$/, "") === b.pathname.replace(/\/$/, "")) {
      return 1;
    }
    return 1;
  } catch {
    return 1;
  }
}
