/**
 * Citations enrichment for the Local SEO module.
 *
 * Calls /business_data/business_listings/search/live with the business name
 * + city. Returns matches across major directory platforms (Yelp, BBB,
 * Yellow Pages, Foursquare, Apple Maps, Bing Places, etc.). For each match,
 * compare the listing's NAP fields against what we extracted from the site.
 *
 * Cost: per call (see DataForSEO Business Data pricing).
 */

import {
  buildAuthHeaders,
  callDataForSeoWithTaskCheck,
} from "../dataforseo-client";

export interface CitationEntry {
  /** Source platform (e.g. "yelp.com", "yellowpages.com"). */
  source: string;
  /** True if a listing was found on this source. */
  listed: boolean;
  /** True if the listing's NAP matches the on-site NAP. */
  napMatch: boolean;
  /** Specific fields that didn't match the site, if any. */
  mismatchFields: string[];
  /** Direct URL to the listing for outreach / cleanup. */
  url: string | null;
  /** What the listing has on file (for the dashboard / mismatch detail). */
  listingNap: {
    name: string | null;
    address: string | null;
    phone: string | null;
  };
}

/**
 * The directory universe we expect to see for a US service business. This is
 * the stable set we'll show in the report — even if a directory isn't in the
 * API response, we render it as "Not Listed" so the table doesn't shift
 * structure between audits.
 */
export const STABLE_CITATION_SOURCES = [
  "yelp.com",
  "yellowpages.com",
  "bbb.org",
  "foursquare.com",
  "mapquest.com",
  "manta.com",
  "merchantcircle.com",
  "superpages.com",
] as const;

interface SiteNapForComparison {
  name: string | null;
  address: string | null;
  phone: string | null;
}

export async function fetchCitations(
  clientName: string,
  city: string | null,
  region: string | null,
  siteNap: SiteNapForComparison
): Promise<CitationEntry[]> {
  const headers = buildAuthHeaders();

  const locationName = city && region ? `${city}, ${region}, United States` : "United States";

  let items: Array<Record<string, unknown>> = [];
  try {
    const payload: Record<string, unknown> = {
      // The search endpoint accepts a free-form description + filters.
      description: clientName,
      location_name: locationName,
      limit: 50,
    };

    let res;
    try {
      res = await callDataForSeoWithTaskCheck(
        "/business_data/business_listings/search/live",
        [payload],
        headers
      );
    } catch (err: unknown) {
      // Some accounts/plans reject location hints. Retry once without location.
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("Invalid Field")) throw err;
      const retryPayload = { description: clientName, limit: 50 };
      res = await callDataForSeoWithTaskCheck(
        "/business_data/business_listings/search/live",
        [retryPayload],
        headers
      );
    }

    items =
      (res.tasks?.[0]?.result?.[0] as
        | { items?: Array<Record<string, unknown>> }
        | undefined)?.items ?? [];
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[citations] business_listings/search unavailable:", msg);
    return STABLE_CITATION_SOURCES.map((source) => ({
      source,
      listed: false,
      napMatch: false,
      mismatchFields: [],
      url: null,
      listingNap: { name: null, address: null, phone: null },
    }));
  }

  // Index returned items by their source. The `data_source` field tells us
  // which directory the listing came from.
  const bySource = new Map<string, Record<string, unknown>>();
  for (const item of items) {
    const ds = typeof item.data_source === "string" ? item.data_source.toLowerCase() : null;
    if (!ds) continue;
    // First match per source wins — they're returned in relevance order.
    if (!bySource.has(ds)) bySource.set(ds, item);
  }

  return STABLE_CITATION_SOURCES.map((source) => {
    const match = bySource.get(source);
    if (!match) {
      return {
        source,
        listed: false,
        napMatch: false,
        mismatchFields: [],
        url: null,
        listingNap: { name: null, address: null, phone: null },
      };
    }

    const listingNap = {
      name: typeof match.title === "string" ? (match.title as string) : null,
      address: typeof match.address === "string" ? (match.address as string) : null,
      phone:
        typeof match.phone === "string"
          ? (match.phone as string)
          : Array.isArray(match.phone_numbers) &&
            typeof (match.phone_numbers as unknown[])[0] === "string"
          ? ((match.phone_numbers as string[])[0])
          : null,
    };

    const mismatchFields: string[] = [];
    if (siteNap.name && listingNap.name && !looseMatch(listingNap.name, siteNap.name)) {
      mismatchFields.push("name");
    }
    if (siteNap.phone && listingNap.phone && !phoneMatch(listingNap.phone, siteNap.phone)) {
      mismatchFields.push("phone");
    }
    if (
      siteNap.address &&
      listingNap.address &&
      !addressMatch(listingNap.address, siteNap.address)
    ) {
      mismatchFields.push("address");
    }

    return {
      source,
      listed: true,
      napMatch: mismatchFields.length === 0,
      mismatchFields,
      url: typeof match.url === "string" ? (match.url as string) : null,
      listingNap,
    };
  });
}

function looseMatch(a: string, b: string): boolean {
  return normalize(a) === normalize(b);
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,'`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function phoneMatch(a: string, b: string): boolean {
  const digA = a.replace(/\D/g, "");
  const digB = b.replace(/\D/g, "");
  return digA.slice(-10) === digB.slice(-10);
}

function addressMatch(a: string, b: string): boolean {
  // Strict normalize then check that the listing address contains the site
  // street part (first comma-segment of the site address).
  const siteFirst = b.split(",")[0]?.trim() ?? b;
  return normalize(a).includes(normalize(siteFirst));
}
