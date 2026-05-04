import { crawl, type CrawlResult, type CrawledPage } from "../crawler";
import { scoreModule } from "../scorer";
import type { AuditInput, AuditIssue, AuditModuleResult } from "../types";

/**
 * The orchestrator passes its shared crawl result in as the second argument
 * to avoid re-crawling. Keeping the parameter optional means the module can
 * still be invoked standalone (e.g. from a future single-module API).
 */

/**
 * Technical SEO module.
 *
 * Combines:
 *   - Google PageSpeed Insights API (mobile + desktop strategies) for
 *     Performance, SEO, Accessibility, Best Practices scores plus the
 *     Core Web Vitals (LCP, INP, CLS) and supplementary timing metrics.
 *   - Crawler-derived findings: HTTPS, robots.txt, sitemap, canonical
 *     correctness, meta robots, OG/Twitter tags, JSON-LD presence,
 *     broken internal links, redirect chains.
 *
 * Required env: GOOGLE_PAGESPEED_API_KEY
 */

const PAGESPEED_ENDPOINT =
  "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

/** Per-call timeout for the PageSpeed API. The endpoint can be slow. */
const PAGESPEED_TIMEOUT_MS = 45000;

/** Lighthouse score thresholds (matching Google's color bands). */
const LIGHTHOUSE_THRESHOLDS = { good: 90, ok: 50 } as const;

/** Core Web Vitals thresholds (web.dev standard, in ms / unitless for CLS). */
const CWV_THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },
  inp: { good: 200, poor: 500 },
  cls: { good: 0.1, poor: 0.25 },
  ttfb: { good: 800, poor: 1800 },
  fcp: { good: 1800, poor: 3000 },
} as const;

interface PageSpeedStrategyResult {
  performance: number | null;
  seo: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  lcp: number | null;
  inp: number | null;
  cls: number | null;
  ttfb: number | null;
  fcp: number | null;
  /** Lighthouse audits we surface as positives or critical issues. */
  hasViewport: boolean | null;
  isMobileFriendly: boolean | null;
  hasManifest: boolean | null;
  /** Set when the API call failed; the rest of the fields will be null. */
  error?: string;
}

interface PageSpeedRawData {
  mobile: PageSpeedStrategyResult;
  desktop: PageSpeedStrategyResult;
}

export async function runTechnicalAudit(
  input: AuditInput,
  sharedCrawl?: CrawlResult
): Promise<AuditModuleResult> {
  const issues: AuditIssue[] = [];
  const positives: string[] = [];

  const pageSpeedKeyMissing = !process.env.GOOGLE_PAGESPEED_API_KEY;

  // Run PageSpeed (if key present) and the crawl (if not pre-supplied) in
  // parallel. Either failing alone is OK — we still produce useful checks
  // from the other source. Both failing means the module is unavailable.
  const pageSpeedPromise: Promise<PageSpeedRawData | null> = pageSpeedKeyMissing
    ? Promise.resolve(null)
    : fetchPageSpeedBoth(input.url).catch(() => null);

  const crawlPromise: Promise<CrawlResult> = sharedCrawl
    ? Promise.resolve(sharedCrawl)
    : crawl(input.url, { maxPages: input.crawlLimit });

  const [pageSpeedData, crawlResult] = await Promise.all([
    pageSpeedPromise,
    crawlPromise,
  ]);

  const pageSpeedAvailable = pageSpeedData != null;
  const crawlAvailable = crawlResult.pages.length > 0;

  // If we have nothing usable, the module is unavailable.
  if (!pageSpeedAvailable && !crawlAvailable) {
    return {
      module: "technical",
      available: false,
      unavailableReason: pageSpeedKeyMissing
        ? "Google PageSpeed API key not configured and site could not be crawled"
        : "Google PageSpeed API call failed and site could not be crawled",
      score: 0,
      issues: [],
      rawData: {
        pageSpeed: pageSpeedData,
        pagesCrawled: 0,
        crawlDurationMs: crawlResult.durationMs,
      },
      positives: [],
    };
  }

  // ── PageSpeed-derived issues (mobile is the primary strategy) ────────────
  if (pageSpeedAvailable && pageSpeedData) {
    evaluatePageSpeed(pageSpeedData.mobile, "mobile", issues, positives);
    evaluatePageSpeed(pageSpeedData.desktop, "desktop", issues, positives);
  }

  // ── Crawl-derived issues — only run if the crawl actually succeeded ─────
  // Skipping these when the crawl returned nothing avoids false positives
  // like "no canonicals" (we just couldn't see them).
  if (crawlAvailable) {
    evaluateHttps(input.url, issues, positives);
    evaluateRobotsTxt(crawlResult, issues, positives);
    evaluateSitemap(crawlResult, issues, positives);
    evaluateCanonicals(crawlResult, issues, positives);
    evaluateMetaRobots(crawlResult, issues, positives);
    evaluateOgTwitter(crawlResult, issues, positives);
    evaluateStructuredData(crawlResult, issues, positives);
    evaluateBrokenLinks(crawlResult, issues);
    evaluateRedirectChains(crawlResult, issues);
  }

  return {
    module: "technical",
    available: true,
    score: scoreModule(issues),
    issues,
    rawData: {
      pageSpeed: pageSpeedData,
      pageSpeedAvailable,
      crawlAvailable,
      pagesCrawled: crawlResult.pages.length,
      crawlDurationMs: crawlResult.durationMs,
    },
    positives,
  };
}

