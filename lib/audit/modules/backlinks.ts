import { scoreModule } from "../scorer";
import { buildAuthHeaders } from "../dataforseo-client";
import {
  fetchBacklinkGap,
  type BacklinkGapEntry,
} from "../enrichments/backlink-gap";
import {
  fetchTopBacklinkPages,
  type TopBacklinkPage,
} from "../enrichments/top-pages-backlinks";
import {
  fetchBacklinkHistory,
  type BacklinkHistoryPoint,
} from "../enrichments/backlink-history";
import type { AuditInput, AuditIssue, AuditModuleResult } from "../types";

/**
 * Backlink Profile module.
 *
 * Calls DataForSEO's `/backlinks/summary/live` and
 * `/backlinks/anchors/live` endpoints. The summary call returns the
 * aggregate metrics (rank, referring domains, total backlinks). The anchors
 * call returns the anchor-text distribution.
 *
 * Pricing: ~$0.005 per call at the time of writing — two calls per audit.
 *
 * Required env: DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD
 */

const DATAFORSEO_BASE_URL = "https://api.dataforseo.com/v3";
const REQUEST_TIMEOUT_MS = 30000;

/** A site with a domain rank below this is considered weak. */
const WEAK_RANK_THRESHOLD = 100;
/** Below this many referring domains we treat as a critical signal. */
const LOW_RD_THRESHOLD = 10;
/** Above this many spam-marked links we flag. */
const SPAM_LINK_THRESHOLD = 50;

interface BacklinkSummary {
  rank: number | null;
  backlinks: number | null;
  referringDomains: number | null;
  referringMainDomains: number | null;
  referringIps: number | null;
  brokenBacklinks: number | null;
  newReferringDomainsLast30Days: number | null;
  lostReferringDomainsLast30Days: number | null;
  spamScore: number | null;
}

export interface BacklinkItem {
  urlFrom: string;
  domainFrom: string;
  urlTo: string;
  anchor: string;
  rank: number | null;
  dofollow: boolean;
}

interface BacklinkRawData {
  summary: BacklinkSummary;
  topAnchors: Array<{ anchor: string; backlinks: number; referringDomains: number }>;
  topBacklinks: BacklinkItem[];
  /**
   * Set when the /backlinks/backlinks/live call specifically failed (e.g. 40204
   * subscription not active). The rest of the module still runs — only the
   * individual backlinks list is unavailable.
   */
  topBacklinksError?: string;
  // M7 enrichments — best-effort, empty arrays just mean we couldn't fetch.
  backlinkGap?: BacklinkGapEntry[];
  topBacklinkPages?: TopBacklinkPage[];
  backlinkHistory?: BacklinkHistoryPoint[];
  /** Competitor domains discovered for the gap call. Cached for reuse. */
  competitorDomains?: string[];
}

