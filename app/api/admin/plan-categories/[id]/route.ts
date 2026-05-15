import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const TIER_VALUES = ["NONE", "STARTER", "GROWTH", "PRO"] as const;

const updateSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  label: z.string().max(80).nullable().optional(),
  bundleDiscountPct: z.number().int().min(0).max(100).optional(),
  includedFromTier: z.enum(TIER_VALUES).nullable().optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "ADMIN" ? session : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  try {
    // If renaming, also rename the matching PlanOption.category strings so
    // the join-on-name relationship stays intact.
    if (parsed.data.name) {
      const existing = await prisma.planCategory.findUnique({
        where: { id: params.id },
        select: { name: true },
      });
      if (existing && existing.name !== parsed.data.name) {
        await prisma.planOption.updateMany({
          where: { category: existing.name },
          data: { category: parsed.data.name },
        });
      }
    }
    const { includedFromTier, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };
    if (includedFromTier !== undefined) {
      data.includedFromTier =
        includedFromTier && includedFromTier !== "NONE" ? includedFromTier : null;
    }
    const category = await prisma.planCategory.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Block deletion if any plan options still reference this category name —
    // otherwise the option falls into an "Uncategorized" limbo.
    const cat = await prisma.planCategory.findUnique({
      where: { id: params.id },
      select: { name: true },
    });
    if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const count = await prisma.planOption.count({ where: { category: cat.name } });
    if (count > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${count} plan option(s) still use this category. Move them first.` },
        { status: 409 },
      );
    }
    await prisma.planCategory.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
