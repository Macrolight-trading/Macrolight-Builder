/**
 * Shared site crawler used by the technical and on-page modules.
 *
 * STATUS: Scaffolding stub.
 *
 * Production implementation will:
 *   - Use `axios` + `cheerio` (add to package.json when wiring up)
 *   - Respect robots.txt
 *   - Cap concurrency at ~5 simultaneous fetches
 *   - Limit total pages crawled (default 20, configurable per AuditInput)
 *   - Time out individual requests at ~10s, total crawl at ~60s
 *   - Discover internal links by parsing <a href> on the homepage and
 *     breadth-first expanding to same-origin URLs only
 *   - Return parsed CheerioAPI roots so module code doesn't re-parse HTML
 *
 * The interfaces below are stable; module code can be written against them
 * today and the crawler swapped in later without touching callers.
 */

export interface CrawledPage {
  url: string;
  status: number;
  /** Raw HTML body (truncated to ~1MB for safety). */
  html: string;
  /**
   * Parsed text content (cheerio root would be ideal but cheerio isn't a
   * dependency yet — keeping this string for now, switch to CheerioAPI when
   * the real implementation lands).
   */
  textContent: string;
  /** Response time in milliseconds. */
  responseTimeMs: number;
  /** Final URL after any redirects. */
  finalUrl: string;
  /** Redirect chain length (0 = direct fetch). */
  redirectCount: number;
  contentType: string | null;
  /** Headers we care about for the audit (cache-control, x-robots-tag, etc.) */
  headers: Record<string, string>;
}

export interface CrawlResult {
  /** The starting URL passed in. */
  rootUrl: string;
  pages: CrawledPage[];
  /** robots.txt body, or null if not present / unreachable. */
  robotsTxt: string | null;
  /** Sitemap URL discovered (from robots.txt or /sitemap.xml), or null. */
  sitemapUrl: string | null;
  /** Sitemap body, or null if not present / unreachable. */
  sitemapXml: string | null;
  /** URLs that returned non-2xx status during the crawl. */
  brokenLinks: Array<{ from: string; to: string; status: number }>;
  /** Total time spent crawling in milliseconds. */
  durationMs: number;
}

export interface CrawlOptions {
  /** Maximum number of pages to fetch. Default 20. */
  maxPages?: number;
  /** Per-request timeout in milliseconds. Default 10000. */
  requestTimeoutMs?: number;
  /** Total crawl timeout in milliseconds. Default 60000. */
  totalTimeoutMs?: number;
  /** User agent to send. Default identifies us as the audit bot. */
  userAgent?: string;
}

const DEFAULT_OPTIONS: Required<CrawlOptions> = {
  maxPages: 20,
  requestTimeoutMs: 10000,
  totalTimeoutMs: 60000,
  userAgent: "MacrolightAuditBot/1.0 (+https://macrolightbuilders.com/about)",
};

/**
 * STUB: Crawl a site starting from `rootUrl`.
 *
 * The real implementation will be added in Milestone 2. For now this returns
 * an empty CrawlResult so module stubs and the orchestrator can run end-to-end
 * without throwing.
 */
export async function crawl(
  rootUrl: string,
  options: CrawlOptions = {}
): Promise<CrawlResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // TODO(milestone-2): replace with real axios+cheerio crawler.
  // The opts variable is referenced so TS doesn't flag it as unused while
  // the real implementation is pending.
  void opts;

  return {
    rootUrl,
    pages: [],
    robotsTxt: null,
    sitemapUrl: null,
    sitemapXml: null,
    brokenLinks: [],
    durationMs: 0,
  };
}

/**
 * Convenience: fetch only the root page. Used by modules that don't need a
 * full crawl (e.g. PageSpeed-only path in Milestone 1).
 *
 * STUB: returns a placeholder until the real fetcher is wired up.
 */
export async function fetchSinglePage(url: string): Promise<CrawledPage | null> {
  // TODO(milestone-1): minimal real implementation using global fetch.
  void url;
  return null;
}
