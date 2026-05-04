import { fetchSinglePage } from "../crawler";
import { scoreModule } from "../scorer";
import { hasCredentials as hasDataForSeoCredentials } from "../dataforseo-client";
import { fetchCitations, type CitationEntry } from "../enrichments/citations";
import type { AuditInput, AuditIssue, AuditModuleResult } from "../types";

/**
 * Local SEO module.
 *
 * Steps:
 *   1. Fetch the homepage and extract NAP (name / address / phone) using
 *      JSON-LD first, then regex fallbacks. Detect LocalBusiness schema.
 *   2. Look up the business in Google Places (Text Search) using the
 *      client name + city/region heuristic from extracted address.
 *   3. If a match is found, fetch Place Details for ratings, reviews,
 *      categories, hours, photos, website link.
 *   4. Compare site NAP against GBP NAP for consistency.
 *
 * Required env: GOOGLE_PLACES_API_KEY
 */

const PLACES_TEXT_SEARCH = "https://maps.googleapis.com/maps/api/place/textsearch/json";
const PLACES_DETAILS = "https://maps.googleapis.com/maps/api/place/details/json";
const REQUEST_TIMEOUT_MS = 15000;

interface SiteNap {
  name: string | null;
  address: string | null;
  phone: string | null;
  city: string | null;
  region: string | null;
}

interface PlacesData {
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
  isVerified: boolean | null;
  error?: string;
}

interface LocalSeoRawData {
  places: PlacesData;
  siteNap: SiteNap;
  hasLocalBusinessSchema: boolean;
  /** M9 citation audit. Empty array if DataForSEO creds missing or call failed. */
  citations?: CitationEntry[];
}

