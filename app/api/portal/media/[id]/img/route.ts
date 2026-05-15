import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const file = await prisma.mediaFile.findUnique({ where: { id: params.id } });
  if (!file) return new NextResponse("Not found", { status: 404 });

  if (file.userId !== userId && !isAdmin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return new NextResponse("Blob token not configured", { status: 500 });

  const upstream = await fetch(file.url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!upstream.ok) {
    return new NextResponse("Failed to fetch image", { status: upstream.status });
  }

  const isDownload = req.nextUrl.searchParams.get("download") === "1";

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "private, max-age=3600",
      ...(isDownload
        ? { "Content-Disposition": `attachment; filename="${file.filename}"` }
        : {}),
    },
  });
}
