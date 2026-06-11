import { NextRequest, NextResponse } from "next/server";
import type { StrapiSite } from "@prisma/client";
import { isAdminRequest } from "@/lib/strapi/admin-auth";
import {
  authenticatePairingRequest,
  markPaired,
  toPairingPayload,
} from "@/lib/strapi/sites";
import {
  listContentEntriesForAdmin,
  listRenderableContentEntries,
  listScopedContentEntries,
  upsertContentEntry,
} from "@/lib/strapi/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdminOrPair(
  req: NextRequest
): Promise<
  | { kind: "admin" }
  | { kind: "paired"; site: StrapiSite }
  | { kind: "error"; response: NextResponse }
> {
  if (await isAdminRequest()) return { kind: "admin" as const };

  const pairing = await authenticatePairingRequest(req);
  if (!pairing.ok) {
    const message = pairing.status === 403 ? "Site is disabled." : "Invalid pairing key.";
    return { kind: "error" as const, response: NextResponse.json({ error: message }, { status: pairing.status }) };
  }

  await markPaired(pairing.site.id);
  return { kind: "paired" as const, site: pairing.site };
}

export async function GET(req: NextRequest) {
  const auth = await requireAdminOrPair(req);
  if (auth.kind === "error") return auth.response;

  const slug = req.nextUrl.searchParams.get("slug")?.trim() || null;
  const audience = req.nextUrl.searchParams.get("audience")?.trim().toLowerCase() || null;

  if (auth.kind === "admin") {
    const siteId = req.nextUrl.searchParams.get("siteId")?.trim() || null;
    const limit = Number(req.nextUrl.searchParams.get("limit") || "50");
    const entries = await listContentEntriesForAdmin({ siteId, slug, limit });
    return NextResponse.json({ ok: true, entries });
  }

  // Same x-macrolight-key for VisBoost and client site renderers. VisBoost uses
  // the default read (all paired entries). Client sites pass audience=site to
  // receive only PUBLISHED + FUTURE_SITE_READ content.
  const entries =
    audience === "site"
      ? await listRenderableContentEntries(auth.site.id, slug)
      : await listScopedContentEntries(auth.site.id, slug);

  return NextResponse.json({ ok: true, site: toPairingPayload(auth.site), entries });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminOrPair(req);
  if (auth.kind === "error") return auth.response;

  if (auth.kind !== "paired") {
    return NextResponse.json(
      { error: "POST /api/strapi/content is reserved for paired machine clients." },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Request body must be an object." }, { status: 422 });
  }

  const payload = body as Record<string, unknown>;
  const title = typeof payload.title === "string" ? payload.title : "";
  const markdown = typeof payload.markdown === "string" ? payload.markdown : "";
  const html = typeof payload.html === "string" ? payload.html : "";

  if (!title.trim()) {
    return NextResponse.json({ error: "title is required." }, { status: 422 });
  }
  if (!markdown.trim() || !html.trim()) {
    return NextResponse.json({ error: "markdown and html are required." }, { status: 422 });
  }

  try {
    const entry = await upsertContentEntry(auth.site, {
      sourceProvider:
        typeof payload.sourceProvider === "string" ? payload.sourceProvider : "visboost",
      sourceRequestId:
        typeof payload.sourceRequestId === "string" ? payload.sourceRequestId : null,
      entryType: typeof payload.entryType === "string" ? payload.entryType : "blog_post",
      title,
      slug: typeof payload.slug === "string" ? payload.slug : null,
      excerpt: typeof payload.excerpt === "string" ? payload.excerpt : null,
      seoTitle: typeof payload.seoTitle === "string" ? payload.seoTitle : null,
      seoDescription:
        typeof payload.seoDescription === "string" ? payload.seoDescription : null,
      markdown,
      html,
      heroImage: payload.heroImage,
      metadata: payload.metadata,
      status:
        payload.status === "PUBLISHED" || payload.status === "ARCHIVED"
          ? payload.status
          : "DRAFT",
      visibility:
        payload.visibility === "FUTURE_SITE_READ" ? "FUTURE_SITE_READ" : "INTERNAL",
      publishedAt:
        typeof payload.publishedAt === "string" ? payload.publishedAt : undefined,
    });

    return NextResponse.json({ ok: true, site: toPairingPayload(auth.site), entry });
  } catch (error) {
    console.error("POST /api/strapi/content failed:", error);
    return NextResponse.json({ error: "Failed to save content entry." }, { status: 500 });
  }
}