export async function runLocalSeoAudit(
  input: AuditInput
): Promise<AuditModuleResult> {
  const issues: AuditIssue[] = [];
  const positives: string[] = [];

  const placesKeyMissing = !process.env.GOOGLE_PLACES_API_KEY;

  // Step 1: try to fetch homepage. We use it for NAP extraction + schema
  // detection. If it fails AND we have no Places key, we have nothing to
  // work with — mark unavailable.
  const homepage = await fetchSinglePage(input.url);

  if (!homepage && placesKeyMissing) {
    return unavailable(
      "Site homepage could not be fetched and Google Places API key is not configured"
    );
  }

  const siteNap = homepage
    ? extractNap(homepage.html, homepage.textContent)
    : emptyNap();
  const hasLocalBusinessSchema = homepage?.meta.hasLocalBusinessSchema ?? false;

  // Step 2: query Google Places. If the key isn't set we skip silently — the
  // schema/NAP-only checks below still produce useful output.
  let places: PlacesData = emptyPlaces();
  let placesAttempted = false;
  if (!placesKeyMissing) {
    placesAttempted = true;
    try {
      places = await lookupGooglePlace(input.clientName, siteNap, input.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Places-call failure: if homepage also failed, the whole module is N/A.
      if (!homepage) {
        return unavailable(`Google Places API error: ${msg}`);
      }
      places = { ...emptyPlaces(), error: msg };
    }
  }

  // If neither data source produced anything useful, the module is N/A.
  if (!homepage && !places.placeId && !places.error) {
    return unavailable(
      "Google Places API key not configured and homepage could not be fetched"
    );
  }

  // Locality heuristic: does this look like a local business at all?
  // If none of these signals are present, the whole Local SEO module is a
  // category mismatch (Amazon, Stripe, Notion etc. shouldn't be flagged for
  // missing GBP listings or LocalBusiness schema). Bail before evaluating.
  const looksLocal =
    !!places.placeId ||
    hasLocalBusinessSchema ||
    !!(siteNap.city && siteNap.region);

  if (!looksLocal) {
    return {
      module: "localSeo",
      available: false,
      unavailableReason:
        "Audited site is not a local business (no Google Business Profile " +
        "found, no LocalBusiness schema on the homepage, no extracted " +
        "city/region). Local SEO checks only apply to businesses with a " +
        "physical service area.",
      score: 0,
      issues: [],
      rawData: {
        places,
        siteNap,
        hasLocalBusinessSchema,
        citations: [],
        placesAttempted,
        homepageFetched: !!homepage,
      } as LocalSeoRawData & { placesAttempted: boolean; homepageFetched: boolean },
      positives: [],
    };
  }

  // Step 3: evaluate. We only run GBP-dependent checks when the Places call
  // was actually attempted — otherwise we'd be reporting "no GBP" because we
  // never looked, which is exactly the misleading filler we're trying to
  // avoid.
  if (placesAttempted) {
    evaluateGbpExistence(places, issues, positives);
    evaluateReviewSignals(places, issues, positives);
    evaluatePhotos(places, issues);
    evaluateWebsiteLink(places, input.url, issues, positives);
    evaluateCategoriesAndHours(places, issues, positives);
  }
  if (homepage) {
    evaluateLocalBusinessSchema(hasLocalBusinessSchema, issues, positives);
    if (placesAttempted && places.placeId) {
      evaluateNapConsistency(siteNap, places, issues, positives);
    }
  }

  // ── M9 citation audit (DataForSEO) — best-effort. Skip silently when
  // DataForSEO creds aren't configured rather than failing the module. ──
  let citations: CitationEntry[] = [];
  if (hasDataForSeoCredentials() && input.clientName) {
    try {
      citations = await fetchCitations(
        input.clientName,
        siteNap.city,
        siteNap.region,
        { name: siteNap.name, address: siteNap.address, phone: siteNap.phone }
      );
      evaluateCitationConsistency(citations, issues, positives);
    } catch (err) {
      console.warn("[local-seo] citations enrichment failed:", err);
    }
  }

  return {
    module: "localSeo",
    available: true,
    score: scoreModule(issues),
    issues,
    rawData: {
      places,
      siteNap,
      hasLocalBusinessSchema,
      citations,
      placesAttempted,
      homepageFetched: !!homepage,
    } as LocalSeoRawData & { placesAttempted: boolean; homepageFetched: boolean },
    positives,
  };
}

function evaluateCitationConsistency(
  citations: CitationEntry[],
  issues: AuditIssue[],
  positives: string[]
): void {
  const listed = citations.filter((c) => c.listed);
  const mismatches = listed.filter((c) => !c.napMatch);
  const notListed = citations.filter((c) => !c.listed);

  if (mismatches.length > 0) {
    issues.push({
      module: "localSeo",
      severity: "warning",
      check: "citation_nap_mismatch",
      title: `NAP mismatches on ${mismatches.length} of ${listed.length} directory listings`,
      description:
        "Inconsistent NAP across directories weakens local-search ranking " +
        `signals. Inconsistent on: ${mismatches.map((m) => m.source).join(", ")}.`,
      recommendation:
        "Update each listing to match the canonical name, address, and " +
        "phone number on the website. Use the website as the source of truth.",
    });
  }

  if (notListed.length === citations.length) {
    // Catastrophic: not on a single major directory. This is a big local-SEO
    // weakness and shouldn't be tucked away as info.
    issues.push({
      module: "localSeo",
      severity: "critical",
      sentinel: true,
      check: "missing_citations",
      title: `Not listed on any of ${citations.length} major directories`,
      description:
        `The business doesn't appear on any of: ${notListed.map((c) => c.source).join(", ")}. ` +
        "Citations are a foundational local-ranking signal — being absent " +
        "across the board is one of the easier-to-fix gaps in local SEO.",
      recommendation:
        "Claim a listing on each major directory (Yelp, Yellow Pages, BBB, " +
        "Foursquare etc.). Most accept submissions in under 5 minutes per " +
        "site.",
    });
  } else if (notListed.length >= 5) {
    issues.push({
      module: "localSeo",
      severity: "warning",
      check: "missing_citations",
      title: `Not listed on ${notListed.length} of ${citations.length} major directories`,
      description:
        `Missing from: ${notListed.map((c) => c.source).join(", ")}. ` +
        "Each citation is a small but real local-ranking signal.",
      recommendation:
        "Claim free listings on the missing directories. Most accept " +
        "submissions in under 5 minutes.",
    });
  }

  if (listed.length === citations.length && mismatches.length === 0) {
    positives.push(
      `Listed and consistent across all ${citations.length} major directories.`
    );
  }
}

function unavailable(reason: string): AuditModuleResult {
  return {
    module: "localSeo",
    available: false,
    unavailableReason: reason,
    score: 0,
    issues: [],
    rawData: {
      places: emptyPlaces(),
      siteNap: emptyNap(),
      hasLocalBusinessSchema: false,
    } as LocalSeoRawData,
    positives: [],
  };
}

/* ── Google Places ──────────────────────────────────────────────────────── */

async function lookupGooglePlace(
  clientName: string,
  siteNap: SiteNap,
  siteUrl: string
): Promise<PlacesData> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not set");
  }

  // Build the best-guess query: client name + extracted city, falling back
  // to the domain.
  const queryParts = [clientName];
  if (siteNap.city) queryParts.push(siteNap.city);
  else queryParts.push(extractDomain(siteUrl) ?? "");
  const query = queryParts.filter(Boolean).join(" ");

  const placeId = await placesTextSearch(query, apiKey);
  if (!placeId) {
    return { ...emptyPlaces() };
  }

  return placeDetails(placeId, apiKey);
}

