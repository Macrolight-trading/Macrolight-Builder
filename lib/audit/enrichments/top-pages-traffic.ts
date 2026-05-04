/**
 * Top-pages-by-traffic enrichment for the Domain Analytics module.
 *
 * Calls /dataforseo_labs/google/relevant_pages/live to get the audited
 * domain's top 10 pages by estimated organic traffic. Tells the client which
 * pages are actually working — scopes a content overhaul.
 *
 * Cost: $0.10 per task + $0.001 per row. We pull 10 rows.
 */

import {
  buildAuthHeaders,
  callDataForSeoWithTaskCheck,
  numericOrNull,
} from "../dataforseo-client";

export interface TopTrafficPage {
  url: string;
  /** Estimated traffic value (visits/month equivalent). */
  etv: number | null;
  /** Number of organic keywords this page ranks for. */
  organicKeywords: number | null;
  /** Top-ranking keyword for this page (best position) if available. */
  topKeyword: string | null;
  topKeywordPosition: number | null;
}

const LOCATION_CODE = 2840;
const LANGUAGE_CODE = "en";
const ROW_LIMIT = 10;

export async function fetchTopTrafficPages(
  targetDomain: string
): Promise<TopTrafficPage[]> {
  const headers = buildAuthHeaders();

  try {
    const res = await callDataForSeoWithTaskCheck(
      "/dataforseo_labs/google/relevant_pages/live",
      [
        {
          target: targetDomain,
          location_code: LOCATION_CODE,
          language_code: LANGUAGE_CODE,
          limit: ROW_LIMIT,
          // Sort by estimated traffic value, descending.
          order_by: ["metrics.organic.etv,desc"],
        },
      ],
      headers
    );

    const items =
      (res.tasks?.[0]?.result?.[0] as
        | { items?: Array<Record<string, unknown>> }
        | undefined)?.items ?? [];

    return items.map(parseRow);
  } catch (err) {
    console.warn("[top-pages-traffic] relevant_pages failed:", err);
    return [];
  }
}

function parseRow(item: Record<string, unknown>): TopTrafficPage {
  const url = typeof item.page_address === "string" ? item.page_address : "";
  const metrics = item.metrics as Record<string, unknown> | undefined;
  const organic = metrics?.organic as Record<string, unknown> | undefined;

  // first_organic_serp_element gives us the top-ranking keyword on this page.
  const firstSerp = item.first_organic_serp_element as
    | Record<string, unknown>
    | undefined;
  const topKeyword =
    typeof firstSerp?.keyword === "string" ? (firstSerp.keyword as string) : null;
  const topKeywordPosition = numericOrNull(firstSerp?.rank_absolute);

  return {
    url,
    etv: numericOrNull(organic?.etv),
    organicKeywords: numericOrNull(organic?.count),
    topKeyword,
    topKeywordPosition,
  };
}
