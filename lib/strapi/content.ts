import type {
  StrapiContentEntry,
  StrapiContentStatus,
  StrapiContentVisibility,
  StrapiSite,
} from "@prisma/client";
import prisma from "@/lib/prisma";

export type ContentEntryInput = {
  sourceProvider?: string | null;
  sourceRequestId?: string | null;
  entryType?: string | null;
  title: string;
  slug?: string | null;
  excerpt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  markdown: string;
  html: string;
  heroImage?: unknown;
  metadata?: unknown;
  status?: StrapiContentStatus;
  visibility?: StrapiContentVisibility;
  publishedAt?: Date | string | null;
};

export type AdminContentEntry = {
  id: string;
  siteId: string;
  siteSlug: string;
  siteName: string;
  sourceProvider: string;
  sourceRequestId: string | null;
  entryType: string;
  title: string;
  slug: string;
  excerpt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  markdown: string;
  html: string;
  heroImage: unknown;
  metadata: unknown;
  status: StrapiContentStatus;
  visibility: StrapiContentVisibility;
  externalEntryId: string | null;
  publishedAt: string | null;
  lastSyncedAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ScopedContentPayload = {
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
  status: StrapiContentStatus;
  visibility: StrapiContentVisibility;
  publishedAt: string | null;
  updatedAt: string;
};

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96) || "content";
}

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function stripMarkdown(markdown: string): string {
  return collapseWhitespace(
    markdown
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/^[>#\-*\d.\s]+/gm, "")
      .replace(/[\*_~]/g, " ")
  );
}

function toExcerpt(markdown: string, fallback?: string | null): string | null {
  const explicit = fallback ? collapseWhitespace(fallback) : "";
  if (explicit) return explicit.slice(0, 220);
  const text = stripMarkdown(markdown);
  return text ? text.slice(0, 220) : null;
}

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toScopedContentPayload(entry: StrapiContentEntry): ScopedContentPayload {
  return {
    id: entry.id,
    siteId: entry.siteId,
    slug: entry.slug,
    title: entry.title,
    entryType: entry.entryType,
    excerpt: entry.excerpt,
    seoTitle: entry.seoTitle,
    seoDescription: entry.seoDescription,
    markdown: entry.markdown,
    html: entry.html,
    heroImage: entry.heroImage,
    metadata: entry.metadata,
    status: entry.status,
    visibility: entry.visibility,
    publishedAt: entry.publishedAt?.toISOString() ?? null,
    updatedAt: entry.updatedAt.toISOString(),
  };
}

function toAdminContentEntry(
  entry: StrapiContentEntry & { site: Pick<StrapiSite, "slug" | "name"> }
): AdminContentEntry {
  return {
    ...toScopedContentPayload(entry),
    siteSlug: entry.site.slug,
    siteName: entry.site.name,
    sourceProvider: entry.sourceProvider,
    sourceRequestId: entry.sourceRequestId,
    externalEntryId: entry.externalEntryId,
    lastSyncedAt: entry.lastSyncedAt?.toISOString() ?? null,
    lastError: entry.lastError,
    createdAt: entry.createdAt.toISOString(),
  };
}

export async function upsertContentEntry(
  site: Pick<StrapiSite, "id" | "slug" | "name">,
  input: ContentEntryInput
): Promise<AdminContentEntry> {
  const title = collapseWhitespace(input.title);
  if (!title) throw new Error("Content title is required.");
  const markdown = input.markdown.trim();
  const html = input.html.trim();
  if (!markdown || !html) throw new Error("Content markdown and html are required.");

  const slug = slugify(input.slug || title);
  const data = {
    siteId: site.id,
    sourceProvider: collapseWhitespace(input.sourceProvider || "visboost") || "visboost",
    sourceRequestId: input.sourceRequestId?.trim() || null,
    entryType: collapseWhitespace(input.entryType || "blog_post") || "blog_post",
    title,
    slug,
    excerpt: toExcerpt(markdown, input.excerpt),
    seoTitle: input.seoTitle?.trim() || title,
    seoDescription: input.seoDescription?.trim() || toExcerpt(markdown),
    markdown,
    html,
    heroImage: input.heroImage ?? undefined,
    metadata: input.metadata ?? undefined,
    status: input.status ?? "DRAFT",
    visibility: input.visibility ?? "INTERNAL",
    publishedAt: toDate(input.publishedAt),
    lastSyncedAt: new Date(),
    lastError: null,
  } satisfies Parameters<typeof prisma.strapiContentEntry.create>[0]["data"];

  let entry: StrapiContentEntry;
  if (data.sourceRequestId) {
    const existing = await prisma.strapiContentEntry.findFirst({
      where: { siteId: site.id, sourceRequestId: data.sourceRequestId },
    });
    entry = existing
      ? await prisma.strapiContentEntry.update({ where: { id: existing.id }, data })
      : await prisma.strapiContentEntry.create({ data });
  } else {
    entry = await prisma.strapiContentEntry.upsert({
      where: { siteId_slug: { siteId: site.id, slug } },
      create: data,
      update: data,
    });
  }

  await prisma.strapiSite.update({
    where: { id: site.id },
    data: { lastSyncedAt: new Date(), lastError: null, status: "ACTIVE" },
  });

  const withSite = await prisma.strapiContentEntry.findUnique({
    where: { id: entry.id },
    include: { site: { select: { slug: true, name: true } } },
  });

  if (!withSite) throw new Error("Failed to reload saved content entry.");
  return toAdminContentEntry(withSite);
}

export async function listContentEntriesForAdmin(filters?: {
  siteId?: string | null;
  slug?: string | null;
  limit?: number;
}): Promise<AdminContentEntry[]> {
  const rows = await prisma.strapiContentEntry.findMany({
    where: {
      ...(filters?.siteId ? { siteId: filters.siteId } : {}),
      ...(filters?.slug ? { slug: filters.slug } : {}),
    },
    include: { site: { select: { slug: true, name: true } } },
    orderBy: { updatedAt: "desc" },
    take: Math.min(filters?.limit ?? 50, 100),
  });
  return rows.map(toAdminContentEntry);
}

/** Full paired read — VisBoost and Builder ops review (includes INTERNAL drafts). */
export async function listScopedContentEntries(siteId: string, slug?: string | null) {
  const rows = await prisma.strapiContentEntry.findMany({
    where: {
      siteId,
      visibility: { in: ["INTERNAL", "FUTURE_SITE_READ"] },
      ...(slug ? { slug } : {}),
    },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(toScopedContentPayload);
}

/**
 * Site renderer read — same API key as VisBoost, but only returns content the
 * live client site is allowed to render (published + site-visible).
 */
export async function listRenderableContentEntries(siteId: string, slug?: string | null) {
  const rows = await prisma.strapiContentEntry.findMany({
    where: {
      siteId,
      status: "PUBLISHED",
      visibility: "FUTURE_SITE_READ",
      ...(slug ? { slug } : {}),
    },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(toScopedContentPayload);
}
