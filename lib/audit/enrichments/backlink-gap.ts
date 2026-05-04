/**
 * Backlink gap enrichment for the Backlinks module.
 *
 * Calls /backlinks/domain_intersection/live with the audited domain + top
 * competitors. Returns referring domains that link to ALL competitors but not
 * to the audited domain — pure outreach opportunity rows.
 *
 * Cost: $0.02 per call + $0.00003 per row.
 */

import {
  buildAuthHeaders,
  callDataForSeoWithTaskCheck,
  numericOrNull,
} from "../dataforseo-client";

export interface BacklinkGapEntry {
  /** Domain that links to competitors but not the audited site. */
  referringDomain: string;
  /** Domain rank (DataForSEO scale 0–1000). Higher = more authoritative. */
  rank: number | null;
  /** Number of distinct competitors this domain links to. */
  linksToCompetitorCount: number;
  /** First link example for outreach context. */
  examplePageUrl: string | null;
  /** Estimated organic traffic of the referring domain (signal of quality). */
  refDomainEtv: number | null;
}

const ROW_LIMIT = 10;

export async function fetchBacklinkGap(
  targetDomain: string,
  competitorDomains: string[]
): Promise<BacklinkGapEntry[]> {
  if (competitorDomains.length === 0) return [];

  // Up to 4 targets per call. Format: targets array of objects with domain
  // and "include" flag — competitors must be true (linked), audited domain
  // must be false (not linked).
  const competitors = competitorDomains.slice(0, 3);
  const targets = [
    { target: targetDomain, include: false },
    ...competitors.map((c) => ({ target: c, include: true })),
  ];

  const headers = buildAuthHeaders();

  try {
    const res = await callDataForSeoWithTaskCheck(
      "/backlinks/domain_intersection/live",
      [
        {
          targets,
          limit: ROW_LIMIT,
          // Order by rank descending so highest-authority opportunities come
          // first.
          order_by: ["rank,desc"],
          // Filter to live, dofollow links only — those carry SEO weight.
          filters: [
            ["dofollow", "=", true],
            "and",
            ["is_lost", "=", false],
          ],
        },
      ],
      headers
    );

    const items =
      (res.tasks?.[0]?.result?.[0] as
        | { items?: Array<Record<string, unknown>> }
        | undefined)?.items ?? [];

    return items.map((row) => parseRow(row, competitors.length));
  } catch (err) {
    console.warn("[backlink-gap] domain_intersection failed:", err);
    return [];
  }
}

function parseRow(
  item: Record<string, unknown>,
  competitorCount: number
): BacklinkGapEntry {
  const refDomain = typeof item.domain_from === "string" ? item.domain_from : "";
  const rank = numericOrNull(item.rank);
  const examplePageUrl = typeof item.url_from === "string" ? item.url_from : null;
  const refDomainEtv = numericOrNull(
    (item.domain_from_metrics as Record<string, unknown> | undefined)?.organic_etv
  );
  // The endpoint returns one row per (referring_domain × competitor) match;
  // exact dedupe + counting happens upstream when we render.
  return {
    referringDomain: refDomain,
    rank,
    linksToCompetitorCount: competitorCount,
    examplePageUrl,
    refDomainEtv,
  };
}
