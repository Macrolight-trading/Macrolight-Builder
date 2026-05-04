/**
 * Local Pack Visibility module.
 *
 * For each `{service keyword} in {city}` query, calls
 * `/serp/google/maps/live/advanced` and asks: does the audited business
 * appear in the Maps results? At what position?
 *
 * Position 1–3 = local pack (the boxed three Maps results that show on
 * a regular search page). Position 4–20 = local finder (the expanded list
 * users see after clicking "More places"). Beyond that, effectively invisible.
 *
 * Match strategy: Maps results return businesses with a `domain` field that
 * is the business's website hostname when GBP has it configured. We compare
 * to the audited domain (with www-stripping) to find a match.
 *
 * Cost: ~$0.002 per query. Default 5 queries → ~$0.01 per audit.
 *
 * Required env: DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD
 * Required input: AuditInput.serviceKeywords (1–5 strings)
 */

import { scoreModule } from "../scorer";
import {
  buildAuthHeaders,
  callDataForSeoWithTaskCheck,
  extractDomain,
  hasCredentials,
  numericOrNull,
} from "../dataforseo-client";
import { fetchSinglePage } from "../crawler";
import type { AuditInput, AuditIssue, AuditModuleResult } from "../types";

// ── Public types (read by UI / PDF layers) ────────────────────────────────────

export interface LocalPackCompetitor {
  position: number;
  /** Business name as Google has it. */
  name: string;
  /** Hostname of the competitor's website if GBP has one configured. */
  domain: string | null;
  rating: number | null;
  reviewCount: number | null;
}

export interface LocalPackQueryResult {
  /** The full search query as we sent it (e.g. "plumber in Springfield, IL"). */
  query: string;
  serviceKeyword: string;
  location: string;
  /**
   * 1-indexed position of the audited business in the Maps results, or null
   * if not present in the top 20.
   */
  brandPosition: number | null;
  /** True if brandPosition is between 1 and 3 inclusive. */
  inLocalPack: boolean;
  /** Top 3 competitors holding pack positions, regardless of brand presence. */
  topThreeCompetitors: LocalPackCompetitor[];
  /** Set when this specific query failed (network, no results, etc.). */
  error?: string;
}

export interface LocalPackRawData {
  /** Resolved location string used for all queries (e.g. "Springfield,Illinois,United States"). */
  location: string | null;
  queries: LocalPackQueryResult[];
  queriesAttempted: number;
  queriesInPack: number;
  /** Aggregate visibility share — queries in pack / queries with valid results. */
  packVisibility: number; // 0–1
}

// ── Constants ─────────────────────────────────────────────────────────────────

const LANGUAGE_CODE = "en";
/** US default — Maps SERP defaults to a country if location_name is bare. */
const DEFAULT_COUNTRY = "United States";
/** Max queries we'll run; admin can supply fewer but not more. */
const MAX_QUERIES = 5;
/** Number of Maps results to request per query. 100 is the API max. */
const RESULT_DEPTH = 20;

// ── Entry point ───────────────────────────────────────────────────────────────