/* ── PageSpeed API ──────────────────────────────────────────────────────── */

async function fetchPageSpeedBoth(url: string): Promise<PageSpeedRawData> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_PAGESPEED_API_KEY is not set");
  }

  const [mobile, desktop] = await Promise.all([
    fetchPageSpeed(url, "mobile", apiKey),
    fetchPageSpeed(url, "desktop", apiKey),
  ]);

  return { mobile, desktop };
}

async function fetchPageSpeed(
  url: string,
  strategy: "mobile" | "desktop",
  apiKey: string
): Promise<PageSpeedStrategyResult> {
  const params = new URLSearchParams({
    url,
    key: apiKey,
    strategy,
  });
  // We need multiple categories — repeated `category` params per the docs.
  for (const cat of ["performance", "seo", "accessibility", "best-practices"]) {
    params.append("category", cat);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PAGESPEED_TIMEOUT_MS);

  try {
    const res = await fetch(`${PAGESPEED_ENDPOINT}?${params.toString()}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `PageSpeed API returned ${res.status}: ${body.slice(0, 200)}`
      );
    }

    const data = (await res.json()) as PageSpeedApiResponse;
    return parsePageSpeed(data);
  } finally {
    clearTimeout(timeoutId);
  }
}

interface PageSpeedApiResponse {
  lighthouseResult?: {
    categories?: {
      performance?: { score: number | null };
      seo?: { score: number | null };
      accessibility?: { score: number | null };
      "best-practices"?: { score: number | null };
    };
    audits?: Record<
      string,
      {
        numericValue?: number;
        displayValue?: string;
        score?: number | null;
      }
    >;
  };
}

function parsePageSpeed(data: PageSpeedApiResponse): PageSpeedStrategyResult {
  const cats = data.lighthouseResult?.categories;
  const audits = data.lighthouseResult?.audits ?? {};

  const score = (raw: number | null | undefined): number | null =>
    raw == null ? null : Math.round(raw * 100);

  const numeric = (id: string): number | null => {
    const v = audits[id]?.numericValue;
    return typeof v === "number" ? v : null;
  };

  const auditPassed = (id: string): boolean | null => {
    const s = audits[id]?.score;
    if (s == null) return null;
    return s >= 0.9;
  };

  return {
    performance: score(cats?.performance?.score),
    seo: score(cats?.seo?.score),
    accessibility: score(cats?.accessibility?.score),
    bestPractices: score(cats?.["best-practices"]?.score),
    lcp: numeric("largest-contentful-paint"),
    // Lighthouse exposes interaction-to-next-paint as `interaction-to-next-paint`
    // (when available from CrUX) — fall back to "max-potential-fid" for older
    // payloads.
    inp:
      numeric("interaction-to-next-paint") ?? numeric("max-potential-fid"),
    cls: numeric("cumulative-layout-shift"),
    ttfb: numeric("server-response-time"),
    fcp: numeric("first-contentful-paint"),
    hasViewport: auditPassed("viewport"),
    isMobileFriendly: auditPassed("content-width"),
    hasManifest: auditPassed("installable-manifest"),
  };
}

/* ── PageSpeed evaluators ───────────────────────────────────────────────── */

function evaluatePageSpeed(
  data: PageSpeedStrategyResult,
  strategy: "mobile" | "desktop",
  issues: AuditIssue[],
  positives: string[]
): void {
  if (data.error) return; // already added an issue at the top level

  const label = strategy === "mobile" ? "Mobile" : "Desktop";

  // Performance score — mobile is the primary signal Google uses for ranking.
  if (data.performance != null) {
    if (data.performance < LIGHTHOUSE_THRESHOLDS.ok) {
      issues.push({
        module: "technical",
        severity: strategy === "mobile" ? "critical" : "warning",
        check: `pagespeed_performance_${strategy}`,
        title: `${label} performance score is ${data.performance}/100`,
        description:
          `Lighthouse rates this site as poor on ${strategy} (under 50/100). ` +
          "Slow performance hurts both rankings and conversion.",
        recommendation:
          "Investigate render-blocking resources, oversized images, and " +
          "unused JavaScript. The PageSpeed Insights report at " +
          "pagespeed.web.dev shows the exact opportunities.",
        docsUrl: "https://web.dev/articles/lcp",
      });
    } else if (data.performance < LIGHTHOUSE_THRESHOLDS.good) {
      issues.push({
        module: "technical",
        severity: "warning",
        check: `pagespeed_performance_${strategy}`,
        title: `${label} performance is ${data.performance}/100 — needs improvement`,
        description:
          "Performance is in Google's mid band. There's headroom to improve " +
          "before this becomes a ranking liability.",
        recommendation:
          "Run pagespeed.web.dev for a per-issue breakdown. Common wins: " +
          "image format/sizing, lazy-loading below-the-fold media, " +
          "reducing main-thread work.",
      });
    } else if (strategy === "mobile") {
      positives.push(
        `${label} performance score is ${data.performance}/100 — in Google's "good" band.`
      );
    }
  }

  // SEO score
  if (data.seo != null && data.seo < LIGHTHOUSE_THRESHOLDS.good) {
    issues.push({
      module: "technical",
      severity: data.seo < LIGHTHOUSE_THRESHOLDS.ok ? "critical" : "warning",
      check: `lighthouse_seo_${strategy}`,
      title: `Lighthouse SEO score (${strategy}) is ${data.seo}/100`,
      description:
        "Lighthouse flagged on-page SEO problems — typically missing meta " +
        "tags, non-crawlable links, or accessibility issues that affect " +
        "indexing.",
      recommendation:
        "Open the SEO section of the PageSpeed report at pagespeed.web.dev " +
        "to see the specific failing audits.",
    });
  }

  // Accessibility — only emit on mobile to avoid duplicate noise.
  if (strategy === "mobile" && data.accessibility != null) {
    if (data.accessibility < LIGHTHOUSE_THRESHOLDS.ok) {
      issues.push({
        module: "technical",
        severity: "warning",
        check: "lighthouse_accessibility",
        title: `Accessibility score is ${data.accessibility}/100`,
        description:
          "Significant accessibility problems detected. Beyond the legal " +
          "considerations, accessibility issues often correlate with SEO " +
          "issues (missing alt text, low contrast, broken landmarks).",
        recommendation:
          "Open the Accessibility section of the PageSpeed report for the " +
          "specific failures. Focus on alt text, form labels, and color " +
          "contrast first.",
      });
    } else if (data.accessibility >= LIGHTHOUSE_THRESHOLDS.good) {
      positives.push(`Accessibility score is ${data.accessibility}/100.`);
    }
  }

  // Core Web Vitals — only mobile (Google's CWV ranking signal is mobile-first).
  if (strategy === "mobile") {
    evaluateCwv(data.lcp, "lcp", "Largest Contentful Paint", issues, positives, formatMs);
    evaluateCwv(data.inp, "inp", "Interaction to Next Paint", issues, positives, formatMs);
    evaluateCwv(data.cls, "cls", "Cumulative Layout Shift", issues, positives, (n) => n.toFixed(2));
    evaluateCwv(data.ttfb, "ttfb", "Time to First Byte", issues, positives, formatMs);
    evaluateCwv(data.fcp, "fcp", "First Contentful Paint", issues, positives, formatMs);
  }

  if (data.hasViewport === false) {
    issues.push({
      module: "technical",
      severity: "critical",
      check: `missing_viewport_${strategy}`,
      title: "Missing or invalid viewport meta tag",
      description:
        "Without a proper <meta name=\"viewport\"> tag, the site won't " +
        "render correctly on mobile devices and Google will downrank it.",
      recommendation:
        'Add <meta name="viewport" content="width=device-width, initial-scale=1"> ' +
        "to the <head> of every page.",
      docsUrl:
        "https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag",
    });
  }
}

