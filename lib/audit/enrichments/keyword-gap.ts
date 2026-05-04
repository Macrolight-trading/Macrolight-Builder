/**
 * Keyword gap enrichment for the Domain Analytics module.
 *
 * Calls /dataforseo_labs/google/domain_intersection/live with the audited
 * domain and the top 3 competitor domains discovered by the existing
 * competitors_domain call. Returns keywords competitors rank for that the
 * audited domain does not.
 *
 * Cost: $0.10 per task + $0.001 per row. Limited to 25 results.
 */

import {
  buildAuthHeaders,
  callDataForSeoWithTaskCheck,
  numericOrNull,
} from "../dataforseo-client";

export interface KeywordGapEntry {
  keyword: string;
  searchVolume: number | null;
  /**
   * Best-ranked competitor domain for this keyword (the one we'd most want to
   * displace). Picked deterministically — first competitor with a position
   * in the data.
   */
  competitorWithBest: string;
  competitorBestPosition: number | null;
  cpc: number | null;
}

const LOCATION_CODE = 2840;
const LANGUAGE_CODE = "en";
const ROW_LIMIT = 25;

/**
 * Fetch keyword-gap rows. Returns an empty array on failure rather than
 * throwing — this is enrichment data and parent module should still run.
 */
export async function fetchKeywordGap(
  targetDomain: string,
  competitorDomains: string[]
): Promise<KeywordGapEntry[]> {
  if (competitorDomains.length === 0) return [];

  // Take up to 3 competitors. domain_intersection accepts target1 + target2;
  // for multi-competitor we run N calls and merge, deduping by keyword.
  const competitors = competitorDomains.slice(0, 3);
  const headers = buildAuthHeaders();

  const perCompetitor = await Promise.all(
    competitors.map(async (competitor) => {
      try {
        const res = await callDataForSeoWithTaskCheck(
          "/dataforseo_labs/google/domain_intersection/live",
          [
            {
              target1: competitor,
              target2: targetDomain,
              location_code: LOCATION_CODE,
              language_code: LANGUAGE_CODE,
              limit: ROW_LIMIT,
              // Filter: keywords where competitor ranks but audited domain doesn't.
              // We use intersections=false to get keywords UNIQUE to target1.
              intersections: false,
            },
          ],
          headers
        );
        const items = (res.tasks?.[0]?.result?.[0] as
          | { items?: Array<Record<string, unknown>> }
          | undefined)?.items ?? [];
        return items.map((item) => parseGapRow(item, competitor));
      } catch (err) {
        console.warn(
          "[keyword-gap] domain_intersection failed for",
          competitor,
          err
        );
        return [] as KeywordGapEntry[];
      }
    })
  );

  // Merge and dedupe by keyword, keeping the row with the highest competitor
  // search volume.
  const merged = new Map<string, KeywordGapEntry>();
  for (const list of perCompetitor) {
    for (const row of list) {
      const existing = merged.get(row.keyword);
      if (
        !existing ||
        (row.searchVolume ?? 0) > (existing.searchVolume ?? 0)
      ) {
        merged.set(row.keyword, row);
      }
    }
  }

  return Array.from(merged.values())
    .sort((a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0))
    .slice(0, ROW_LIMIT);
}

function parseGapRow(
  item: Record<string, unknown>,
  competitor: string
): KeywordGapEntry {
  const kwInfo = item.keyword_data as Record<string, unknown> | undefined;
  const keyword =
    typeof kwInfo?.keyword === "string"
      ? (kwInfo.keyword as string)
      : typeof item.keyword === "string"
      ? (item.keyword as string)
      : "";

  const searchVolume = numericOrNull(
    (kwInfo?.keyword_info as Record<string, unknown> | undefined)?.search_volume
  );
  const cpc = numericOrNull(
    (kwInfo?.keyword_info as Record<string, unknown> | undefined)?.cpc
  );

  // first_domain_serp_element holds the competitor's ranking on this keyword.
  const firstSerp = item.first_domain_serp_element as
    | Record<string, unknown>
    | undefined;
  const competitorBestPosition = numericOrNull(firstSerp?.rank_absolute);

  return {
    keyword,
    searchVolume,
    competitorWithBest: competitor,
    competitorBestPosition,
    cpc,
  };
}
