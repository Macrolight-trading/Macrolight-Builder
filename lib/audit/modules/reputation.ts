/**
 * Reputation module.
 *
 * Aggregates reviews from Google, Yelp, and Trustpilot via DataForSEO's
 * Business Data API (task-queue endpoints).
 *
 * Flow:
 *   1. POST a task to /business_data/<platform>/reviews/task_post for each
 *      platform we have a target identifier for.
 *   2. Poll /business_data/<platform>/reviews/task_get/advanced/{taskId}
 *      with a deadline (~60s total). If a platform hasn't returned by the
 *      deadline, we mark it as "pending" in rawData and skip its score
 *      contribution rather than failing the whole module.
 *   3. Aggregate ratings + recent-negative-review counts.
 *
 * Target identifiers:
 *   - Google → Place ID (we already fetch this in the Local SEO module via
 *     Google Places). For now we rerun the Places lookup here too; later we
 *     can wire it through the orchestrator.
 *   - Yelp / Trustpilot → URL or business id. v1 best-effort: use the
 *     business name + city as a search query and let the API resolve.
 *
 * Cost: included in Business Data plan (no per-call charge beyond plan).
 *
 * Required env: DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD
 */

import { scoreModule } from "../scorer";
import {
  buildAuthHeaders,
  callDataForSeo,
  callDataForSeoWithTaskCheck,
  extractDomain,
  hasCredentials,
  numericOrNull,
  type DataForSeoResponse,
} from "../dataforseo-client";
import type { AuditInput, AuditIssue, AuditModuleResult } from "../types";

// ── Public types ──────────────────────────────────────────────────────────────

export type ReviewPlatform = "google" | "yelp" | "trustpilot";

export interface PlatformReviewSummary {
  platform: ReviewPlatform;
  status: "ok" | "no_match" | "pending" | "error";
  /** Aggregate average rating on the platform's native scale (Google 1-5, Yelp 1-5, Trustpilot 1-5). */
  avgRating: number | null;
  /** Total review count as the platform reports it. */
  totalReviews: number | null;
  /**
   * Number of 1- or 2-star reviews dated within the last 90 days. Used to
   * surface "recent negative-review velocity" warnings.
   */
  recentNegative: number;
  /** Up to 3 sample reviews to render in the report. */
  sampleReviews: Array<{
    rating: number | null;
    text: string;
    timestamp: string | null;
    author: string | null;
  }>;
  /** Set when status is "error" or "no_match". */
  reason?: string;
}

