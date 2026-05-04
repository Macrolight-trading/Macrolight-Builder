/**
 * SERP Visibility module.
 *
 * Uses the DataForSEO SERP API to search for the client's brand name and
 * evaluate how well they appear in Google's results:
 *   - Brand organic position (are they #1 for their own name?)
 *   - SERP feature presence (local pack, featured snippet, knowledge graph)
 *   - AI Overview presence and citation
 *
 * Search query = input.clientName (brand name auto-detection).
 * Location defaults to US (2840) / English.
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
import type { AuditInput, AuditIssue, AuditModuleResult } from "../types";

// ── Public types ──────────────────────────────────────────────────────────────

export interface SerpOrganicResult {
  position: number;
  domain: string;
  url: string;
  title: string;
  description: string;
}

export interface AiOverviewSource {
  url: string;
  domain: string;
  title: string;
}

export interface SerpVisibilityRawData {
  keyword: string;
  /** Position of the audited domain in organic results, null if not found in top 20 */
  brandPosition: number | null;
  /** All SERP feature types present in results (e.g. "local_pack", "ai_overview") */
  serpFeatureTypes: string[];
  hasAiOverview: boolean;
  /** Does the AI Overview cite / link to the audited domain? */
  aiOverviewCitesDomain: boolean;
  aiOverviewSources: AiOverviewSource[];
  topOrganicResults: SerpOrganicResult[];
  serpError?: string;
  // ── M9 additions ──────────────────────────────────────────────────────────
  /** Per commercial-keyword SERP results (one entry per service keyword). */
  commercialQueries?: CommercialQueryResult[];
  /** Google AI Mode result for the brand keyword, if the endpoint returned data. */
  aiMode?: AiModeResult;
}

export interface CommercialQueryResult {
  keyword: string;
  brandPosition: number | null;
  topThree: Array<{ position: number; domain: string; title: string }>;
  serpFeatureTypes: string[];
  error?: string;
}