async function placesTextSearch(
  query: string,
  apiKey: string
): Promise<string | null> {
  const params = new URLSearchParams({ query, key: apiKey });
  const data = await fetchJson(`${PLACES_TEXT_SEARCH}?${params.toString()}`);

  const status = (data as { status?: string }).status;
  if (status === "ZERO_RESULTS") return null;
  if (status && status !== "OK") {
    throw new Error(
      `Places Text Search status ${status}: ${(data as { error_message?: string }).error_message ?? ""}`
    );
  }

  const results = (data as { results?: Array<{ place_id?: string }> }).results;
  return results?.[0]?.place_id ?? null;
}

async function placeDetails(
  placeId: string,
  apiKey: string
): Promise<PlacesData> {
  const params = new URLSearchParams({
    place_id: placeId,
    key: apiKey,
    fields: [
      "name",
      "formatted_address",
      "international_phone_number",
      "rating",
      "user_ratings_total",
      "types",
      "current_opening_hours",
      "photos",
      "website",
      "business_status",
    ].join(","),
  });

  const data = await fetchJson(`${PLACES_DETAILS}?${params.toString()}`);
  const status = (data as { status?: string }).status;
  if (status && status !== "OK") {
    throw new Error(
      `Places Details status ${status}: ${(data as { error_message?: string }).error_message ?? ""}`
    );
  }

  const r = (data as { result?: Record<string, unknown> }).result ?? {};

  const photos = Array.isArray(r.photos) ? r.photos.length : 0;
  const hours = (r.current_opening_hours as { weekday_text?: string[] } | undefined)
    ?.weekday_text;

  return {
    placeId,
    businessName: (r.name as string | undefined) ?? null,
    address: (r.formatted_address as string | undefined) ?? null,
    phone: (r.international_phone_number as string | undefined) ?? null,
    rating: typeof r.rating === "number" ? r.rating : null,
    reviewCount:
      typeof r.user_ratings_total === "number" ? r.user_ratings_total : null,
    categories: Array.isArray(r.types) ? (r.types as string[]) : [],
    hours: hours ?? null,
    photoCount: photos,
    websiteUrl: (r.website as string | undefined) ?? null,
    // Places API doesn't expose a "verified" flag directly. We treat
    // OPERATIONAL business_status + presence of a website link + phone as
    // a proxy for "claimed".
    isVerified:
      r.business_status === "OPERATIONAL" && !!r.website && !!r.international_phone_number,
  };
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

/* ── NAP extraction ─────────────────────────────────────────────────────── */

function extractNap(html: string, text: string): SiteNap {
  // 1. JSON-LD first (most reliable).
  const fromSchema = extractNapFromJsonLd(html);
  if (fromSchema.name || fromSchema.address || fromSchema.phone) {
    return fromSchema;
  }

  // 2. Regex fallbacks against visible body text.
  const phoneMatch = text.match(
    /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
  );
  const phone = phoneMatch ? normalizePhone(phoneMatch[0]) : null;

  // Address: very simplistic — find a line that looks like "123 Main St,
  // Springfield, IL 62701".
  const addressMatch = text.match(
    /\d{1,6}\s+[A-Z][\w\s.,'-]{3,80},\s*[A-Z][\w\s.'-]{1,40},\s*[A-Z]{2}\s*\d{5}(?:-\d{4})?/
  );
  const address = addressMatch ? addressMatch[0] : null;

  // City/region from address if found.
  let city: string | null = null;
  let region: string | null = null;
  if (address) {
    const parts = address.split(",").map((s) => s.trim());
    if (parts.length >= 3) {
      city = parts[parts.length - 2];
      region = parts[parts.length - 1].split(/\s+/)[0];
    }
  }

  return { name: null, address, phone, city, region };
}

function extractNapFromJsonLd(html: string): SiteNap {
  // Cheap regex pull of script blocks; we only do this if the crawler-parsed
  // jsonLdBlocks aren't accessible (we receive the raw HTML here).
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of blocks) {
    try {
      const parsed = JSON.parse(m[1]);
      const found = walkForNap(parsed);
      if (found) return found;
    } catch {
      // ignore malformed block
    }
  }
  return emptyNap();
}