function evaluateCwv(
  value: number | null,
  key: keyof typeof CWV_THRESHOLDS,
  label: string,
  issues: AuditIssue[],
  positives: string[],
  formatter: (n: number) => string
): void {
  if (value == null) return;
  const t = CWV_THRESHOLDS[key];
  if (value > t.poor) {
    issues.push({
      module: "technical",
      severity: "critical",
      check: `cwv_${key}_poor`,
      title: `${label} is ${formatter(value)} — poor`,
      description:
        `Google considers ${label} above ${formatter(t.poor)} a poor user ` +
        "experience and uses it as a ranking signal in mobile search.",
      recommendation: cwvRecommendation(key),
      docsUrl: `https://web.dev/articles/${cwvDocSlug(key)}`,
    });
  } else if (value > t.good) {
    issues.push({
      module: "technical",
      severity: "warning",
      check: `cwv_${key}_needs_improvement`,
      title: `${label} is ${formatter(value)} — needs improvement`,
      description:
        `${label} is above Google's "good" threshold of ${formatter(t.good)}.`,
      recommendation: cwvRecommendation(key),
      docsUrl: `https://web.dev/articles/${cwvDocSlug(key)}`,
    });
  } else {
    positives.push(`${label} is ${formatter(value)} — in the "good" band.`);
  }
}