export interface AiModeResult {
  /** Whether the AI Mode endpoint actually returned an AI-generated answer. */
  hasAiAnswer: boolean;
  /** Domains cited inside the AI Mode answer. */
  citedDomains: string[];
  /** True if the audited domain is among the cited sources. */
  citesAuditedDomain: boolean;
  error?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const LOCATION_CODE = 2840; // United States
const LANGUAGE_CODE = "en";

// SERP feature types that indicate good local/rich presence
const POSITIVE_FEATURE_TYPES = new Set([
  "local_pack",
  "featured_snippet",
  "knowledge_graph",
  "carousel",
  "top_stories",
]);

// ── Entry point ───────────────────────────────────────────────────────────────

export async function runSerpVisibilityAudit(
  input: AuditInput
): Promise<AuditModuleResult> {
  const issues: AuditIssue[] = [];
  const positives: string[] = [];

  if (!hasCredentials()) {
    return unavailable("DataForSEO credentials not configured (DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD)");
  }

  const domain = extractDomain(input.url);
  if (!domain) {
    return unavailable("Could not parse a domain from the audit URL");
  }

  // Use clientName as the brand search query.
  const keyword = input.clientName.trim();
  if (!keyword) {
    return unavailable("Client name is required for SERP visibility check");
  }

  console.log("[serp-visibility] starting — keyword:", keyword, "| domain:", domain);

  let data: SerpVisibilityRawData;
  try {
    data = await fetchSerpData(keyword, domain);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return unavailable(`SERP API error: ${message}`);
  }

  console.log(
    "[serp-visibility] brandPosition:", data.brandPosition,
    "| features:", data.serpFeatureTypes.join(", "),
    "| aiOverview:", data.hasAiOverview,
    "| aiCitesDomain:", data.aiOverviewCitesDomain
  );

  // ── M9: commercial-intent SERPs + Google AI Mode ─────────────────────────
  // Fire both in parallel — both are best-effort enhancements on top of the
  // brand-name SERP data we already have.
  const serviceKeywords = (input.serviceKeywords ?? [])
    .map((k) => k.trim())
    .filter((k) => k.length > 0)
    .slice(0, 3); // cap — each call is paid

  const [commercialQueries, aiMode] = await Promise.all([
    serviceKeywords.length > 0
      ? Promise.all(
          serviceKeywords.map((kw) => fetchCommercialSerp(kw, domain))
        )
      : Promise.resolve([] as CommercialQueryResult[]),
    fetchAiMode(keyword, domain),
  ]);

  data.commercialQueries = commercialQueries;
  data.aiMode = aiMode;

  evaluateBrandVisibility(data, domain, issues, positives);
  evaluateSerpFeatures(data, issues, positives);
  evaluateAiOverview(data, domain, issues, positives);
  evaluateCommercialQueries(commercialQueries, domain, issues, positives);
  evaluateAiMode(aiMode, domain, issues, positives);

  return {
    module: "serpVisibility",
    available: true,
    score: scoreModule(issues),
    issues,
    rawData: data,
    positives,
  };
}

// ── M9: commercial-keyword SERP ────────────────────────────────────────────

async function fetchCommercialSerp(
  keyword: string,
  auditedDomain: string
): Promise<CommercialQueryResult> {
  const headers = buildAuthHeaders();
  try {
    const res = await callDataForSeoWithTaskCheck(
      "/serp/google/organic/live/advanced",
      [{
        keyword,
        location_code: LOCATION_CODE,
        language_code: LANGUAGE_CODE,
        device: "desktop",
        os: "windows",
        depth: 20,
      }],
      headers
    );

    const items =
      (res.tasks?.[0]?.result?.[0] as
        | { items?: Array<Record<string, unknown>> }
        | undefined)?.items ?? [];

    const featureTypes = new Set<string>();
    let brandPosition: number | null = null;
    const topThree: CommercialQueryResult["topThree"] = [];

    for (const item of items) {
      const type = typeof item.type === "string" ? item.type : "";
      featureTypes.add(type);
      if (type !== "organic") continue;

      const position = numericOrNull(item.rank_absolute) ?? 999;
      const itemDomain =
        typeof item.domain === "string"
          ? item.domain.replace(/^www\./, "")
          : "";
      const title = typeof item.title === "string" ? item.title : "";

      if (
        brandPosition === null &&
        itemDomain &&
        (itemDomain === auditedDomain || itemDomain.endsWith(`.${auditedDomain}`))
      ) {
        brandPosition = position;
      }
      if (topThree.length < 3 && position <= 3) {
        topThree.push({ position, domain: itemDomain, title });
      }
    }

    return {
      keyword,
      brandPosition,
      topThree,
      serpFeatureTypes: Array.from(featureTypes),
    };
  } catch (err: unknown) {
    return {
      keyword,
      brandPosition: null,
      topThree: [],
      serpFeatureTypes: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ── M9: Google AI Mode ─────────────────────────────────────────────────────

async function fetchAiMode(
  keyword: string,
  auditedDomain: string
): Promise<AiModeResult> {
  const headers = buildAuthHeaders();
  try {
    const res = await callDataForSeoWithTaskCheck(
      "/serp/google/ai_mode/live/advanced",
      [{
        keyword,
        location_code: LOCATION_CODE,
        language_code: LANGUAGE_CODE,
      }],
      headers
    );

    const result = res.tasks?.[0]?.result?.[0] as
      | { items?: Array<Record<string, unknown>> }
      | undefined;
    const items = result?.items ?? [];

    if (items.length === 0) {
      return { hasAiAnswer: false, citedDomains: [], citesAuditedDomain: false };
    }

    const citedDomains = new Set<string>();
    for (const item of items) {
      // AI Mode returns nested items containing source links.
      const nested = (item.items as Array<Record<string, unknown>> | undefined) ?? [];
      for (const src of nested) {
        const d =
          typeof src.domain === "string"
            ? src.domain.replace(/^www\./, "")
            : tryExtractDomain(typeof src.url === "string" ? src.url : "");
        if (d) citedDomains.add(d);
      }
    }

    return {
      hasAiAnswer: true,
      citedDomains: Array.from(citedDomains),
      citesAuditedDomain: Array.from(citedDomains).some(
        (d) => d === auditedDomain || d.endsWith(`.${auditedDomain}`)
      ),
    };
  } catch (err: unknown) {
    return {
      hasAiAnswer: false,
      citedDomains: [],
      citesAuditedDomain: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ── M9 evaluators ─────────────────────────────────────────────────────────

function evaluateCommercialQueries(
  queries: CommercialQueryResult[],
  domain: string,
  issues: AuditIssue[],
  positives: string[]
): void {
  const valid = queries.filter((q) => !q.error);
  if (valid.length === 0) return;

  const ranking = valid.filter((q) => q.brandPosition !== null && q.brandPosition <= 10);
  if (ranking.length === 0) {
    issues.push({
      module: "serpVisibility",
      severity: "critical",
      sentinel: true,
      check: "no_commercial_serp_visibility",
      title: `${domain} doesn't appear in the top 10 organic results for any of ${valid.length} commercial keywords`,
      description:
        `Commercial-intent search terms drive most of the high-value clicks ` +
        "for service businesses. Being absent from the top 10 means missing " +
        "the entire flow of prospect-driven organic traffic.",
      recommendation:
        "Build dedicated, depth-rich service pages targeting each keyword. " +
        "Earn topical backlinks. Use structured data (Service, FAQ) to " +
        "support relevance signals.",
    });
  } else if (ranking.length < valid.length) {
    const missing = valid.filter((q) => q.brandPosition === null || q.brandPosition > 10);
    issues.push({
      module: "serpVisibility",
      severity: "warning",
      check: "partial_commercial_serp_visibility",
      title: `Ranking in top 10 for ${ranking.length} of ${valid.length} commercial keywords`,
      description:
        `Missing visibility on: ${missing.map((q) => `"${q.keyword}"`).join(", ")}.`,
      recommendation:
        "Audit which pages target the missing keywords (or build them if " +
        "they don't exist). Internal linking from already-ranking pages " +
        "transfers authority.",
    });
  } else {
    positives.push(
      `Ranks in the top 10 for all ${ranking.length} commercial keywords audited.`
    );
  }
}

function evaluateAiMode(
  ai: AiModeResult,
  domain: string,
  issues: AuditIssue[],
  positives: string[]
): void {
  if (ai.error || !ai.hasAiAnswer) return; // nothing to evaluate

  if (ai.citesAuditedDomain) {
    positives.push(
      `Cited as a source in Google's AI Mode answer for the brand query — strong AI search presence.`
    );
  } else {
    issues.push({
      module: "serpVisibility",
      severity: "info",
      check: "ai_mode_not_cited",
      title: `Google's AI Mode answer doesn't cite ${domain}`,
      description:
        ai.citedDomains.length > 0
          ? `It cites: ${ai.citedDomains.slice(0, 3).join(", ")}.`
          : "No source domains were captured in the AI Mode response.",
      recommendation:
        "AI Mode favours authoritative, factual content with clear E-E-A-T " +
        "signals. Add author bios with credentials, link to reputable " +
        "sources, and create FAQ/HowTo content that directly answers " +
        "common queries.",
    });
  }
}

function unavailable(reason: string): AuditModuleResult {
  return {
    module: "serpVisibility",
    available: false,
    unavailableReason: reason,
    score: 0,
    issues: [],
    rawData: {
      keyword: "",
      brandPosition: null,
      serpFeatureTypes: [],
      hasAiOverview: false,
      aiOverviewCitesDomain: false,
      aiOverviewSources: [],
      topOrganicResults: [],
    } as SerpVisibilityRawData,
    positives: [],
  };
}

// ── DataForSEO API ────────────────────────────────────────────────────────────

async function fetchSerpData(
  keyword: string,
  domain: string
): Promise<SerpVisibilityRawData> {
  const headers = buildAuthHeaders();

  let serpError: string | undefined;
  let rawItems: Array<Record<string, unknown>> = [];

  try {
    const res = await callDataForSeoWithTaskCheck(
      "/serp/google/organic/live/advanced",
      [{
        keyword,
        location_code: LOCATION_CODE,
        language_code: LANGUAGE_CODE,
        device: "desktop",
        os: "windows",
        depth: 20, // fetch top 20 results so we catch brand even if not #1
      }],
      headers
    );

    console.log(
      "[serp-visibility] raw SERP response:",
      JSON.stringify(res).slice(0, 800)
    );

    const result = res.tasks?.[0]?.result?.[0] as
      | { items?: Array<Record<string, unknown>> }
      | undefined;
    rawItems = result?.items ?? [];
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[serp-visibility] SERP call failed:", msg);
    serpError = msg;
  }

  return parseSerpResults(keyword, domain, rawItems, serpError);
}

function parseSerpResults(
  keyword: string,
  domain: string,
  items: Array<Record<string, unknown>>,
  serpError?: string
): SerpVisibilityRawData {
  const organicItems: SerpOrganicResult[] = [];
  const featureTypes = new Set<string>();
  let brandPosition: number | null = null;
  let hasAiOverview = false;
  let aiOverviewCitesDomain = false;
  const aiOverviewSources: AiOverviewSource[] = [];

  for (const item of items) {
    const type = typeof item.type === "string" ? item.type : "unknown";
    featureTypes.add(type);

    if (type === "organic") {
      const itemDomain = typeof item.domain === "string"
        ? item.domain.replace(/^www\./, "")
        : "";
      const position = numericOrNull(item.rank_absolute) ?? 999;

      organicItems.push({
        position,
        domain: itemDomain,
        url: typeof item.url === "string" ? item.url : "",
        title: typeof item.title === "string" ? item.title : "",
        description: typeof item.description === "string" ? item.description : "",
      });

      // Check if this is our domain (first occurrence = highest position).
      if (
        brandPosition === null &&
        (itemDomain === domain || itemDomain.endsWith(`.${domain}`))
      ) {
        brandPosition = position;
      }
    }

    if (type === "ai_overview") {
      hasAiOverview = true;
      // AI overview may cite source URLs inside its own items array.
      const nestedItems = (item.items as Array<Record<string, unknown>> | undefined) ?? [];
      for (const src of nestedItems) {
        const srcUrl = typeof src.url === "string" ? src.url : "";
        const srcDomain = typeof src.domain === "string"
          ? src.domain.replace(/^www\./, "")
          : tryExtractDomain(srcUrl);
        const srcTitle = typeof src.title === "string" ? src.title : "";

        aiOverviewSources.push({ url: srcUrl, domain: srcDomain, title: srcTitle });

        if (srcDomain === domain || srcDomain.endsWith(`.${domain}`)) {
          aiOverviewCitesDomain = true;
        }
      }
    }
  }

  return {
    keyword,
    brandPosition,
    serpFeatureTypes: Array.from(featureTypes),
    hasAiOverview,
    aiOverviewCitesDomain,
    aiOverviewSources,
    topOrganicResults: organicItems.slice(0, 10),
    serpError,
  };
}

// ── Evaluators ────────────────────────────────────────────────────────────────

function evaluateBrandVisibility(
  data: SerpVisibilityRawData,
  domain: string,
  issues: AuditIssue[],
  positives: string[]
): void {
  if (data.serpError) {
    // Don't score the domain if we couldn't even run the search.
    return;
  }

  if (data.brandPosition === null) {
    issues.push({
      module: "serpVisibility",
      severity: "critical",
      check: "brand_not_ranking",
      title: `"${data.keyword}" search — domain not found in top 20`,
      description:
        `${domain} does not appear in the first 20 Google results when searching ` +
        `for "${data.keyword}". This is a serious brand visibility problem — ` +
        "potential customers searching for the business may not find it.",
      recommendation:
        "Ensure the homepage is indexed and targets the business name prominently. " +
        "Build branded backlinks (press, directories, social profiles) and create " +
        "a Google Business Profile.",
    });
  } else if (data.brandPosition > 1) {
    issues.push({
      module: "serpVisibility",
      severity: "warning",
      check: "brand_not_first",
      title: `"${data.keyword}" search — ranking at position #${data.brandPosition} (not #1)`,
      description:
        `${domain} appears at position ${data.brandPosition} for its own brand name. ` +
        "Ideally a brand should own the #1 spot for its own name — losing it to " +
        "a directory, review site, or competitor is a credibility issue.",
      recommendation:
        "Strengthen the homepage with prominent brand mentions, structured data " +
        "(Organization schema), and consistent NAP across directories. " +
        "Build more branded citations.",
    });
  } else {
    positives.push(`Ranks #1 for "${data.keyword}" — owns its brand SERP.`);
  }
}

function evaluateSerpFeatures(
  data: SerpVisibilityRawData,
  issues: AuditIssue[],
  positives: string[]
): void {
  const presentFeatures = data.serpFeatureTypes.filter((f) =>
    POSITIVE_FEATURE_TYPES.has(f)
  );

  if (presentFeatures.includes("local_pack")) {
    positives.push(`Local Pack present in the "${data.keyword}" SERP — local intent is active.`);
  }
  if (presentFeatures.includes("featured_snippet")) {
    positives.push(`Featured Snippet present in the "${data.keyword}" SERP — opportunity to capture zero-click traffic.`);
  }
  if (presentFeatures.includes("knowledge_graph")) {
    positives.push(`Knowledge Graph present for "${data.keyword}" — Google has established entity information.`);
  }
}

function evaluateAiOverview(
  data: SerpVisibilityRawData,
  domain: string,
  issues: AuditIssue[],
  positives: string[]
): void {
  if (!data.hasAiOverview) {
    issues.push({
      module: "serpVisibility",
      severity: "warning",
      check: "no_ai_overview",
      title: `No AI Overview for "${data.keyword}"`,
      description:
        "Google did not show an AI-generated Overview for this search. " +
        "As AI Overviews expand, appearing as a cited source becomes increasingly " +
        "important for brand awareness and zero-click visibility.",
      recommendation:
        "Improve E-E-A-T signals: add author bios, certifications, and detailed " +
        "service/about pages. Use structured data (FAQ, HowTo) to help Google " +
        "understand and summarise your content.",
    });
    return;
  }

  if (data.aiOverviewCitesDomain) {
    positives.push(
      `Cited as a source in Google's AI Overview for "${data.keyword}" — strong AI search presence.`
    );
  } else {
    issues.push({
      module: "serpVisibility",
      severity: "warning",
      check: "ai_overview_not_cited",
      title: `AI Overview present but does not cite ${domain}`,
      description:
        `Google's AI Overview for "${data.keyword}" exists but does not include ` +
        `${domain} as a source. ${data.aiOverviewSources.length > 0
          ? `It cites: ${data.aiOverviewSources.slice(0, 3).map((s) => s.domain).join(", ")}.`
          : ""
        }`,
      recommendation:
        "Create authoritative, factual content that directly answers common " +
        "questions in your niche. Earn mentions and links from sites already " +
        "cited in AI Overviews in your category.",
    });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function tryExtractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