function walkForNap(node: unknown): SiteNap | null {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const got = walkForNap(item);
      if (got) return got;
    }
    return null;
  }
  const obj = node as Record<string, unknown>;

  // If this looks like a LocalBusiness / Organization, extract.
  const type = obj["@type"];
  const isOrgish =
    (typeof type === "string" &&
      /Organization|LocalBusiness|Restaurant|Plumber|Electrician|Dentist|Physician|Service|Store/i.test(
        type
      )) ||
    (Array.isArray(type) &&
      type.some(
        (t) =>
          typeof t === "string" &&
          /Organization|LocalBusiness/i.test(t)
      ));

  if (isOrgish) {
    const name = typeof obj.name === "string" ? obj.name : null;
    const phoneRaw = obj.telephone;
    const phone =
      typeof phoneRaw === "string" ? normalizePhone(phoneRaw) : null;
    const addressNode = obj.address;
    const address = formatPostalAddress(addressNode);
    const city =
      addressNode && typeof addressNode === "object"
        ? ((addressNode as Record<string, unknown>).addressLocality as string) ?? null
        : null;
    const region =
      addressNode && typeof addressNode === "object"
        ? ((addressNode as Record<string, unknown>).addressRegion as string) ?? null
        : null;
    if (name || phone || address) {
      return { name, phone, address, city, region };
    }
  }

  if (Array.isArray(obj["@graph"])) {
    const got = walkForNap(obj["@graph"]);
    if (got) return got;
  }
  for (const v of Object.values(obj)) {
    if (typeof v === "object" && v !== null) {
      const got = walkForNap(v);
      if (got) return got;
    }
  }
  return null;
}

function formatPostalAddress(addr: unknown): string | null {
  if (!addr) return null;
  if (typeof addr === "string") return addr;
  if (typeof addr !== "object") return null;
  const a = addr as Record<string, unknown>;
  const parts = [
    a.streetAddress,
    a.addressLocality,
    a.addressRegion,
    a.postalCode,
  ]
    .filter((p): p is string => typeof p === "string" && p.length > 0)
    .join(", ");
  return parts || null;
}

function normalizePhone(raw: string): string {
  // Strip everything but digits and leading +.
  return raw
    .replace(/[^\d+]/g, "")
    .replace(/^\+1?(\d{10})$/, "+1$1");
}

/* ── Evaluators ─────────────────────────────────────────────────────────── */

function evaluateGbpExistence(
  places: PlacesData,
  issues: AuditIssue[],
  positives: string[]
): void {
  if (places.error) return; // already flagged at API-call level
  if (!places.placeId) {
    issues.push({
      module: "localSeo",
      severity: "critical",
      sentinel: true,
      check: "no_gbp_found",
      title: "No Google Business Profile found for this business",
      description:
        "We couldn't locate a Google Business Profile via search using the " +
        "client name and extracted location. Without a GBP, the business " +
        "won't appear in Google Maps results or the local pack.",
      recommendation:
        "Create a Google Business Profile at business.google.com and " +
        "complete every section: name, address, phone, hours, categories, " +
        "photos, services.",
      docsUrl: "https://www.google.com/business/",
    });
    return;
  }
  if (places.isVerified) {
    positives.push("Google Business Profile is present and looks claimed.");
  }
}

