import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/strapi/admin-auth";
import { listSites, upsertSite } from "@/lib/strapi/sites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const upsertSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  userId: z.string().max(200).optional().or(z.literal("")),
  projectId: z.string().max(200).optional().or(z.literal("")),
  strapiBaseUrl: z.string().url().max(500).optional().or(z.literal("")),
  strapiSpaceId: z.string().max(200).optional().or(z.literal("")),
  strapiCollection: z.string().max(200).optional().or(z.literal("")),
  status: z.enum(["UNLINKED", "PENDING", "ACTIVE", "ERROR", "DISABLED"]).optional(),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sites = await listSites();
  return NextResponse.json({ sites });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { id, ...input } = parsed.data;
  try {
    const site = await upsertSite(input, id);
    return NextResponse.json({ site }, { status: id ? 200 : 201 });
  } catch (err: unknown) {
    // Unique-constraint collision on slug / prefix surfaces here.
    if (typeof err === "object" && err && (err as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "A site with that slug already exists." },
        { status: 409 }
      );
    }
    if (typeof err === "object" && err && (err as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Site not found." }, { status: 404 });
    }
    console.error("POST /api/admin/strapi/sites failed:", err);
    return NextResponse.json({ error: "Failed to save site." }, { status: 500 });
  }
}