export async function runBacklinkAudit(
  input: AuditInput
): Promise<AuditModuleResult> {
  const issues: AuditIssue[] = [];
  const positives: string[] = [];

  // ── Pre-flight: do we have what we need to even attempt this? ───────────
  if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
    return unavailable(
      "DataForSEO credentials not configured (DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD)"
    );
  }

  const target = extractDomain(input.url);
  if (!target) {
    return unavailable("Could not parse a domain from the audit URL");
  }

  // ── Try to fetch data; if the API itself is unreachable, mark unavailable
  // rather than dragging the score down with a fake "API failed" issue. ──
  let data: BacklinkRawData;
  try {
    data = await fetchBacklinkData(target);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return unavailable(`DataForSEO API error: ${message}`);
  }

  console.log(
    "[backlinks] runBacklinkAudit — topBacklinks count stored in rawData:",
    data.topBacklinks.length
  );

  // ── Distinguish "no data" from "confirmed zero" ─────────────────────────
  // If the summary endpoint returned NULL for every key field, that's a
  // signal the account doesn't have backlinks coverage on this domain — not
  // that the domain has no backlinks. Common pattern: free / cheap DataForSEO
  // tier returns null for very large domains (Amazon, Google, etc.) where
  // serving real numbers would cost too much. Treat as unavailable so we
  // don't fire a misleading "no_backlink_data" sentinel.
  const s = data.summary;
  const allNull =
    s.rank == null &&
    s.backlinks == null &&
    s.referringDomains == null &&
    s.referringMainDomains == null;
  if (allNull) {
    const detail = data.topBacklinksError
      ? ` (per-link endpoint also returned: ${data.topBacklinksError.slice(0, 100)})`
      : "";
    return unavailable(
      "DataForSEO returned no backlink data for this domain — either the " +
      "account's Backlinks subscription doesn't cover it, or the domain " +
      "isn't in their index" + detail
    );
  }

  // ── M7 enrichments — fire in parallel after the core data lands. ────────
  // We need competitor domains for the gap analysis. Fetch via
  // /backlinks/competitors/live — keeps modules independent of each other.
  const competitorDomains = await fetchCompetitorDomains(target).catch((err) => {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[backlinks] competitors unavailable:", msg);
    return [] as string[];
  });

  const [backlinkGap, topBacklinkPages, backlinkHistory] = await Promise.all([
    competitorDomains.length > 0
      ? fetchBacklinkGap(target, competitorDomains)
      : Promise.resolve([] as BacklinkGapEntry[]),
    fetchTopBacklinkPages(target),
    fetchBacklinkHistory(target),
  ]);

  data.backlinkGap = backlinkGap;
  data.topBacklinkPages = topBacklinkPages;
  data.backlinkHistory = backlinkHistory;
  data.competitorDomains = competitorDomains;

  console.log(
    "[backlinks] enrichments — backlinkGap:", backlinkGap.length,
    "| topBacklinkPages:", topBacklinkPages.length,
    "| backlinkHistory:", backlinkHistory.length
  );

  evaluateRank(data.summary, issues, positives);
  evaluateReferringDomains(data.summary, issues, positives);
  evaluateBrokenBacklinks(data.summary, issues);
  evaluateAnchorDistribution(data.topAnchors, issues, positives);
  evaluateSpamScore(data.summary, issues);
  evaluateBacklinkHistoryTrend(backlinkHistory, issues, positives);

  return {
    module: "backlinks",
    available: true,
    score: scoreModule(issues),
    issues,
    rawData: data,
    positives,
  };
}

/**
 * Fetch the audited domain's top backlink-profile competitors so we can run
 * the gap analysis. Returns up to 5 competitor domain strings.
 */
async function fetchCompetitorDomains(target: string): Promise<string[]> {
  const headers = buildAuthHeaders();
  try {
    const res = await callDataForSeoWithTaskCheck(
      "/backlinks/competitors/live",
      [{ target, limit: 5 }],
      headers
    );
    const items =
      (res.tasks?.[0]?.result?.[0] as
        | { items?: Array<Record<string, unknown>> }
        | undefined)?.items ?? [];
    return items
      .map((it) => (typeof it.target === "string" ? it.target : null))
      .filter((d): d is string => !!d && d !== target)
      .slice(0, 3);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[backlinks] competitors unavailable:", msg);
    return [];
  }
}

/**
 * Compare the most-recent backlink-history point against ~6 months ago.
 * Sustained shrinkage is a strong "things are getting worse" narrative.
 */
function evaluateBacklinkHistoryTrend(
  history: BacklinkHistoryPoint[],
  issues: AuditIssue[],
  positives: string[]
): void {
  if (history.length < 7) return;
  const latest = history[history.length - 1];
  const sixAgo = history[Math.max(0, history.length - 7)];
  if (latest.referringDomains == null || !sixAgo.referringDomains) return;

  const delta = latest.referringDomains - sixAgo.referringDomains;
  const pct = delta / sixAgo.referringDomains;

  if (pct <= -0.2) {
    issues.push({
      module: "backlinks",
      severity: "warning",
      check: "rd_decline_6m",
      title: `Referring domains down ${Math.abs(Math.round(pct * 100))}% over the last 6 months`,
      description:
        `${sixAgo.month}: ${sixAgo.referringDomains} referring domains → ` +
        `${latest.month}: ${latest.referringDomains}. ` +
        "Domains drop off as content goes stale or links die — left unchecked, " +
        "this directly erodes ranking power.",
      recommendation:
        "Run a link-reclamation pass: identify recently lost backlinks (DataForSEO's " +
        "/backlinks/backlinks/live with is_lost filter) and reach out where " +
        "the loss looks accidental (404s, removed content, redirects).",
    });
  } else if (pct >= 0.3) {
    positives.push(
      `Referring domains up ${Math.round(pct * 100)}% over the last 6 months — backlink momentum is healthy.`
    );
  }
}

