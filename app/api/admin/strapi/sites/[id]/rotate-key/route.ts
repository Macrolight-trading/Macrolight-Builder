import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/strapi/admin-auth";
import { rotatePairingKey } from "@/lib/strapi/sites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/strapi/sites/[id]/rotate-key
 * Generate (or regenerate) the site's pairing key. The plaintext `token` is
 * returned exactly once — the admin must copy it now; only its hash is stored.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { site, token } = await rotatePairingKey(params.id);
    return NextResponse.json({ site, token });
  } catch (err: unknown) {
    if (typeof err === "object" && err && (err as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Site not found." }, { status: 404 });
    }
    console.error("POST rotate-key failed:", err);
    return NextResponse.json({ error: "Failed to rotate key." }, { status: 500 });
  }
}
