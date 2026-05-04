import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

/**
 * GET    /api/audits/:id  — single audit job + result (admin only)
 * DELETE /api/audits/:id  — remove an audit job (cascades to result)
 */

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "Unauthorized.", status: 401 as const };
  }
  if ((session.user as { role?: string }).role !== "ADMIN") {
    return { error: "Forbidden.", status: 403 as const };
  }
  return { session };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;
  const job = await prisma.auditJob.findUnique({
    where: { id },
    include: { result: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Audit not found." }, { status: 404 });
  }

  return NextResponse.json(job);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;
  try {
    await prisma.auditJob.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete audit." },
      { status: 500 }
    );
  }
}
