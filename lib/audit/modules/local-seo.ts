import { fetchSinglePage } from "../crawler";
import { scoreModule } from "../scorer";
import type { AuditInput, AuditIssue, AuditModuleResult } from "../types";

/**
 * Local SEO module.
 *
 * STATUS: Scaffolding stub.
 *
 * Production implementation (per plan section 3.4) will check:
 *   - Google Business Profile exists + is verified
 *   - NAP (name / address / phone) on the website matches GBP listing
 *   - LocalBusiness schema markup present on the site
 *   - Star rating + review count
 *   - GBP business categories
 *   - Hours listed
 *   - Photos present on GBP listing
 *   - Website URL linked from GBP
 *
 * Data source: Google Places API (Text Search + Place Details). Free tier
 * comfortably covers expected volume.
 *
 * Required env: GOOGLE_PLACES_API_KEY
 */

const PLACES_TEXT_SEARCH = "https://maps.googleapis.com/maps/api/place/textsearch/json";
const PLACES_DETAILS = "https://maps.googleapis.com/maps/api/place/details/json";

interface LocalSeoRawData {
  placeId: string | null;
  businessName: string | null;
  address: string | null;
  phone: string | null;
  rating: number | null;
  reviewCount: number | null;
  categories: string[];
  hours: string[] | null;
  photoCount: number;
  websiteUrl: string | null;
  /** NAP fields extracted from the audited site (for comparison). */
  siteNap: {
    name: string | null;
    address: string | null;
    phone: string | null;
  };
  hasLocalBusinessSchema: boolean;
}

export async function runLocalSeoAudit(
  input: AuditInput
): Promise<AuditModuleResult> {
  const issues: AuditIssue[] = [];
  const positives: string[] = [];

  const sitePage = await fetchSinglePage(input.url);
  const siteNap = sitePage ? extractNapFromHtml(sitePage.html) : {
    name: null,
    address: null,
    phone: null,
  };

  const placesData = await lookupGooglePlace(input.clientName, input.url).catch(
    (err: unknown) => {
      issues.push({
        module: "localSeo",
        severity: "warning",
        check: "places_api_unavailable",
        title: "Could not retrieve Google Business Profile data",
        description:
          "The Google Places API call failed. GBP-related checks were skipped.",
        recommendation:
          "Verify GOOGLE_PLACES_API_KEY is set and that the Places API is " +
          "enabled in the linked Google Cloud project.",
        docsUrl: "https://developers.google.com/maps/documentation/places/web-service/overview",
      });
      return {
        placeId: null,
        businessName: null,
        address: null,
        phone: null,
        rating: null,
        reviewCount: null,
        categories: [],
        hours: null,
        photoCount: 0,
        websiteUrl: null,
        _error: err instanceof Error ? err.message : String(err),
      };
    }
  );

  const rawData: LocalSeoRawData = {
    ...placesData,
    siteNap,
    hasLocalBusinessSchema: sitePage
      ? detectLocalBusinessSchema(sitePage.html)
      : false,
  };

  // TODO(milestone-3): convert findings into severity-tagged issues.
  //   - No GBP found -> critical
  //   - GBP exists but website URL not linked -> warning
  //   - NAP mismatch between site and GBP -> warning
  //   - No LocalBusiness schema on site -> warning
  //   - Rating < 4.0 or review count < 10 -> info
  //   - No photos -> warning

  return {
    module: "localSeo",
    score: scoreModule(issues),
    issues,
    rawData,
    positives,
  };
}

/**
 * STUB: Look up the business in Google Places.
 *
 * Strategy: text search using `${clientName} ${siteDomain}` then call Place
 * Details for the first match.
 */
async function lookupGooglePlace(
  clientName: string,
  url: string
): Promise<Omit<LocalSeoRawData, "siteNap" | "hasLocalBusinessSchema">> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not set");
  }

  // TODO(milestone-3): real implementation.
  void clientName;
  void url;
  void PLACES_TEXT_SEARCH;
  void PLACES_DETAILS;

  return {
    placeId: null,
    businessName: null,
    address: null,
    phone: null,
    rating: null,
    reviewCount: null,
    categories: [],
    hours: null,
    photoCount: 0,
    websiteUrl: null,
  };
}

/**
 * STUB: pull NAP candidates out of an HTML page.
 *
 * Production implementation will use cheerio + regex for phone (E.164-ish)
 * and structured-data parsing for address. For now returns nulls.
 */
function extractNapFromHtml(html: string): {
  name: string | null;
  address: string | null;
  phone: string | null;
} {
  void html;
  return { name: null, address: null, phone: null };
}

/**
 * STUB: detect a JSON-LD LocalBusiness block.
 *
 * Real implementation: parse all <script type="application/ld+json"> blocks
 * and check `@type === "LocalBusiness"` (or any of its subtypes).
 */
function detectLocalBusinessSchema(html: string): boolean {
  void html;
  return false;
}