function cwvRecommendation(key: keyof typeof CWV_THRESHOLDS): string {
  switch (key) {
    case "lcp":
      return (
        "Speed up the loading of the largest above-the-fold element " +
        "(usually a hero image or heading). Wins: smaller images, modern " +
        "formats (AVIF/WebP), preloading, removing render-blocking CSS/JS."
      );
    case "inp":
      return (
        "Reduce JavaScript work on user interactions. Break up long tasks, " +
        "defer non-critical scripts, and avoid heavy event-handler logic."
      );
    case "cls":
      return (
        "Reserve space for images, ads, and embeds with explicit width/height. " +
        "Avoid inserting content above existing content after page load."
      );
    case "ttfb":
      return (
        "Improve server response time. Common causes: slow database queries, " +
        "uncached pages, distant server locations. Add caching or a CDN."
      );
    case "fcp":
      return (
        "Reduce render-blocking resources. Inline critical CSS, defer " +
        "non-essential JavaScript, and minimize web font loading delays."
      );
  }
}

function cwvDocSlug(key: keyof typeof CWV_THRESHOLDS): string {
  return key === "cls" ? "cls" : key;
}

function formatMs(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(2)}s` : `${Math.round(n)}ms`;
}

/* ── Crawler-derived evaluators ─────────────────────────────────────────── */

function evaluateHttps(
  url: string,
  issues: AuditIssue[],
  positives: string[]
): void {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      issues.push({
        module: "technical",
        severity: "critical",
        check: "no_https",
        title: "Site is not served over HTTPS",
        description:
          "The audited URL uses http://. Browsers display a 'Not Secure' " +
          "warning and Google has used HTTPS as a ranking signal since 2014.",
        recommendation:
          "Install a TLS certificate (Let's Encrypt is free) and redirect " +
          "all http:// traffic to https://.",
        docsUrl: "https://developers.google.com/search/docs/advanced/security/https",
      });
    } else {
      positives.push("Site is served over HTTPS.");
    }
  } catch {
    // URL was invalid — already validated upstream, ignore.
  }
}

function evaluateRobotsTxt(
  crawl: CrawlResult,
  issues: AuditIssue[],
  positives: string[]
): void {
  if (!crawl.robotsTxt) {
    issues.push({
      module: "technical",
      severity: "warning",
      check: "missing_robots_txt",
      title: "robots.txt is missing",
      description:
        "No robots.txt file was found at the site root. Search engines " +
        "use it to discover sitemaps and respect crawl preferences.",
      recommendation:
        "Add a robots.txt file at /robots.txt. At minimum, include a " +
        "Sitemap: directive pointing at your XML sitemap.",
      docsUrl: "https://developers.google.com/search/docs/crawling-indexing/robots/intro",
    });
    return;
  }

  // Catch the catastrophic case: blanket disallow.
  if (/^\s*Disallow:\s*\/\s*$/im.test(crawl.robotsTxt)) {
    issues.push({
      module: "technical",
      severity: "critical",
      check: "robots_blocks_everything",
      title: "robots.txt blocks the entire site",
      description:
        "robots.txt contains 'Disallow: /' which tells well-behaved " +
        "crawlers (including Google) not to index any page.",
      recommendation:
        "Remove the blanket Disallow rule. Use specific paths if you " +
        "need to keep certain sections private.",
    });
  } else {
    positives.push("robots.txt is present and reachable.");
  }
}

function evaluateSitemap(
  crawl: CrawlResult,
  issues: AuditIssue[],
  positives: string[]
): void {
  if (!crawl.sitemapXml) {
    issues.push({
      module: "technical",
      severity: "warning",
      check: "missing_sitemap",
      title: "XML sitemap is missing or unreachable",
      description:
        "No sitemap was found at /sitemap.xml or referenced from robots.txt. " +
        "Sitemaps help search engines discover and prioritise pages.",
      recommendation:
        "Generate an XML sitemap and either place it at /sitemap.xml or " +
        "reference it from robots.txt with 'Sitemap: <full URL>'.",
      docsUrl: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview",
    });
  } else {
    positives.push("XML sitemap is present.");
  }
}

function evaluateCanonicals(
  crawl: CrawlResult,
  issues: AuditIssue[],
  positives: string[]
): void {
  const pagesWithoutCanonical: string[] = [];
  for (const page of crawl.pages) {
    if (!page.meta.canonical) {
      pagesWithoutCanonical.push(page.finalUrl);
    } else {
      // Self-referential canonical pointing at a different URL is a flag.
      try {
        const canon = new URL(page.meta.canonical, page.finalUrl).toString();
        const finalNormalized = normalizeForCanonical(page.finalUrl);
        const canonNormalized = normalizeForCanonical(canon);
        if (canonNormalized !== finalNormalized) {
          // Don't flag if it's an obvious www/non-www or trailing-slash diff;
          // more elaborate matching could be added later.
        }
      } catch {
        issues.push({
          module: "technical",
          severity: "warning",
          check: "invalid_canonical",
          title: "Page has an invalid canonical URL",
          description: `Canonical tag on ${page.finalUrl} couldn't be parsed.`,
          recommendation:
            "Make sure the canonical URL is an absolute, valid URL.",
          affectedUrl: page.finalUrl,
        });
      }
    }
  }
  if (pagesWithoutCanonical.length > 0 && crawl.pages.length > 0) {
    const ratio = pagesWithoutCanonical.length / crawl.pages.length;
    if (ratio > 0.5) {
      issues.push({
        module: "technical",
        severity: "warning",
        check: "missing_canonicals",
        title: `${pagesWithoutCanonical.length} of ${crawl.pages.length} pages have no canonical tag`,
        description:
          "Without a canonical tag, search engines may pick the wrong URL " +
          "as the primary version of a page, splitting ranking signals.",
        recommendation:
          'Add <link rel="canonical" href="..."> to every page\'s <head>, ' +
          "pointing at the preferred URL.",
        docsUrl:
          "https://developers.google.com/search/docs/crawling-indexing/canonicalization",
      });
    }
  } else if (crawl.pages.length > 0) {
    positives.push(
      `All ${crawl.pages.length} crawled pages have canonical tags.`
    );
  }
}