export async function runLocalPackAudit(
  input: AuditInput
): Promise<AuditModuleResult> {
  const issues: AuditIssue[] = [];
  const positives: string[] = [];

  if (!hasCredentials()) {
    return unavailable(
      "DataForSEO credentials not configured (DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD)"
    );
  }

  const domain = extractDomain(input.url);
  if (!domain) {
    return unavailable("Could not parse a domain from the audit URL");
  }

  const keywords = (input.serviceKeywords ?? [])
    .map((k) => k.trim())
    .filter((k) => k.length > 0)
    .slice(0, MAX_QUERIES);

  if (keywords.length === 0) {
    return unavailable(
      "No service keywords provided — Local Pack module needs 1–5 service " +
        "keywords (entered when the audit is created) to query the Maps SERP."
    );
  }

  // Try to resolve a city/region from the homepage NAP. If we can't, fall back
  // to a country-only query and note that results will be country-wide rather
  // than local-pack-shaped.
  const { location, looksLocal } = await resolveLocationAndLocality(input.url);

  // Hard skip when the site clearly isn't a local business. Without this
  // check, large e-commerce / SaaS / global-content sites (Amazon, GitHub,
  // Stripe etc.) get hit with a sentinel "not in the local pack" critical
  // because they don't appear in Maps for "shopping" or whatever generic
  // keyword the admin entered. That's a category mismatch, not a finding.
  if (!looksLocal) {
    return {
      module: "localPack",
      available: false,
      unavailableReason:
        "Audited site is not a local business (no LocalBusiness schema, " +
        "no extracted city/region, brand SERP shows no local pack). The " +
        "Local Pack module only applies to businesses with a physical " +
        "service area.",
      score: 0,
      issues: [],
      rawData: {
        location,
        queries: [],
        queriesAttempted: 0,
        queriesInPack: 0,
        packVisibility: 0,
      } as LocalPackRawData,
      positives: [],
    };
  }

  console.log(
    "[local-pack] starting — keywords:",
    keywords.join(", "),
    "| location:",
    location ?? "(none — country-wide)"
  );

  let queries: LocalPackQueryResult[];
  try {
    queries = await Promise.all(
      keywords.map((kw) => runQuery(kw, location, domain))
    );
  } catch (err: unknown) {
    return unavailable(
      `Maps SERP API error: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const validQueries = queries.filter((q) => !q.error);
  if (validQueries.length === 0) {
    return unavailable(
      "All Maps SERP queries failed — see raw data for per-query errors"
    );
  }

  const inPack = validQueries.filter((q) => q.inLocalPack).length;
  const packVisibility = inPack / validQueries.length;

  evaluateVisibility(
    domain,
    queries,
    validQueries,
    inPack,
    packVisibility,
    issues,
    positives
  );

  return {
    module: "localPack",
    available: true,
    score: scoreModule(issues),
    issues,
    rawData: {
      location,
      queries,
      queriesAttempted: queries.length,
      queriesInPack: inPack,
      packVisibility,
    } as LocalPackRawData,
    positives,
  };
}

function unavailable(reason: string): AuditModuleResult {
  return {
    module: "localPack",
    available: false,
    unavailableReason: reason,
    score: 0,
    issues: [],
    rawData: {
      location: null,
      queries: [],
      queriesAttempted: 0,
      queriesInPack: 0,
      packVisibility: 0,
    } as LocalPackRawData,
    positives: [],
  };
}

// ── DataForSEO Maps query ─────────────────────────────────────────────────────

async function runQuery(
  serviceKeyword: string,
  location: string | null,
  auditedDomain: string
): Promise<LocalPackQueryResult> {
  const fullQuery = location
    ? `${serviceKeyword} in ${humanLocation(location)}`
    : serviceKeyword;
  const headers = buildAuthHeaders();

  // Maps SERP accepts location_name. We pass the resolved city when present,
  // otherwise default to country-only (much weaker signal but at least returns
  // something, and the report copy adapts).
  const payload: Record<string, unknown> = {
    keyword: serviceKeyword,
    language_code: LANGUAGE_CODE,
    depth: RESULT_DEPTH,
  };
  if (location) {
    payload.location_name = location;
  } else {
    payload.location_name = DEFAULT_COUNTRY;
  }

  try {
    const res = await callDataForSeoWithTaskCheck(
      "/serp/google/maps/live/advanced",
      [payload],
      headers
    );

    const result = res.tasks?.[0]?.result?.[0] as
      | { items?: Array<Record<string, unknown>> }
      | undefined;
    const items = result?.items ?? [];

    return parseMapsResponse(serviceKeyword, location, fullQuery, items, auditedDomain);
  } catch (err: unknown) {
    return {
      query: fullQuery,
      serviceKeyword,
      location: location ?? DEFAULT_COUNTRY,
      brandPosition: null,
      inLocalPack: false,
      topThreeCompetitors: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function parseMapsResponse(
  serviceKeyword: string,
  location: string | null,
  fullQuery: string,
  items: Array<Record<string, unknown>>,
  auditedDomain: string
): LocalPackQueryResult {
  let brandPosition: number | null = null;
  const topThreeCompetitors: LocalPackCompetitor[] = [];

  for (const item of items) {
    // Maps SERP returns several item types; we only care about "maps_search"
    // entries (organic Maps listings).
    const type = typeof item.type === "string" ? item.type : "";
    if (type !== "maps_search") continue;

    const position = numericOrNull(item.rank_absolute) ?? 999;
    const itemDomain = normaliseDomain(item.domain);
    const name = typeof item.title === "string" ? item.title : "";

    // Brand match — first hit wins (lowest position).
    if (
      brandPosition === null &&
      itemDomain &&
      (itemDomain === auditedDomain ||
        itemDomain.endsWith(`.${auditedDomain}`) ||
        auditedDomain.endsWith(`.${itemDomain}`))
    ) {
      brandPosition = position;
    }

    // Capture the top 3 for the report, regardless of whether brand matched.
    if (topThreeCompetitors.length < 3 && position <= 3) {
      topThreeCompetitors.push({
        position,
        name,
        domain: itemDomain,
        rating: numericOrNull(
          (item.rating as Record<string, unknown> | undefined)?.value
        ),
        reviewCount: numericOrNull(
          (item.rating as Record<string, unknown> | undefined)?.votes_count
        ),
      });
    }
  }

  return {
    query: fullQuery,
    serviceKeyword,
    location: location ?? DEFAULT_COUNTRY,
    brandPosition,
    inLocalPack:
      brandPosition !== null && brandPosition >= 1 && brandPosition <= 3,
    topThreeCompetitors,
  };
}

// ── Severity mapping ──────────────────────────────────────────────────────────

function evaluateVisibility(
  domain: string,
  allQueries: LocalPackQueryResult[],
  validQueries: LocalPackQueryResult[],
  inPack: number,
  packVisibility: number,
  issues: AuditIssue[],
  positives: string[]
): void {
  const total = validQueries.length;

  if (inPack === 0) {
    issues.push({
      module: "localPack",
      severity: "critical",
      sentinel: true,
      check: "no_local_pack_presence",
      title: `Not appearing in the local pack for any of ${total} core service queries`,
      description:
        `${domain} doesn't show up in the Google Maps 3-pack for any of the ` +
        `${total} service searches we ran. The local pack is where most local ` +
        "phone calls and bookings start — being absent here is the biggest " +
        "single visibility gap a local business can have.",
      recommendation:
        "Claim and fully complete the Google Business Profile (categories, " +
        "hours, photos, services). Build local citations with consistent NAP. " +
        "Earn local backlinks (Chamber of Commerce, local press, partnerships).",
    });
  } else if (packVisibility < 0.4) {
    issues.push({
      module: "localPack",
      severity: "warning",
      check: "weak_local_pack_presence",
      title: `Only ${Math.round(packVisibility * 100)}% local-pack visibility (${inPack}/${total} queries)`,
      description:
        `${domain} appears in the local 3-pack for ${inPack} of ${total} ` +
        "core service queries. There's clear headroom to expand visibility " +
        "into the rest of your service catalog.",
      recommendation:
        "Audit which keywords aren't producing pack visibility and add " +
        "matching service descriptions to the GBP listing. Consider " +
        "service-page content on the website that targets each gap keyword.",
    });
  } else if (packVisibility >= 0.8) {
    positives.push(
      `Appears in the local 3-pack for ${inPack} of ${total} core service ` +
        "queries — strong local visibility."
    );
  }

  // Flag specific queries the brand is missing — noise reduction: only call
  // out missing queries if the brand isn't already in the pack overall.
  // Per-query "missing pack" detail issues only fire when there's PARTIAL
  // visibility (some queries hit, some missed). When inPack is 0 the
  // overall sentinel critical above already covers it — adding per-query
  // info issues just bloats the report with no extra signal.
  if (inPack > 0 && inPack < total) {
    const missing = validQueries.filter((q) => !q.inLocalPack);
    for (const q of missing) {
      const competitorList = q.topThreeCompetitors
        .filter((c) => c.name)
        .map((c) => c.name)
        .join(", ");
      issues.push({
        module: "localPack",
        severity: "info",
        check: `missing_pack_${q.serviceKeyword.replace(/\s+/g, "_")}`,
        title: `Not in pack for "${q.query}"`,
        description:
          competitorList
            ? `Competitors holding the pack: ${competitorList}.`
            : "No competitors captured for this query.",
        recommendation:
          `Investigate why ${q.serviceKeyword} isn't surfacing — the GBP ` +
          "listing may not include this service in its categories or " +
          "service descriptions, or competitors may have meaningfully more " +
          "reviews / citations for this term.",
      });
    }
  }

  // Per-query failures (network errors). Don't push critical for these — the
  // module-level "available: true with degraded data" path already covers it.
  const failed = allQueries.filter((q) => q.error);
  if (failed.length > 0 && failed.length === allQueries.length) {
    // Shouldn't reach here — caller already returns unavailable in that case.
  }
}

