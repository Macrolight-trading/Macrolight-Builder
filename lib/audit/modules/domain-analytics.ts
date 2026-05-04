/**
 * Domain Analytics module.
 *
 * Uses DataForSEO Labs to measure how well a site performs in organic search:
 *   - domain_rank_overview/live   — total organic keywords, estimated traffic, top positions
 *   - ranked_keywords/live        — top keywords the domain ranks for (up to 10)
 *   - competitors_domain/live     — top competing domains (up to 5)
 *
 * All three calls run in parallel. Each is wrapped in callDataForSeoWithTaskCheck
 * so a 40204 subscription error on any one call is surfaced as a named field in
 * rawData rather than silently producing empty results.
 *
 * Required env: DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD
 */

import { scoreModule } from "../scorer";
import {
  buildAuthHeaders,
  callDataForSeoWithTaskCheck,
  extractDomain,
  hasCredentials,
  numericOrNull,
} from "../dataforseo-client";
import { fetchKeywordGap, type KeywordGapEntry } from "../enrichments/keyword-gap";
import {
  fetchTopTrafficPages,
  type TopTrafficPage,
} from "../enrichments/top-pages-traffic";
import {
  fetchHistoricalTraffic,
  type HistoricalTrafficPoint,
} from "../enrichments/historical-traffic";
import type { AuditInput, AuditIssue, AuditModuleResult } from "../types";

// ── Public types (read by UI / PDF layers) ────────────────────────────────────

export interface RankedKeyword {
  keyword: string;
  position: number;
  searchVolume: number | null;
  url: string;
  cpc: number | null;
  competition: number | null; // 0–1 scale from Google Ads
}

export interface CompetitorItem {
  domain: string;
  intersections: number | null; // shared keywords with target domain
  organicCount: number | null;
  organicEtv: number | null;   // estimated monthly traffic visits
  avgPosition: number | null;
}

interface DomainOverview {
  organicCount: number | null; // total organic keyword rankings
  organicEtv: number | null;   // estimated monthly organic traffic visits
  paidCount: number | null;
  pos1: number | null;
  pos1to3: number | null;
  pos1to10: number | null;
}

export interface DomainAnalyticsRawData {
  overview: DomainOverview;
  rankedKeywords: RankedKeyword[];
  competitors: CompetitorItem[];
  /** Set when the overview call specifically failed (e.g. subscription). */
  overviewError?: string;
  rankedKeywordsError?: string;
  competitorsError?: string;
  // Enrichments — added in M7. Each is best-effort: an empty array just means
  // we couldn't fetch that piece, not that no data exists.
  keywordGap?: KeywordGapEntry[];
  topTrafficPages?: TopTrafficPage[];
  historicalTraffic?: HistoricalTrafficPoint[];
}

// ── Location / language defaults ──────────────────────────────────────────────

// 2840 = United States. These could later come from AuditInput if we add
// a location field to the audit creation form.
const LOCATION_CODE = 2840;
const LANGUAGE_CODE = "en";

// ── Entry point ───────────────────────────────────────────────────────────────

