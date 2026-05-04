/**
 * Historical traffic enrichment for the Domain Analytics module.
 *
 * Calls /dataforseo_labs/google/historical_rank_overview/live to get 12
 * months of monthly snapshots: organic-keyword count + estimated monthly
 * traffic. Renders as a sparkline in the PDF + dashboard.
 *
 * Cost: $0.10 per task + $0.001 per row.
 */

import {
  buildAuthHeaders,
  callDataForSeoWithTaskCheck,
  numericOrNull,
} from "../dataforseo-client";

export interface HistoricalTrafficPoint {
  /** "YYYY-MM" — the month this point represents. */
  month: string;
  organicCount: number | null;
  organicEtv: number | null;
}

const LOCATION_CODE = 2840;
const LANGUAGE_CODE = "en";
/** 12 most recent months. */
const MONTHS_BACK = 12;

export async function fetchHistoricalTraffic(
  targetDomain: string
): Promise<HistoricalTrafficPoint[]> {
  const headers = buildAuthHeaders();

  try {
    const res = await callDataForSeoWithTaskCheck(
      "/dataforseo_labs/google/historical_rank_overview/live",
      [
        {
          target: targetDomain,
          location_code: LOCATION_CODE,
          language_code: LANGUAGE_CODE,
        },
      ],
      headers
    );

    const items =
      (res.tasks?.[0]?.result?.[0] as
        | { items?: Array<Record<string, unknown>> }
        | undefined)?.items ?? [];

    const points = items.map(parseRow).filter((p): p is HistoricalTrafficPoint => p !== null);

    // Sort chronologically and keep the most recent N months.
    points.sort((a, b) => a.month.localeCompare(b.month));
    return points.slice(-MONTHS_BACK);
  } catch (err) {
    console.warn("[historical-traffic] historical_rank_overview failed:", err);
    return [];
  }
}

function parseRow(item: Record<string, unknown>): HistoricalTrafficPoint | null {
  // The endpoint returns rows tagged by year + month.
  const year = numericOrNull(item.year);
  const month = numericOrNull(item.month);
  if (year == null || month == null) return null;

  const monthStr = `${year}-${String(month).padStart(2, "0")}`;
  const metrics = item.metrics as Record<string, unknown> | undefined;
  const organic = metrics?.organic as Record<string, unknown> | undefined;

  return {
    month: monthStr,
    organicCount: numericOrNull(organic?.count),
    organicEtv: numericOrNull(organic?.etv),
  };
}