// ── Location resolution ──────────────────────────────────────────────────────

/**
 * Best-effort: pull the homepage HTML and try to extract a city/region from
 * the JSON-LD LocalBusiness or visible address. Returns a string in the form
 * `"<City>,<Region>,United States"` that DataForSEO accepts as `location_name`,
 * plus a `looksLocal` flag that the caller uses to decide whether to skip the
 * module entirely.
 *
 * `looksLocal` heuristic — the site looks like a local business if AT LEAST
 * ONE of these is true:
 *   - homepage has JSON-LD LocalBusiness schema (or any of its subtypes)
 *   - homepage has a visible US-format address (street + city + ZIP)
 *
 * This is intentionally cheap. The orchestrator could pass a richer signal
 * through (e.g. "GBP found by Local SEO"), but checking the homepage HTML
 * here keeps the module independently runnable without coupling to other
 * modules' state.
 */
async function resolveLocationAndLocality(
  siteUrl: string
): Promise<{ location: string | null; looksLocal: boolean }> {
  const homepage = await fetchSinglePage(siteUrl).catch(() => null);
  if (!homepage) return { location: null, looksLocal: false };

  const hasLocalSchema = homepage.meta?.hasLocalBusinessSchema === true;

  const fromSchema = extractCityRegionFromJsonLd(homepage.html);
  if (fromSchema) {
    return {
      location: formatLocationName(fromSchema),
      looksLocal: true,
    };
  }

  const fromText = extractCityRegionFromText(homepage.textContent);
  if (fromText) {
    return {
      location: formatLocationName(fromText),
      looksLocal: true,
    };
  }

  // No location extracted — only count as local if the schema flag is set
  // (rare but possible for businesses that publish LocalBusiness JSON-LD
  // without a fully resolvable address).
  return { location: null, looksLocal: hasLocalSchema };
}

