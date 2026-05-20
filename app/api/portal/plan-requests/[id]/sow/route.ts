import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/portal/plan-requests/[id]/sow
 *
 * Authenticated proxy for the SOW PDF stored in Vercel Blob.
 *
 * Vercel Blob private stores return URLs that aren't directly browser-
 * accessible — they require an Authorization header with the read/write
 * token, which we can't safely expose to the client. So we proxy: verify
 * the user owns the request (or is admin), fetch the blob with the token
 * server-side, and stream the bytes back.
 *
 * Mirrors app/api/portal/media/[id]/img for consistency.
 *
 * Query params:
 *   ?download=1   → sets Content-Disposition: attachment for save-as.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === "ADMIN";
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const request = await prisma.customPlanRequest.findUnique({
    where: { id: params.id },
    select: { userId: true, sowPdfUrl: true, basePlan: true },
  });
  if (!request) return new NextResponse("Not found", { status: 404 });

  if (request.userId !== userId && !isAdmin) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  if (!request.sowPdfUrl) {
    return new NextResponse("SOW not generated yet", { status: 404 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return new NextResponse("Blob token not configured", { status: 500 });
  }

  const upstream = await fetch(request.sowPdfUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!upstream.ok) {
    return new NextResponse(
      `Failed to fetch SOW (${upstream.status})`,
      { status: upstream.status },
    );
  }

  const isDownload = req.nextUrl.searchParams.get("download") === "1";
  const filename = `SOW-${params.id.slice(-10).toUpperCase()}.pdf`;

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Cache-Control": "private, max-age=3600",
      ...(isDownload
        ? { "Content-Disposition": `attachment; filename="${filename}"` }
        : {
            "Content-Disposition": `inline; filename="${filename}"`,
          }),
    },
  });
}