function unavailable(reason: string): AuditModuleResult {
  return {
    module: "backlinks",
    available: false,
    unavailableReason: reason,
    score: 0,
    issues: [],
    rawData: { summary: emptySummary(), topAnchors: [], topBacklinks: [] } as BacklinkRawData,
    positives: [],
  };
}

/* ── DataForSEO API ─────────────────────────────────────────────────────── */

async function fetchBacklinkData(target: string): Promise<BacklinkRawData> {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) {
    throw new Error("DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD are not set");
  }

  const auth = Buffer.from(`${login}:${password}`).toString("base64");
  const headers: Record<string, string> = {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  console.log("[backlinks] fetchBacklinkData start — target:", target);

  // Run summary + anchors first (these succeed on the basic plan).
  // The individual-backlinks call is attempted separately so a subscription
  // error on that endpoint doesn't kill the whole module.
  const [summaryRes, anchorsRes] = await Promise.all([
    callDataForSeo(
      "/backlinks/summary/live",
      [{ target, internal_list_limit: 5, include_subdomains: true }],
      headers
    ),
    callDataForSeo(
      "/backlinks/anchors/live",
      [{ target, limit: 10, include_subdomains: true }],
      headers
    ),
  ]);

  // Attempt the per-backlink list — requires the full Backlinks subscription.
  // On a 40204 ("subscription not active") we store the error message and
  // keep topBacklinks empty rather than failing the whole audit.
  let topBacklinks: BacklinkItem[] = [];
  let topBacklinksError: string | undefined;

  try {
    const backlinksRes = await callDataForSeoWithTaskCheck(
      "/backlinks/backlinks/live",
      [{ target, limit: 25, order_by: ["domain_from_rank,desc"], include_subdomains: true }],
      headers
    );
    console.log(
      "[backlinks] raw backlinks/backlinks/live response:",
      JSON.stringify(backlinksRes).slice(0, 1000)
    );
    topBacklinks = parseBacklinks(backlinksRes);
    console.log("[backlinks] parseBacklinks result — count:", topBacklinks.length, "first:", topBacklinks[0] ?? null);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[backlinks] backlinks/live call failed (likely subscription):", msg);
    topBacklinksError = msg;
  }

  return {
    summary: parseSummary(summaryRes),
    topAnchors: parseAnchors(anchorsRes),
    topBacklinks,
    topBacklinksError,
  };
}

/**
 * Like callDataForSeo but also checks the task-level status_code inside the
 * response. DataForSEO returns HTTP 200 with tasks[0].status_code = 40204 for
 * subscription errors — the top-level check alone misses these.
 */
async function callDataForSeoWithTaskCheck(
  path: string,
  payload: unknown[],
  headers: Record<string, string>
): Promise<DataForSeoResponse> {
  const data = await callDataForSeo(path, payload, headers);
  const task = data.tasks?.[0];
  if (task?.status_code && task.status_code >= 40000) {
    throw new Error(
      `DataForSEO task error ${task.status_code}: ${task.status_message ?? "unknown"}`
    );
  }
  return data;
}

async function callDataForSeo(
  path: string,
  payload: unknown[],
  headers: Record<string, string>
): Promise<DataForSeoResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${DATAFORSEO_BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `DataForSEO ${path} returned ${res.status}: ${body.slice(0, 200)}`
      );
    }

    const data = (await res.json()) as DataForSeoResponse;

    // DataForSEO returns 200 with a status_code inside even on errors.
    if (data.status_code && data.status_code >= 40000) {
      throw new Error(
        `DataForSEO ${path} status ${data.status_code}: ${data.status_message ?? "unknown"}`
      );
    }

    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

interface DataForSeoResponse {
  status_code?: number;
  status_message?: string;
  tasks?: Array<{
    status_code?: number;
    status_message?: string;
    result?: unknown[];
  }>;
}

