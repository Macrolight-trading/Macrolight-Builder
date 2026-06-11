import { NextRequest, NextResponse } from "next/server";
import {
  authenticatePairingRequest,
  markPaired,
  toPairingPayload,
} from "@/lib/strapi/sites";

/**
 * POST /api/strapi/pair — pairing endpoint for external products (e.g. VisBoost).
 *
 * Authenticated by the site's API key (shared by VisBoost and the client site
 * renderer), NOT a browser session: send it as `x-macrolight-key` (or
 * `Authorization: Bearer <key>`). The
 * key is matched by its non-secret prefix and verified with a constant-time
 * hash comparison. On success we return only the minimal site/client/project
 * details an external app needs to pair to the right Macrolight Builder site.
 *
 * Server-to-server only — never call from a browser (the key would leak).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle(req: NextRequest) {
  const result = await authenticatePairingRequest(req);
  if (!result.ok) {
    const message = result.status === 403 ? "Site is disabled." : "Invalid pairing key.";
    return NextResponse.json({ error: message }, { status: result.status });
  }

  // Best-effort stamp; a pairing should still succeed if this write fails.
  try {
    await markPaired(result.site.id);
  } catch (err) {
    console.error("markPaired failed during pairing:", err);
  }

  return NextResponse.json({ ok: true, site: toPairingPayload(result.site) });
}

// GET and POST both supported: pairing is a read of the caller's own site.
export async function POST(req: NextRequest) {
  return handle(req);
}

export async function GET(req: NextRequest) {
  return handle(req);
}
