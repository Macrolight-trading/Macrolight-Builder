/**
 * Top-pages-by-backlinks enrichment for the Backlinks module.
 *
 * Calls /backlinks/domain_pages_summary/live to identify which pages on the
 * audited domain hold the most link equity. Useful for prioritising redirect
 * strategy when a rebuild changes URL structure.
 *
 * Cost: $0.02 per call + $0.00003 per row.
 */

import {
  buildAuthHeaders,
  callDataForSeoWithTaskCheck,
  numericOrNull,
} from "../dataforseo-client";

export interface TopBacklinkPage {
  url: string;
  /** Total backlinks pointing at this page. */
  backlinks: number | null;
  referringDomains: number | null;
  /** First-seen-as-broken count — signals link rot. */
  brokenBacklinks: number | null;
}

const ROW_LIMIT = 10;

export async function fetchTopBacklinkPages(
  targetDomain: string
): Promise<TopBacklinkPage[]> {
  const headers = buildAuthHeaders();

  try {
    const res = await callDataForSeoWithTaskCheck(
      "/backlinks/domain_pages_summary/live",
      [
        {
          target: targetDomain,
          limit: ROW_LIMIT,
          order_by: ["backlinks,desc"],
          internal_list_limit: 0,
        },
      ],
      headers
    );

    const items =
      (res.tasks?.[0]?.result?.[0] as
        | { items?: Array<Record<string, unknown>> }
        | undefined)?.items ?? [];

    return items.map(parseRow);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[top-pages-backlinks] domain_pages_summary unavailable:", msg);
    return [];
  }
}

function parseRow(item: Record<string, unknown>): TopBacklinkPage {
  return {
    url: typeof item.url === "string" ? item.url : "",
    backlinks: numericOrNull(item.backlinks),
    referringDomains: numericOrNull(item.referring_domains),
    brokenBacklinks: numericOrNull(item.broken_backlinks),
  };
}