export async function runDomainAnalyticsAudit(
  input: AuditInput
): Promise<AuditModuleResult> {
  const issues: AuditIssue[] = [];
  const positives: string[] = [];

  if (!hasCredentials()) {
    return unavailable("DataForSEO credentials not configured (DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD)");
  }

  const target = extractDomain(input.url);
  if (!target) {
    return unavailable("Could not parse a domain from the audit URL");
  }

  console.log("[domain-analytics] starting — target:", target);

  let data: DomainAnalyticsRawData;
  try {
    data = await fetchDomainAnalyticsData(target);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return unavailable(`DataForSEO Labs API error: ${message}`);
  }

  console.log(
    "[domain-analytics] overview:",
    JSON.stringify(data.overview),
    "| keywords:", data.rankedKeywords.length,
    "| competitors:", data.competitors.length
  );

  // ── M7 enrichments — run in parallel after the core data is in. ─────────
  // Each is best-effort. We need competitors for the keyword gap; if the
  // competitors call failed, just skip that one.
  const competitorDomains = data.competitors.map((c) => c.domain).filter(Boolean);
  const [keywordGap, topTrafficPages, historicalTraffic] = await Promise.all([
    competitorDomains.length > 0
      ? fetchKeywordGap(target, competitorDomains)
      : Promise.resolve([] as KeywordGapEntry[]),
    fetchTopTrafficPages(target),
    fetchHistoricalTraffic(target),
  ]);

  data.keywordGap = keywordGap;
  data.topTrafficPages = topTrafficPages;
  data.historicalTraffic = historicalTraffic;

  console.log(
    "[domain-analytics] enrichments — keywordGap:", keywordGap.length,
    "| topTrafficPages:", topTrafficPages.length,
    "| historicalTraffic:", historicalTraffic.length
  );

  evaluateOrganicTraffic(data.overview, issues, positives);
  evaluateOrganicKeywords(data.overview, issues, positives);
  evaluateTopPositions(data.overview, issues, positives);
  evaluateRankedKeywords(data.rankedKeywords, issues, positives);
  evaluateHistoricalTrend(historicalTraffic, issues, positives);

  return {
    module: "domainAnalytics",
    available: true,
    score: scoreModule(issues),
    issues,
    rawData: data,
    positives,
  };
}

/**
 * Compare the most-recent historical traffic point against the value 6 and
 * 12 months ago. Big drops are a strong narrative ("traffic is down 40% YoY")
 * and worth flagging as findings.
 */
function evaluateHistoricalTrend(
  history: HistoricalTrafficPoint[],
  issues: AuditIssue[],
  positives: string[]
): void {
  if (history.length < 7) return; // need at least ~6 months of data

  const latest = history[history.length - 1];
  const sixMonthsAgo = history[Math.max(0, history.length - 7)];
  const twelveMonthsAgo = history[0];

  if (latest.organicEtv == null) return;

  const compare = (
    earlier: HistoricalTrafficPoint | undefined,
    label: string
  ): void => {
    if (!earlier?.organicEtv || earlier.organicEtv <= 0) return;
    const delta = latest.organicEtv! - earlier.organicEtv;
    const pct = delta / earlier.organicEtv;
    if (pct <= -0.3) {
      issues.push({
        module: "domainAnalytics",
        severity: pct <= -0.5 ? "critical" : "warning",
        check: `traffic_decline_${label}`,
        title: `Estimated organic traffic is down ${Math.abs(Math.round(pct * 100))}% vs. ${label}`,
        description:
          `${earlier.month}: ~${earlier.organicEtv!.toLocaleString()} est. monthly visits → ` +
          `${latest.month}: ~${latest.organicEtv!.toLocaleString()}. ` +
          "Sustained traffic decline is a strong indicator of a Google algorithm hit, " +
          "lost rankings on key pages, or technical issues introduced over the period.",
        recommendation:
          "Cross-reference the decline window with Google's algorithm-update timeline " +
          "and any site changes. Identify which pages lost traffic (use the top-pages " +
          "data) and audit them for content quality, link profile, and technical health.",
      });
    } else if (pct >= 0.3) {
      positives.push(
        `Estimated organic traffic is up ${Math.round(pct * 100)}% vs. ${label}.`
      );
    }
  };

  compare(sixMonthsAgo, "6 months ago");
  compare(twelveMonthsAgo, "12 months ago");
}

function unavailable(reason: string): AuditModuleResult {
  return {
    module: "domainAnalytics",
    available: false,
    unavailableReason: reason,
    score: 0,
    issues: [],
    rawData: {
      overview: emptyOverview(),
      rankedKeywords: [],
      competitors: [],
    } as DomainAnalyticsRawData,
    positives: [],
  };
}

// ── DataForSEO API ────────────────────────────────────────────────────────────

async function fetchDomainAnalyticsData(
  target: string
): Promise<DomainAnalyticsRawData> {
  const headers = buildAuthHeaders();
  const basePayload = { target, language_code: LANGUAGE_CODE, location_code: LOCATION_CODE };

  // Run all three calls concurrently; wrap each in its own try/catch so a
  // subscription failure on one doesn't kill the whole module.
  const [overview, rankedKeywords, competitors] = await Promise.all([
    fetchOverview(target, headers),
    fetchRankedKeywords(target, headers, basePayload),
    fetchCompetitors(target, headers, basePayload),
  ]);

  return { ...overview, ...rankedKeywords, ...competitors };
}

