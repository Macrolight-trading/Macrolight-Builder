import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateAndStoreSowForRequest } from "@/lib/sow/generate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/portal/plan-requests/[id]/sow/regenerate
 *
 * Re-runs the SOW PDF generation for a single plan request. Useful when:
 *   - The original /api/stripe/checkout call timed out and the SOW URL is
 *     missing from the row.
 *   - The Blob token was misconfigured at checkout time.
 *   - You edited a PlanOption and want the SOW to reflect the new name
 *     (note: SOW snapshots prices at checkout time, so re-generating
 *     uses the snapshotted prices, not the current PlanOption prices).
 *
 * Admin-only. Returns { sowPdfUrl } on success.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const url = await generateAndStoreSowForRequest(params.id);
    if (!url) {
      return NextResponse.json(
        { error: "Failed to generate SOW — see server logs" },
        { status: 500 },
      );
    }
    return NextResponse.json({ sowPdfUrl: url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "SOW regeneration failed";
    console.error("SOW regenerate error", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