function normalizeForCanonical(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/$/, "")}`;
  } catch {
    return url;
  }
}

function evaluateMetaRobots(
  crawl: CrawlResult,
  issues: AuditIssue[],
  _positives: string[]
): void {
  const noindexedPages: string[] = [];
  for (const page of crawl.pages) {
    const directive = (page.meta.robots ?? "").toLowerCase();
    if (directive.includes("noindex")) {
      noindexedPages.push(page.finalUrl);
    }
  }
  if (noindexedPages.length === 0) return;

  // Check whether the homepage itself is noindexed — that's catastrophic.
  const homepageUrl = crawl.pages[0]?.finalUrl;
  const homepageNoindexed =
    homepageUrl &&
    noindexedPages.some(
      (u) => normalizeForCanonical(u) === normalizeForCanonical(homepageUrl)
    );

  if (homepageNoindexed) {
    issues.push({
      module: "technical",
      severity: "critical",
      check: "noindex_on_homepage",
      title: "Homepage is set to noindex",
      description:
        "The homepage has a meta robots tag (or X-Robots-Tag header) that " +
        "tells Google not to index it. The site cannot rank if the " +
        "homepage is excluded from the index.",
      recommendation:
        "Remove the noindex directive from the homepage's <head> tag and " +
        "any X-Robots-Tag header.",
      docsUrl:
        "https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag",
      affectedUrl: homepageUrl,
    });
  } else if (noindexedPages.length > 0) {
    issues.push({
      module: "technical",
      severity: "warning",
      check: "noindex_pages",
      title: `${noindexedPages.length} page${noindexedPages.length === 1 ? "" : "s"} set to noindex`,
      description:
        "Some pages have noindex directives. This may be intentional " +
        "(staging/admin pages) but is worth confirming for content pages.",
      recommendation:
        "Audit the noindexed pages and remove the directive from any page " +
        "that should be visible in search results.",
    });
  }
}

function evaluateOgTwitter(
  crawl: CrawlResult,
  issues: AuditIssue[],
  positives: string[]
): void {
  const homepage = crawl.pages[0];
  if (!homepage) return;

  const missingOg = !homepage.meta.ogTitle || !homepage.meta.ogImage;
  const missingTwitter = !homepage.meta.twitterCard;

  if (missingOg) {
    issues.push({
      module: "technical",
      severity: "warning",
      check: "missing_open_graph",
      title: "Homepage is missing Open Graph tags",
      description:
        "Without og:title and og:image, links shared on Facebook, " +
        "LinkedIn, and Slack render with no preview image or description.",
      recommendation:
        "Add og:title, og:description, og:image, and og:url meta tags to " +
        "the <head> of each page.",
      docsUrl: "https://ogp.me/",
    });
  } else {
    positives.push("Open Graph tags are present on the homepage.");
  }

  if (missingTwitter) {
    issues.push({
      module: "technical",
      severity: "info",
      check: "missing_twitter_card",
      title: "Homepage has no Twitter Card metadata",
      description:
        "Without twitter:card, X/Twitter falls back to a basic preview.",
      recommendation:
        'Add <meta name="twitter:card" content="summary_large_image"> ' +
        "and supporting twitter:title / twitter:image / twitter:description tags.",
    });
  }
}

function evaluateStructuredData(
  crawl: CrawlResult,
  issues: AuditIssue[],
  positives: string[]
): void {
  const homepage = crawl.pages[0];
  if (!homepage) return;
  if (homepage.meta.jsonLdBlocks.length === 0) {
    issues.push({
      module: "technical",
      severity: "info",
      check: "no_structured_data",
      title: "No JSON-LD structured data found on the homepage",
      description:
        "Structured data isn't a ranking signal directly, but it powers " +
        "rich results (review stars, FAQ snippets, breadcrumbs) that " +
        "increase click-through.",
      recommendation:
        "At minimum, add Organization or LocalBusiness schema to the " +
        "homepage. Use schema.org as a reference and validate at " +
        "validator.schema.org.",
      docsUrl: "https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data",
    });
  } else {
    positives.push(
      `Homepage has ${homepage.meta.jsonLdBlocks.length} JSON-LD block(s).`
    );
  }
}

function evaluateBrokenLinks(crawl: CrawlResult, issues: AuditIssue[]): void {
  if (crawl.brokenLinks.length === 0) return;
  const severity = crawl.brokenLinks.length > 5 ? "critical" : "warning";
  issues.push({
    module: "technical",
    severity,
    check: "broken_internal_links",
    title: `${crawl.brokenLinks.length} broken internal link${crawl.brokenLinks.length === 1 ? "" : "s"} found`,
    description:
      "Broken internal links waste crawl budget, leak link equity, and " +
      "create dead-ends for users.",
    recommendation:
      "Fix or remove the broken links. The raw audit data lists each " +
      "broken target with the page that linked to it.",
  });
}

function evaluateRedirectChains(crawl: CrawlResult, issues: AuditIssue[]): void {
  const chains = crawl.pages.filter((p: CrawledPage) => p.redirectCount > 1);
  if (chains.length === 0) return;
  issues.push({
    module: "technical",
    severity: "warning",
    check: "redirect_chains",
    title: `${chains.length} URL${chains.length === 1 ? "" : "s"} have redirect chains`,
    description:
      "Pages with more than one redirect hop slow down crawling and waste " +
      "link equity on each hop.",
    recommendation:
      "Update internal links and redirects to point directly at the final " +
      "URL, eliminating intermediate hops.",
  });
}