function parseSummary(res: DataForSeoResponse): BacklinkSummary {
  const result = res.tasks?.[0]?.result?.[0] as
    | Record<string, unknown>
    | undefined;
  if (!result) return emptySummary();

  return {
    rank: numericOrNull(result.rank),
    backlinks: numericOrNull(result.backlinks),
    referringDomains: numericOrNull(result.referring_domains),
    referringMainDomains: numericOrNull(result.referring_main_domains),
    referringIps: numericOrNull(result.referring_ips),
    brokenBacklinks: numericOrNull(result.broken_backlinks),
    newReferringDomainsLast30Days: numericOrNull(
      result.referring_domains_nofollow ??
        (result.crawl_progress as Record<string, unknown> | undefined)?.["new_referring_domains"]
    ),
    lostReferringDomainsLast30Days: numericOrNull(
      (result as Record<string, unknown>).lost_referring_domains
    ),
    spamScore: numericOrNull(
      (result as Record<string, unknown>).spam_score
    ),
  };
}

function parseBacklinks(res: DataForSeoResponse): BacklinkItem[] {
  const task = res.tasks?.[0];
  console.log(
    "[backlinks] parseBacklinks task status:",
    task?.status_code,
    task?.status_message
  );

  const result = task?.result?.[0] as
    | { total_count?: number; items_count?: number; items?: Array<Record<string, unknown>> }
    | undefined;

  console.log(
    "[backlinks] parseBacklinks result meta — total_count:",
    result?.total_count,
    "items_count:",
    result?.items_count,
    "items array length:",
    result?.items?.length ?? 0
  );

  if (!result?.items || result.items.length === 0) return [];

  // Log the raw shape of the first item so we can confirm field names.
  console.log(
    "[backlinks] first item keys:",
    Object.keys(result.items[0]).join(", ")
  );
  console.log(
    "[backlinks] first item sample:",
    JSON.stringify(result.items[0]).slice(0, 400)
  );

  return result.items.slice(0, 25).map((item) => ({
    urlFrom: typeof item.url_from === "string" ? item.url_from : "",
    domainFrom: typeof item.domain_from === "string" ? item.domain_from : "",
    urlTo: typeof item.url_to === "string" ? item.url_to : "",
    anchor:
      typeof item.anchor === "string" && item.anchor.trim() !== ""
        ? item.anchor
        : "(no anchor)",
    // domain_from_rank is the referring domain's authority (0-1000).
    // Falls back to page-level rank if domain rank is absent.
    rank: numericOrNull(item.domain_from_rank) ?? numericOrNull(item.rank),
    dofollow: item.dofollow === true,
  }));
}

function parseAnchors(
  res: DataForSeoResponse
): Array<{ anchor: string; backlinks: number; referringDomains: number }> {
  const items = res.tasks?.[0]?.result?.[0] as
    | { items?: Array<Record<string, unknown>> }
    | undefined;
  if (!items?.items) return [];
  return items.items.slice(0, 10).map((it) => ({
    anchor: typeof it.anchor === "string" ? it.anchor : "(no anchor)",
    backlinks: numericOrNull(it.backlinks) ?? 0,
    referringDomains: numericOrNull(it.referring_domains) ?? 0,
  }));
}

/* ── Evaluators ─────────────────────────────────────────────────────────── */

function evaluateRank(
  s: BacklinkSummary,
  issues: AuditIssue[],
  positives: string[]
): void {
  // null was caught upstream and turned into module-unavailable. Here, only
  // a confirmed zero means "this site has no link authority at all" — fire
  // the sentinel for that.
  if (s.rank === 0 && (s.backlinks ?? 0) === 0 && (s.referringDomains ?? 0) === 0) {
    issues.push({
      module: "backlinks",
      severity: "critical",
      sentinel: true,
      check: "no_backlink_data",
      title: "No backlinks found pointing at this domain",
      description:
        "DataForSEO reports zero backlinks and zero referring domains. " +
        "The site is essentially invisible to the parts of Google's " +
        "algorithm that rely on link authority.",
      recommendation:
        "Start building backlinks: get listed in industry directories, earn " +
        "local press mentions, reach out for guest posts on relevant sites, " +
        "and ensure social profiles link back to the domain.",
    });
    return;
  }
  if (s.rank == null) {
    // Still defensive: if something slipped past the upstream null-check,
    // skip evaluation rather than firing a sentinel.
    return;
  }
  if (s.rank < WEAK_RANK_THRESHOLD) {
    issues.push({
      module: "backlinks",
      severity: s.rank < 50 ? "critical" : "warning",
      check: "low_domain_rank",
      title: `Domain rank is ${s.rank} (DataForSEO scale 0-1000)`,
      description:
        "Domain rank reflects the strength of a site's backlink profile. " +
        "Sites under 100 typically struggle to outrank established competitors " +
        "for anything but very long-tail queries.",
      recommendation:
        "Build authoritative backlinks: guest posts on industry sites, " +
        "press mentions, partnerships with complementary local businesses. " +
        "Focus on domain quality over quantity.",
    });
  } else if (s.rank >= 300) {
    positives.push(`Domain rank is ${s.rank} — a solid backlink profile.`);
  }
}