function extractCityRegionFromJsonLd(
  html: string
): { city: string; region: string } | null {
  const blocks = [...html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )];
  for (const m of blocks) {
    try {
      const found = walkForAddress(JSON.parse(m[1]));
      if (found) return found;
    } catch {
      // ignore
    }
  }
  return null;
}

function walkForAddress(node: unknown): { city: string; region: string } | null {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const got = walkForAddress(item);
      if (got) return got;
    }
    return null;
  }
  const obj = node as Record<string, unknown>;
  const addr = obj.address;
  if (addr && typeof addr === "object") {
    const a = addr as Record<string, unknown>;
    const city = typeof a.addressLocality === "string" ? a.addressLocality : null;
    const region = typeof a.addressRegion === "string" ? a.addressRegion : null;
    if (city && region) return { city, region };
  }
  if (Array.isArray(obj["@graph"])) {
    const got = walkForAddress(obj["@graph"]);
    if (got) return got;
  }
  for (const v of Object.values(obj)) {
    if (typeof v === "object" && v !== null) {
      const got = walkForAddress(v);
      if (got) return got;
    }
  }
  return null;
}

function extractCityRegionFromText(
  text: string
): { city: string; region: string } | null {
  // Match "Springfield, IL 62701" or similar — same heuristic as local-seo.ts
  const m = text.match(
    /([A-Z][\w\s.'-]{1,40}),\s*([A-Z]{2})\s*\d{5}(?:-\d{4})?/
  );
  if (m) {
    return { city: m[1].trim(), region: m[2].trim() };
  }
  return null;
}

function formatLocationName(loc: { city: string; region: string }): string {
  // DataForSEO expects "<City>,<Region>,United States" with no spaces around
  // commas. The state can be the abbreviation or the full name; full name is
  // safer for matching.
  const region = US_STATE_NAMES[loc.region.toUpperCase()] ?? loc.region;
  return `${loc.city},${region},${DEFAULT_COUNTRY}`;
}

function humanLocation(loc: string): string {
  // Reverse "Springfield,Illinois,United States" → "Springfield, IL"
  const parts = loc.split(",").map((s) => s.trim());
  if (parts.length >= 2) {
    const city = parts[0];
    const region = parts[1];
    const abbrev = Object.entries(US_STATE_NAMES).find(
      ([, name]) => name.toLowerCase() === region.toLowerCase()
    )?.[0];
    return abbrev ? `${city}, ${abbrev}` : `${city}, ${region}`;
  }
  return loc;
}

function normaliseDomain(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;
  return trimmed.replace(/^www\./, "");
}

/** Minimal US state abbreviation → full name lookup for location formatting. */
const US_STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
  ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
  TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia",
};