function evaluateLocalBusinessSchema(
  hasSchema: boolean,
  issues: AuditIssue[],
  positives: string[]
): void {
  if (!hasSchema) {
    issues.push({
      module: "localSeo",
      severity: "warning",
      check: "no_local_business_schema",
      title: "No LocalBusiness schema markup detected",
      description:
        "Structured data tells Google the business name, address, phone, " +
        "and hours in machine-readable form. Without it, Google has to " +
        "guess from page content.",
      recommendation:
        "Add JSON-LD LocalBusiness schema (or a more specific subtype like " +
        "Plumber, Restaurant, etc.) to the homepage and contact page.",
      docsUrl: "https://developers.google.com/search/docs/appearance/structured-data/local-business",
    });
  } else {
    positives.push("LocalBusiness schema markup is present on the homepage.");
  }
}

function evaluateNapConsistency(
  site: SiteNap,
  places: PlacesData,
  issues: AuditIssue[],
  positives: string[]
): void {
  if (!places.placeId) return;

  // Phone comparison — normalize both to digit-only.
  if (site.phone && places.phone) {
    const sitePhone = site.phone.replace(/\D/g, "");
    const gbpPhone = places.phone.replace(/\D/g, "");
    // Match on last 10 digits to allow country-code differences.
    if (sitePhone.slice(-10) !== gbpPhone.slice(-10)) {
      issues.push({
        module: "localSeo",
        severity: "warning",
        check: "phone_mismatch",
        title: "Phone number on website doesn't match Google Business Profile",
        description: `Site says ${site.phone}; GBP says ${places.phone}.`,
        recommendation:
          "Make sure the same phone number appears on the website, GBP, " +
          "and any directory listings (Yelp, Yellow Pages, etc.). " +
          "Inconsistent NAP weakens local ranking signals.",
      });
    } else {
      positives.push("Phone number matches between website and Google Business Profile.");
    }
  } else if (!site.phone) {
    issues.push({
      module: "localSeo",
      severity: "warning",
      check: "no_phone_on_site",
      title: "No phone number found on the homepage",
      description:
        "A clearly displayed phone number is one of the strongest local " +
        "trust signals — and one of the easiest things to miss.",
      recommendation:
        "Display the business phone number prominently on the homepage " +
        "and contact page.",
    });
  }

  if (site.address && places.address) {
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").replace(/[.,]/g, "");
    if (!norm(places.address).includes(norm(site.address.split(",")[0]))) {
      issues.push({
        module: "localSeo",
        severity: "info",
        check: "address_possibly_inconsistent",
        title: "Website address may not match Google Business Profile",
        description: `Site: ${site.address}\nGBP: ${places.address}`,
        recommendation:
          "Confirm the addresses are the same. Inconsistencies (suite " +
          "numbers, abbreviations) can confuse Google's local matching.",
      });
    }
  }
}

function evaluateReviewSignals(
  places: PlacesData,
  issues: AuditIssue[],
  positives: string[]
): void {
  if (!places.placeId) return;
  if (places.reviewCount == null) return;

  if (places.reviewCount < 10) {
    issues.push({
      module: "localSeo",
      severity: "warning",
      check: "low_review_count",
      title: `Only ${places.reviewCount} Google reviews`,
      description:
        "Local pack rankings strongly favour businesses with more (and " +
        "more recent) reviews. Below ~10 reviews you're at a real " +
        "disadvantage against competitors.",
      recommendation:
        "Set up a review-request flow: SMS or email after every job, with " +
        "a direct GBP review link. Aim for at least 1-2 new reviews per month.",
    });
  } else if (places.reviewCount >= 50 && places.rating && places.rating >= 4.5) {
    positives.push(
      `${places.reviewCount} reviews at ${places.rating.toFixed(1)} stars — strong social proof.`
    );
  }

  if (places.rating != null && places.rating < 4.0) {
    issues.push({
      module: "localSeo",
      severity: "warning",
      check: "low_rating",
      title: `Rating is ${places.rating.toFixed(1)} stars`,
      description:
        "Below 4.0 stars triggers user hesitation and reduces click-through " +
        "from local pack listings.",
      recommendation:
        "Address the underlying causes of negative reviews. Respond " +
        "professionally to existing 1-3 star reviews and re-engage happy " +
        "customers to leave new positive reviews.",
    });
  }
}