export interface ReputationRawData {
  google: PlatformReviewSummary;
  yelp: PlatformReviewSummary;
  trustpilot: PlatformReviewSummary;
  /** Weighted aggregate across platforms with an OK status (1–5 scale). */
  aggregateRating: number | null;
  /** Sum of recentNegative across platforms. */
  totalRecentNegative: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Trustpilot in particular can take 30–90s to come back. We give the polling
 * loop a generous deadline; if it still hasn't completed, the platform is
 * marked "pending" and the next audit picks it up.
 */
const TASK_POLL_TIMEOUT_MS = 90_000;
const TASK_POLL_INTERVAL_MS = 4_000;
const RECENT_NEGATIVE_WINDOW_DAYS = 90;

// ── Entry point ───────────────────────────────────────────────────────────────

export async function runReputationAudit(
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
  if (!input.clientName?.trim()) {
    return unavailable("Client name is required for review-platform lookups");
  }

  console.log("[reputation] starting — client:", input.clientName, "| domain:", domain);

  // Run all three platforms in parallel. Each handles its own errors and
  // returns a PlatformReviewSummary regardless of outcome.
  const [google, yelp, trustpilot] = await Promise.all([
    fetchGoogleReviews(input.clientName, domain),
    fetchYelpReviews(input.clientName, domain),
    fetchTrustpilotReviews(input.clientName, domain),
  ]);

  const platforms = [google, yelp, trustpilot];
  const okPlatforms = platforms.filter((p) => p.status === "ok");

  // If nothing succeeded, mark module unavailable so the score isn't a
  // misleading 100. (No issues + no data = perfect score in our scorer.)
  if (okPlatforms.length === 0) {
    const reasons = platforms
      .map((p) => `${p.platform}: ${p.reason ?? p.status}`)
      .join("; ");
    return unavailable(`No review platform returned data — ${reasons}`);
  }

  const aggregateRating = computeAggregateRating(okPlatforms);
  const totalRecentNegative = okPlatforms.reduce(
    (sum, p) => sum + p.recentNegative,
    0
  );

  evaluateAggregateRating(aggregateRating, okPlatforms, issues, positives);
  evaluateRecentNegativeVelocity(totalRecentNegative, okPlatforms, issues);
  evaluateNoListingFound(platforms, issues);

  return {
    module: "reputation",
    available: true,
    score: scoreModule(issues),
    issues,
    rawData: {
      google,
      yelp,
      trustpilot,
      aggregateRating,
      totalRecentNegative,
    } as ReputationRawData,
    positives,
  };
}

function unavailable(reason: string): AuditModuleResult {
  return {
    module: "reputation",
    available: false,
    unavailableReason: reason,
    score: 0,
    issues: [],
    rawData: {
      google: emptyPlatform("google", "error", reason),
      yelp: emptyPlatform("yelp", "error", reason),
      trustpilot: emptyPlatform("trustpilot", "error", reason),
      aggregateRating: null,
      totalRecentNegative: 0,
    } as ReputationRawData,
    positives: [],
  };
}

function emptyPlatform(
  platform: ReviewPlatform,
  status: PlatformReviewSummary["status"],
  reason?: string
): PlatformReviewSummary {
  return {
    platform,
    status,
    avgRating: null,
    totalReviews: null,
    recentNegative: 0,
    sampleReviews: [],
    reason,
  };
}

// ── Platform fetchers ─────────────────────────────────────────────────────────

async function fetchGoogleReviews(
  clientName: string,
  domain: string
): Promise<PlatformReviewSummary> {
  // Google reviews task_post accepts ONE OF { place_id, cid, keyword }.
  // We don't have a place_id at this stage (it lives in the Local SEO
  // module's Places result and isn't threaded through yet — TODO), so we
  // fall back to keyword search. Send ONLY fields the API expects — 
  // do NOT send language_name, language_code, or other unsupported fields
  // as DataForSEO rejects them with 40501 Invalid Field errors.
  const payload: Record<string, unknown> = {
    keyword: clientName,
    depth: 50,
  };
  return runReviewTask("google", "/business_data/google/reviews", payload, domain);
}

async function fetchYelpReviews(
  _clientName: string,
  domain: string
): Promise<PlatformReviewSummary> {
  // Yelp's reviews task_post requires an `alias` (the URL slug from
  // yelp.com/biz/<alias>) or a direct `url`. There's no keyword-search
  // shortcut on this endpoint. Without a programmatic way to discover the
  // alias from a domain alone (would need /business_data/business_listings/
  // search/live first), we mark Yelp unavailable for v1.
  void domain;
  return emptyPlatform(
    "yelp",
    "no_match",
    "Yelp lookup needs a Yelp alias — keyword search isn't supported on the reviews endpoint. Wire up the alias-discovery flow before re-enabling."
  );
}

async function fetchTrustpilotReviews(
  clientName: string,
  domain: string
): Promise<PlatformReviewSummary> {
  // Trustpilot reviews are keyed by the business's Trustpilot domain alias —
  // typically the site's hostname. Trustpilot returns 404 / no_results when
  // there's no listing for the domain.
  void clientName;
  return runReviewTask("trustpilot", "/business_data/trustpilot/reviews", {
    domain,
    depth: 50,
  }, domain);
}

// ── Task-queue runner ────────────────────────────────────────────────────────

async function runReviewTask(
  platform: ReviewPlatform,
  basePath: string,
  payload: Record<string, unknown>,
  auditedDomain: string
): Promise<PlatformReviewSummary> {
  const headers = buildAuthHeaders();

  // 1. Submit task.
  let taskId: string | null = null;
  try {
    const postRes = await callDataForSeoWithTaskCheck(
      `${basePath}/task_post`,
      [payload],
      headers
    );
    const t = postRes.tasks?.[0];
    taskId = t?.id ?? null;
    if (!taskId) {
      return emptyPlatform(platform, "error", "task_post returned no task ID");
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return emptyPlatform(platform, "error", `task_post failed: ${msg}`);
  }

  // 2. Poll task_get/advanced until we have results or hit the deadline.
  const deadline = Date.now() + TASK_POLL_TIMEOUT_MS;
  let resultRes: DataForSeoResponse | null = null;
  while (Date.now() < deadline) {
    await sleep(TASK_POLL_INTERVAL_MS);
    try {
      const getRes = await callDataForSeo(
        `${basePath}/task_get/advanced/${taskId}`,
        [],
        headers
      );
      const taskStatus = getRes.tasks?.[0]?.status_code;
      // 20000 = ok, 40601 = task in queue, 40602 = task in progress.
      if (taskStatus === 20000) {
        resultRes = getRes;
        break;
      }
      if (taskStatus && taskStatus >= 40000 && taskStatus !== 40601 && taskStatus !== 40602) {
        return emptyPlatform(
          platform,
          "error",
          `task_get returned status ${taskStatus}: ${getRes.tasks?.[0]?.status_message ?? ""}`
        );
      }
    } catch (err: unknown) {
      // Transient — keep polling unless the deadline hits.
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[reputation:${platform}] poll transient error:`, msg);
    }
  }

  if (!resultRes) {
    return emptyPlatform(
      platform,
      "pending",
      `Task did not complete within ${TASK_POLL_TIMEOUT_MS / 1000}s — re-run later`
    );
  }

  return parseReviewsResult(platform, resultRes, auditedDomain);
}

function parseReviewsResult(
  platform: ReviewPlatform,
  res: DataForSeoResponse,
  _auditedDomain: string
): PlatformReviewSummary {
  const result = res.tasks?.[0]?.result?.[0] as
    | {
        rating?: { value?: number; votes_count?: number };
        items?: Array<{
          rating?: { value?: number };
          review_text?: string;
          text?: string;
          timestamp?: string;
          time_ago?: string;
          profile_name?: string;
          author?: { name?: string };
        }>;
      }
    | undefined;

  if (!result) {
    return emptyPlatform(platform, "no_match", "No matching listing found");
  }

  const avgRating = numericOrNull(result.rating?.value);
  const totalReviews = numericOrNull(result.rating?.votes_count);
  const items = result.items ?? [];

  const cutoff = Date.now() - RECENT_NEGATIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  let recentNegative = 0;
  for (const it of items) {
    const r = numericOrNull(it.rating?.value);
    const ts = parseTimestamp(it.timestamp);
    if (r != null && r <= 2 && ts != null && ts >= cutoff) {
      recentNegative++;
    }
  }

  const sampleReviews = items.slice(0, 3).map((it) => ({
    rating: numericOrNull(it.rating?.value),
    text: it.review_text ?? it.text ?? "",
    timestamp: it.timestamp ?? it.time_ago ?? null,
    author: it.author?.name ?? it.profile_name ?? null,
  }));

  if (avgRating == null && items.length === 0) {
    return emptyPlatform(platform, "no_match", "No matching listing found");
  }

  return {
    platform,
    status: "ok",
    avgRating,
    totalReviews,
    recentNegative,
    sampleReviews,
  };
}

// ── Aggregation ─────────────────────────────────────────────────────────────

/**
 * Aggregate rating across platforms, weighted by review count.
 * If no platform has a rating, returns null.
 */
function computeAggregateRating(
  platforms: PlatformReviewSummary[]
): number | null {
  let weightedSum = 0;
  let weightTotal = 0;
  for (const p of platforms) {
    if (p.avgRating == null || p.totalReviews == null || p.totalReviews <= 0) {
      continue;
    }
    weightedSum += p.avgRating * p.totalReviews;
    weightTotal += p.totalReviews;
  }
  if (weightTotal === 0) return null;
  return Math.round((weightedSum / weightTotal) * 10) / 10;
}

// ── Severity mapping ──────────────────────────────────────────────────────────

function evaluateAggregateRating(
  agg: number | null,
  platforms: PlatformReviewSummary[],
  issues: AuditIssue[],
  positives: string[]
): void {
  if (agg == null) return;

  const totalReviews = platforms.reduce(
    (sum, p) => sum + (p.totalReviews ?? 0),
    0
  );

  if (agg < 3.5) {
    issues.push({
      module: "reputation",
      severity: "critical",
      check: "low_aggregate_rating",
      title: `Aggregate rating is ${agg.toFixed(1)} stars across ${totalReviews} reviews`,
      description:
        "Below 3.5 stars users hesitate before clicking, calling, or " +
        "booking. Local pack rankings also factor review quality.",
      recommendation:
        "Address the underlying causes of negative reviews — operational " +
        "issues, expectation-setting, follow-up. Respond professionally to " +
        "every existing 1–3 star review and re-engage happy customers " +
        "to leave new positive ones.",
    });
  } else if (agg >= 4.5 && totalReviews >= 50) {
    positives.push(
      `${agg.toFixed(1)} stars across ${totalReviews} reviews — strong social proof.`
    );
  }
}

function evaluateRecentNegativeVelocity(
  totalRecentNegative: number,
  platforms: PlatformReviewSummary[],
  issues: AuditIssue[]
): void {
  if (totalRecentNegative >= 3) {
    const breakdown = platforms
      .filter((p) => p.recentNegative > 0)
      .map((p) => `${p.platform} (${p.recentNegative})`)
      .join(", ");
    issues.push({
      module: "reputation",
      severity: "warning",
      check: "recent_negative_velocity",
      title: `${totalRecentNegative} negative reviews in the last 90 days`,
      description: `Distribution: ${breakdown}. Recent reviews carry more SERP weight than old ones.`,
      recommendation:
        "Identify whether these stem from a single operational issue or a " +
        "broader pattern. Respond to each publicly. Counterbalance with " +
        "an active review-request flow on positive customer touchpoints.",
    });
  }
}

function evaluateNoListingFound(
  platforms: PlatformReviewSummary[],
  issues: AuditIssue[]
): void {
  // We only flag missing Google listings. Yelp is currently always "no_match"
  // because the v1 doesn't do alias discovery — flagging it would fire on
  // every audit regardless of actual Yelp presence. Trustpilot is normally
  // not listed for SMB service businesses; not actionable.
  for (const p of platforms) {
    if (p.status === "no_match" && p.platform === "google") {
      issues.push({
        module: "reputation",
        severity: "info",
        check: `no_${p.platform}_listing`,
        title: `No ${platformLabel(p.platform)} listing found`,
        description:
          `${platformLabel(p.platform)} is a meaningful local-search ` +
          "surface for service businesses. Not having a presence means " +
          "missing a steady stream of trust signals and discovery traffic.",
        recommendation: `Claim a free business profile on ${platformLabel(p.platform)}.`,
      });
    }
  }
}

function platformLabel(p: ReviewPlatform): string {
  switch (p) {
    case "google":
      return "Google";
    case "yelp":
      return "Yelp";
    case "trustpilot":
      return "Trustpilot";
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseTimestamp(s: string | undefined): number | null {
  if (!s) return null;
  // DataForSEO returns timestamps as ISO strings or "X days ago" — try the
  // ISO path first.
  const isoMs = Date.parse(s);
  if (!Number.isNaN(isoMs)) return isoMs;
  // Fallback: "3 days ago" style.
  const m = s.match(/(\d+)\s*(day|week|month|year)s?\s*ago/i);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  const days =
    unit === "day"
      ? n
      : unit === "week"
      ? n * 7
      : unit === "month"
      ? n * 30
      : n * 365;
  return Date.now() - days * 24 * 60 * 60 * 1000;
}