async function fetchOverview(
  target: string,
  headers: Record<string, string>
): Promise<Pick<DomainAnalyticsRawData, "overview" | "overviewError">> {
  try {
    const res = await callDataForSeoWithTaskCheck(
      "/dataforseo_labs/google/domain_rank_overview/live",
      [{ target, language_code: LANGUAGE_CODE, location_code: LOCATION_CODE }],
      headers
    );
    console.log(
      "[domain-analytics] overview raw:",
      JSON.stringify(res).slice(0, 600)
    );
    return { overview: parseOverview(res) };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[domain-analytics] overview call failed:", msg);
    return { overview: emptyOverview(), overviewError: msg };
  }
}

async function fetchRankedKeywords(
  target: string,
  headers: Record<string, string>,
  basePayload: Record<string, unknown>
): Promise<Pick<DomainAnalyticsRawData, "rankedKeywords" | "rankedKeywordsError">> {
  try {
    const res = await callDataForSeoWithTaskCheck(
      "/dataforseo_labs/google/ranked_keywords/live",
      [{
        ...basePayload,
        limit: 10,
        // Sort by search volume DESC so the displayed "top keywords" are
        // actually impactful — the previous order (rank_absolute ASC) gave
        // alphabetical-first results when there were ties at position 1
        // (Amazon's #1 rankings start with "0 0 60", "0 1 micrometer", etc.).
        // Restricting to top-10 organic positions also keeps low-volume
        // long-tails from drowning out real rankings.
        order_by: ["keyword_data.keyword_info.search_volume,desc"],
        filters: [
          ["ranked_serp_element.serp_item.type", "=", "organic"],
          "and",
          ["ranked_serp_element.serp_item.rank_absolute", "<=", 10],
        ],
      }],
      headers
    );
    console.log(
      "[domain-analytics] ranked_keywords raw:",
      JSON.stringify(res).slice(0, 600)
    );
    return { rankedKeywords: parseRankedKeywords(res) };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[domain-analytics] ranked_keywords call failed:", msg);
    return { rankedKeywords: [], rankedKeywordsError: msg };
  }
}

async function fetchCompetitors(
  target: string,
  headers: Record<string, string>,
  basePayload: Record<string, unknown>
): Promise<Pick<DomainAnalyticsRawData, "competitors" | "competitorsError">> {
  try {
    const res = await callDataForSeoWithTaskCheck(
      "/dataforseo_labs/google/competitors_domain/live",
      [{ ...basePayload, limit: 5, filters: ["full_domain_metrics.organic.count", ">", 0] }],
      headers
    );
    console.log(
      "[domain-analytics] competitors raw:",
      JSON.stringify(res).slice(0, 600)
    );
    return { competitors: parseCompetitors(res) };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[domain-analytics] competitors call failed:", msg);
    return { competitors: [], competitorsError: msg };
  }
}

// ── Parsers ───────────────────────────────────────────────────────────────────

function parseOverview(res: Awaited<ReturnType<typeof callDataForSeoWithTaskCheck>>): DomainOverview {
  // Structure: tasks[0].result[0] with nested metrics.organic / metrics.paid
  const result = res.tasks?.[0]?.result?.[0] as Record<string, unknown> | undefined;
  if (!result) return emptyOverview();

  const organic = (result.metrics as Record<string, unknown> | undefined)
    ?.organic as Record<string, unknown> | undefined;
  const paid = (result.metrics as Record<string, unknown> | undefined)
    ?.paid as Record<string, unknown> | undefined;

  const pos1 = numericOrNull(organic?.pos_1) ?? 0;
  const pos2_3 = numericOrNull(organic?.pos_2_3) ?? 0;
  const pos4_10 = numericOrNull(organic?.pos_4_10) ?? 0;

  return {
    organicCount: numericOrNull(organic?.count),
    organicEtv: numericOrNull(organic?.etv),
    paidCount: numericOrNull(paid?.count),
    pos1,
    pos1to3: pos1 + pos2_3,
    pos1to10: pos1 + pos2_3 + pos4_10,
  };
}