function evaluatePhotos(places: PlacesData, issues: AuditIssue[]): void {
  if (!places.placeId) return;
  if (places.photoCount === 0) {
    issues.push({
      module: "localSeo",
      severity: "warning",
      check: "no_gbp_photos",
      title: "Google Business Profile has no photos",
      description:
        "GBP listings with photos get significantly more clicks and " +
        "direction requests than those without.",
      recommendation:
        "Upload at least 10 high-quality photos: storefront/exterior, " +
        "interior, team, and finished work. Refresh quarterly.",
    });
  } else if (places.photoCount < 5) {
    issues.push({
      module: "localSeo",
      severity: "info",
      check: "few_gbp_photos",
      title: `Only ${places.photoCount} photos on Google Business Profile`,
      description: "More photos correlate with more clicks.",
      recommendation:
        "Add 5-10 more photos, especially recent work and team shots.",
    });
  }
}

function evaluateWebsiteLink(
  places: PlacesData,
  siteUrl: string,
  issues: AuditIssue[],
  positives: string[]
): void {
  if (!places.placeId) return;
  if (!places.websiteUrl) {
    issues.push({
      module: "localSeo",
      severity: "critical",
      check: "no_website_on_gbp",
      title: "Google Business Profile has no website link",
      description:
        "The 'Website' field on the GBP is empty. Visitors who find the " +
        "listing have no way to reach the site.",
      recommendation:
        "Add the website URL to the GBP listing's Website field.",
    });
    return;
  }

  // Same-domain check (allowing for trailing slash / www differences).
  try {
    const siteHost = new URL(siteUrl).hostname.replace(/^www\./, "");
    const gbpHost = new URL(places.websiteUrl).hostname.replace(/^www\./, "");
    if (siteHost !== gbpHost) {
      issues.push({
        module: "localSeo",
        severity: "warning",
        check: "gbp_website_different",
        title: "GBP website link points at a different domain",
        description: `GBP links to ${places.websiteUrl}, audit ran against ${siteUrl}.`,
        recommendation:
          "If the audited URL is the correct site, update the GBP listing.",
      });
    } else {
      positives.push("GBP website link points at the same domain.");
    }
  } catch {
    // ignore parse errors
  }
}

function evaluateCategoriesAndHours(
  places: PlacesData,
  issues: AuditIssue[],
  positives: string[]
): void {
  if (!places.placeId) return;
  if (places.categories.length === 0) {
    issues.push({
      module: "localSeo",
      severity: "warning",
      check: "no_gbp_categories",
      title: "GBP has no business categories set",
      description:
        "Categories tell Google what searches to surface the business for. " +
        "Missing categories massively limit local discoverability.",
      recommendation:
        "Set the most-specific primary category that matches the core " +
        "service, plus 2-5 secondary categories.",
    });
  }
  if (!places.hours || places.hours.length === 0) {
    issues.push({
      module: "localSeo",
      severity: "info",
      check: "no_gbp_hours",
      title: "GBP has no business hours listed",
      description:
        "Hours are a high-trust signal — listings without hours look " +
        "abandoned and may be deprioritised.",
      recommendation:
        "Add weekly hours and any holiday exceptions to the GBP listing.",
    });
  } else if (places.categories.length > 0) {
    positives.push("GBP categories and hours are configured.");
  }
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function emptyNap(): SiteNap {
  return {
    name: null,
    address: null,
    phone: null,
    city: null,
    region: null,
  };
}

function emptyPlaces(): PlacesData {
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
    isVerified: null,
  };
}
