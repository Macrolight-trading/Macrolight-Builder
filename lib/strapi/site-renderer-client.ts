/**
 * Copy this module into client site repos (or import from a shared package later).
 *
 * VisBoost and the client site page renderer share ONE per-site API key
 * (`mlsk_…`), generated in Builder admin at /admin/portal/strapi.
 *
 * - VisBoost: POST + GET /api/strapi/content (default audience)
 * - Client site: GET /api/strapi/content?audience=site (server-side only)
 *
 * Never expose MACROLIGHT_SITE_KEY to the browser.
 */

export type SiteContentEntry = {
  id: string;
  siteId: string;
  slug: string;
  title: string;
  entryType: string;
  excerpt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  markdown: string;
  html: string;
  heroImage: unknown;
  metadata: unknown;
  status: string;
  visibility: string;
  publishedAt: string | null;
  updatedAt: string;
};

export type FetchSiteContentOptions = {
  builderUrl: string;
  siteKey: string;
  slug?: string;
  revalidate?: number;
};

export async function fetchSiteContent(
  options: FetchSiteContentOptions
): Promise<{ site: { siteId: string; slug: string; name: string }; entries: SiteContentEntry[] }> {
  const base = options.builderUrl.replace(/\/$/, "");
  const params = new URLSearchParams({ audience: "site" });
  if (options.slug) params.set("slug", options.slug);

  const res = await fetch(`${base}/api/strapi/content?${params}`, {
    headers: { "x-macrolight-key": options.siteKey },
    next: options.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(
      typeof data?.error === "string" ? data.error : `Builder content fetch failed (${res.status})`
    );
  }

  const data = await res.json();
  return { site: data.site, entries: data.entries };
}

export async function fetchSitePage(
  options: FetchSiteContentOptions & { slug: string }
): Promise<SiteContentEntry | null> {
  const { entries } = await fetchSiteContent(options);
  return entries[0] ?? null;
}