function parseRankedKeywords(
  res: Awaited<ReturnType<typeof callDataForSeoWithTaskCheck>>
): RankedKeyword[] {
  // Structure: tasks[0].result[0].items[]
  const result = res.tasks?.[0]?.result?.[0] as
    | { items?: Array<Record<string, unknown>> }
    | undefined;
  if (!result?.items) return [];

  return result.items.slice(0, 10).flatMap((item) => {
    const kwData = item.keyword_data as Record<string, unknown> | undefined;
    const kwInfo = kwData?.keyword_info as Record<string, unknown> | undefined;
    const serpItem = (
      (item.ranked_serp_element as Record<string, unknown> | undefined)
        ?.serp_item as Record<string, unknown> | undefined
    );

    const keyword = typeof kwData?.keyword === "string" ? kwData.keyword : null;
    if (!keyword) return [];

    return [{
      keyword,
      position: numericOrNull(serpItem?.rank_absolute) ?? 999,
      searchVolume: numericOrNull(kwInfo?.search_volume),
      url: typeof serpItem?.url === "string" ? serpItem.url : "",
      cpc: numericOrNull(kwInfo?.cpc),
      competition: numericOrNull(kwInfo?.competition),
    }];
  });
}

function parseCompetitors(
  res: Awaited<ReturnType<typeof callDataForSeoWithTaskCheck>>
): CompetitorItem[] {
  const result = res.tasks?.[0]?.result?.[0] as
    | { items?: Array<Record<string, unknown>> }
    | undefined;
  if (!result?.items) return [];

  return result.items.slice(0, 5).flatMap((item) => {
    const domain = typeof item.domain === "string" ? item.domain : null;
    if (!domain) return [];
    const metrics = (item.full_domain_metrics as Record<string, unknown> | undefined)
      ?.organic as Record<string, unknown> | undefined;

    return [{
      domain,
      intersections: numericOrNull(item.intersections),
      organicCount: numericOrNull(metrics?.count),
      organicEtv: numericOrNull(metrics?.etv),
      avgPosition: numericOrNull(item.avg_position),
    }];
  });
}

// ── Evaluators ────────────────────────────────────────────────────────────────

function evaluateOrganicTraffic(
  o: DomainOverview,
  issues: AuditIssue[],
  positives: string[]
): void {
  // Only fire the sentinel on a CONFIRMED zero. Null means "we couldn't get
  // a number" — that's a data-availability problem, not a finding about the
  // site (e.g. Amazon often comes back null on free DataForSEO tiers).
  // Without this guard we'd score Amazon at 50/100 because of a missing API
  // response.
  if (o.organicEtv === 0) {
    issues.push({
      module: "domainAnalytics",
      severity: "critical",
      sentinel: true,
      check: "no_organic_traffic",
      title: "No estimated organic traffic",
      description:
        "DataForSEO Labs estimates this site receives zero organic visitors " +
        "per month. This usually means the site has very few or no keyword " +
        "rankings.",
      recommendation:
        "Build content targeting keywords your customers search for. " +
        "Start with long-tail, low-competition queries that match your services.",
    });
    return;
  }

  if (o.organicEtv == null) {
    return;
  }

  if (o.organicEtv < 50) {
    issues.push({
      module: "domainAnalytics",
      severity: "warning",
      check: "low_organic_traffic",
      title: `Very low estimated organic traffic (~${o.organicEtv.toLocaleString()} visits/month)`,
      description:
        "Estimated organic traffic is below 50 visits per month. " +
        "This indicates limited search visibility.",
      recommendation:
        "Focus on topical authority in your niche. Publish service pages and " +
        "location pages targeting local intent queries.",
    });
  } else if (o.organicEtv >= 500) {
    positives.push(
      `Estimated organic traffic is ~${o.organicEtv.toLocaleString()} visits/month — solid search visibility.`
    );
  }
}