function evaluateReferringDomains(
  s: BacklinkSummary,
  issues: AuditIssue[],
  positives: string[]
): void {
  if (s.referringDomains == null) return;
  if (s.referringDomains < LOW_RD_THRESHOLD) {
    issues.push({
      module: "backlinks",
      severity: "warning",
      check: "low_referring_domains",
      title: `Only ${s.referringDomains} referring domains`,
      description:
        "Referring-domain count is one of the strongest correlations with " +
        "rankings. Most ranking sites have at least a few dozen.",
      recommendation:
        "Earn links from reputable sources: industry directories, local " +
        "Chamber of Commerce, news mentions, partnerships, supplier sites.",
    });
  } else if (s.referringDomains >= 50) {
    positives.push(
      `${s.referringDomains} referring domains — a healthy diversity.`
    );
  }
}

function evaluateBrokenBacklinks(
  s: BacklinkSummary,
  issues: AuditIssue[]
): void {
  if (s.brokenBacklinks == null || s.brokenBacklinks === 0) return;
  if (s.referringDomains && s.brokenBacklinks > s.referringDomains) {
    issues.push({
      module: "backlinks",
      severity: "info",
      check: "broken_backlinks",
      title: `${s.brokenBacklinks} broken backlinks point at this site`,
      description:
        "Other sites are linking to URLs on yours that no longer exist. " +
        "Each one is wasted link equity.",
      recommendation:
        "Identify the top broken-backlink targets and add 301 redirects to " +
        "the closest live page. DataForSEO can list them — see raw data.",
    });
  }
}

function evaluateSpamScore(s: BacklinkSummary, issues: AuditIssue[]): void {
  if (s.spamScore == null) return;
  if (s.spamScore > SPAM_LINK_THRESHOLD) {
    issues.push({
      module: "backlinks",
      severity: "warning",
      check: "high_spam_score",
      title: `Backlink profile spam score is ${s.spamScore}`,
      description:
        "A high spam score means a meaningful share of backlinks come from " +
        "low-quality sources. Google can discount or penalise these.",
      recommendation:
        "Audit the lowest-quality referring domains. If you didn't earn " +
        "them deliberately, consider a Google Disavow file submission.",
      docsUrl: "https://search.google.com/search-console/disavow-links",
    });
  }
}

function evaluateAnchorDistribution(
  anchors: BacklinkRawData["topAnchors"],
  issues: AuditIssue[],
  positives: string[]
): void {
  if (anchors.length === 0) return;

  const totalLinks = anchors.reduce((sum, a) => sum + a.backlinks, 0);
  if (totalLinks === 0) return;

  // If a single anchor is > 40% of all links, it's an over-optimisation flag.
  const top = anchors[0];
  const topShare = top.backlinks / totalLinks;
  if (topShare > 0.4 && /buy|cheap|best|deal|order|discount/i.test(top.anchor)) {
    issues.push({
      module: "backlinks",
      severity: "warning",
      check: "over_optimised_anchor",
      title: `${Math.round(topShare * 100)}% of links use the anchor "${top.anchor}"`,
      description:
        "Heavy concentration of commercial-keyword anchors is a classic " +
        "footprint of paid or manipulative link building, which Google " +
        "actively penalises.",
      recommendation:
        "Diversify anchor text. Branded, naked-URL, and partial-match " +
        "anchors should dominate a natural profile.",
    });
  } else if (anchors.length >= 5) {
    positives.push(`Anchor text distribution looks natural across the top ${anchors.length} anchors.`);
  }
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function extractDomain(url: string): string | null {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function numericOrNull(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function emptySummary(): BacklinkSummary {
  return {
    rank: null,
    backlinks: null,
    referringDomains: null,
    referringMainDomains: null,
    referringIps: null,
    brokenBacklinks: null,
    newReferringDomainsLast30Days: null,
    lostReferringDomainsLast30Days: null,
    spamScore: null,
  };
}
