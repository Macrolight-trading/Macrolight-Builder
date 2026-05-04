/**
 * Backlink history enrichment for the Backlinks module.
 *
 * Calls /backlinks/history/live to get monthly RD count + backlink count
 * snapshots for the audited domain. Renders alongside the traffic trend in
 * the PDF + dashboard.
 *
 * Cost: $0.02 per call + $0.00003 per row.
 */

import {
  buildAuthHeaders,
  callDataForSeoWithTaskCheck,
  numericOrNull,
} from "../dataforseo-client";

export interface BacklinkHistoryPoint {
  /** "YYYY-MM" — the month this point represents. */
  month: string;
  backlinks: number | null;
  referringDomains: number | null;
}

const MONTHS_BACK = 12;

export async function fetchBacklinkHistory(
  targetDomain: string
): Promise<BacklinkHistoryPoint[]> {
  const headers = buildAuthHeaders();

  try {
    const res = await callDataForSeoWithTaskCheck(
      "/backlinks/history/live",
      [{ target: targetDomain }],
      headers
    );

    const items =
      (res.tasks?.[0]?.result?.[0] as
        | { items?: Array<Record<string, unknown>> }
        | undefined)?.items ?? [];

    const points = items
      .map(parseRow)
      .filter((p): p is BacklinkHistoryPoint => p !== null);

    points.sort((a, b) => a.month.localeCompare(b.month));
    return points.slice(-MONTHS_BACK);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[backlink-history] history unavailable:", msg);
    return [];
  }
}

function parseRow(item: Record<string, unknown>): BacklinkHistoryPoint | null {
  // history/live returns each item with a `date` field (YYYY-MM-DD) plus
  // backlink + referring-domain counts.
  const dateRaw = typeof item.date === "string" ? item.date : null;
  if (!dateRaw) return null;
  // Trim to YYYY-MM.
  const month = dateRaw.slice(0, 7);

  return {
    month,
    backlinks: numericOrNull(item.backlinks),
    referringDomains: numericOrNull(item.referring_domains),
  };
}