function evaluateOrganicKeywords(
  o: DomainOverview,
  issues: AuditIssue[],
  positives: string[]
): void {
  // Only fire the "no rankings" critical on a CONFIRMED zero. Null means
  // "the overview endpoint didn't return numbers" — that can happen when
  // the user's DataForSEO subscription doesn't cover the domain (Amazon)
  // even though ranked_keywords/live still returns rows.
  if (o.organicCount === 0) {
    if (o.organicEtv !== null && o.organicEtv !== 0) {
      issues.push({
        module: "domainAnalytics",
        severity: "critical",
        check: "no_organic_keywords",
        title: "No organic keyword rankings detected",
        description:
          "Google does not appear to be ranking this site for any keywords. " +
          "This is a significant visibility problem.",
        recommendation:
          "Ensure the site is indexed (check Google Search Console). " +
          "Then invest in on-page content and link building for target keywords.",
      });
    }
    return;
  }
  if (o.organicCount === null) return;

  if (o.organicCount < 20) {
    issues.push({
      module: "domainAnalytics",
      severity: "warning",
      check: "few_organic_keywords",
      title: `Only ${o.organicCount} organic keyword rankings`,
      description:
        "The site ranks for very few keywords, limiting its search footprint.",
      recommendation:
        "Expand content to target more queries: FAQ pages, service variants, " +
        "location-specific landing pages, and blog content.",
    });
  } else if (o.organicCount >= 100) {
    positives.push(`Ranking for ${o.organicCount.toLocaleString()} organic keywords — healthy search footprint.`);
  }
}

function evaluateTopPositions(
  o: DomainOverview,
  issues: AuditIssue[],
  positives: string[]
): void {
  if (o.organicCount === null || o.organicCount === 0) return;

  if (o.pos1to10 === 0) {
    issues.push({
      module: "domainAnalytics",
      severity: "warning",
      check: "no_top10_keywords",
      title: "No keywords ranking in the top 10",
      description:
        "The site has keyword rankings but none appear on page 1 of Google. " +
        "Page 2+ results receive almost no clicks.",
      recommendation:
        "Identify the keywords closest to page 1 (positions 11–20) and " +
        "prioritise them for content improvement, internal linking, and backlink building.",
    });
  } else {
    if (o.pos1 && o.pos1 > 0) {
      positives.push(`${o.pos1} keyword${o.pos1 === 1 ? "" : "s"} ranking at position #1.`);
    } else if (o.pos1to3 && o.pos1to3 > 0) {
      positives.push(`${o.pos1to3} keyword${o.pos1to3 === 1 ? "" : "s"} in the top 3 positions.`);
    } else if (o.pos1to10 && o.pos1to10 > 0) {
      positives.push(`${o.pos1to10} keyword${o.pos1to10 === 1 ? "" : "s"} ranking on page 1.`);
    }
  }
}

function evaluateRankedKeywords(
  keywords: RankedKeyword[],
  issues: AuditIssue[],
  positives: string[]
): void {
  if (keywords.length === 0) return;

  // Find any high-volume keywords ranking in positions 11-20 (page 2 opportunities).
  const page2Opportunities = keywords.filter(
    (kw) => kw.position >= 11 && kw.position <= 20 && (kw.searchVolume ?? 0) > 100
  );

  if (page2Opportunities.length > 0) {
    const top = page2Opportunities[0];
    issues.push({
      module: "domainAnalytics",
      severity: "info",
      check: "page2_keyword_opportunities",
      title: `${page2Opportunities.length} keyword${page2Opportunities.length === 1 ? "" : "s"} close to page 1 (positions 11–20)`,
      description:
        `"${top.keyword}" (position ${top.position}, ~${top.searchVolume?.toLocaleString() ?? "?"} searches/month) ` +
        `and ${page2Opportunities.length - 1} other${page2Opportunities.length === 1 ? "" : "s"} are just off page 1. ` +
        "These are low-hanging fruit for a traffic boost.",
      recommendation:
        "Strengthen these pages with better content, internal links from high-authority pages, " +
        "and targeted backlinks from relevant sites.",
    });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function emptyOverview(): DomainOverview {
  return {
    organicCount: null,
    organicEtv: null,
    paidCount: null,
    pos1: null,
    pos1to3: null,
    pos1to10: null,
  };
}
