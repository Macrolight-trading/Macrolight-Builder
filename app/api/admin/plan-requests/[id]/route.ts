import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELED"]).optional(),
  adminNotes: z.string().max(2000).nullable().optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  const id = (session?.user as { id?: string } | undefined)?.id;
  return role === "ADMIN" ? { session, adminId: id ?? null } : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const ctx = await requireAdmin();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.status && parsed.data.status !== "PENDING") {
    data.reviewedAt = new Date();
    data.reviewedById = ctx.adminId;
  }

  try {
    const updated = await prisma.customPlanRequest.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const ctx = await requireAdmin();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.customPlanRequest.findUnique({
    where: { id: params.id },
    select: { status: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!["REJECTED", "CANCELED"].includes(existing.status)) {
    return NextResponse.json(
      { error: "Only rejected or canceled requests can be deleted." },
      { status: 400 },
    );
  }

  await prisma.customPlanRequest.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
