import { crawl } from "../crawler";
import { scoreModule } from "../scorer";
import type { AuditInput, AuditIssue, AuditModuleResult } from "../types";

/**
 * Technical SEO module.
 *
 * STATUS: Scaffolding stub.
 *
 * Production implementation (per plan section 3.1) will check:
 *   - Core Web Vitals (LCP, INP, CLS) via PageSpeed Insights API
 *   - Mobile usability + Performance score via PageSpeed Insights
 *   - Page speed (TTFB, FCP) via PageSpeed Insights
 *   - HTTPS / SSL (URL scheme + cert validity)
 *   - robots.txt presence + validity (parsed by crawler)
 *   - XML sitemap presence + reachability
 *   - Canonical tag correctness across crawled pages
 *   - Meta robots tags (noindex / nofollow on important pages)
 *   - Broken internal links
 *   - Redirect chains > 1 hop
 *   - Missing / duplicate title + meta description across pages
 *   - Open Graph / Twitter Card presence
 *   - JSON-LD structured data presence
 *
 * Data sources: Google PageSpeed Insights API + shared crawler.
 *
 * Required env: GOOGLE_PAGESPEED_API_KEY
 */

const PAGESPEED_ENDPOINT =
  "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

interface PageSpeedRawData {
  performance: number | null;
  seo: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  lcp: number | null;
  inp: number | null;
  cls: number | null;
  ttfb: number | null;
  fcp: number | null;
}

export async function runTechnicalAudit(
  input: AuditInput
): Promise<AuditModuleResult> {
  const issues: AuditIssue[] = [];
  const positives: string[] = [];

  // STUB: invoke crawler so the call site is wired up; result unused for now.
  const crawlResult = await crawl(input.url, { maxPages: input.crawlLimit });
  void crawlResult;

  // STUB: fetch PageSpeed Insights data.
  const pageSpeedData = await fetchPageSpeedInsights(input.url).catch(
    (err: unknown) => {
      issues.push({
        module: "technical",
        severity: "warning",
        check: "pagespeed_api_unavailable",
        title: "Could not retrieve PageSpeed Insights data",
        description:
          "The Google PageSpeed Insights API call failed. Performance, " +
          "Core Web Vitals, and SEO scores were not captured.",
        recommendation:
          "Verify GOOGLE_PAGESPEED_API_KEY is set and the audited URL is " +
          "publicly reachable. Re-run the audit.",
        docsUrl: "https://developers.google.com/speed/docs/insights/v5/get-started",
      });
      return {
        performance: null,
        seo: null,
        accessibility: null,
        bestPractices: null,
        lcp: null,
        inp: null,
        cls: null,
        ttfb: null,
        fcp: null,
        _error: err instanceof Error ? err.message : String(err),
      } as PageSpeedRawData & { _error: string };
    }
  );

  // TODO(milestone-1): convert PageSpeed metrics into severity-tagged issues.
  // TODO(milestone-2): convert crawler findings (robots.txt, sitemap, broken
  // links, canonicals, OG tags, JSON-LD) into issues.

  return {
    module: "technical",
    score: scoreModule(issues),
    issues,
    rawData: { pageSpeed: pageSpeedData },
    positives,
  };
}

/**
 * STUB: Call the PageSpeed Insights API.
 *
 * Real implementation will:
 *   - Hit `/runPagespeed` for both `mobile` and `desktop` strategies
 *   - Extract performance, accessibility, best-practices, seo scores
 *   - Extract LCP, INP, CLS, TTFB, FCP from lighthouseResult.audits
 *   - Time out after ~30s
 *
 * Returns null fields without throwing so callers can degrade gracefully.
 */
async function fetchPageSpeedInsights(url: string): Promise<PageSpeedRawData> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_PAGESPEED_API_KEY is not set");
  }

  // TODO(milestone-1): real fetch implementation.
  void url;
  void PAGESPEED_ENDPOINT;

  return {
    performance: null,
    seo: null,
    accessibility: null,
    bestPractices: null,
    lcp: null,
    inp: null,
    cls: null,
    ttfb: null,
    fcp: null,
  };
}
