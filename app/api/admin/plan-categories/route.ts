import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const TIER_VALUES = ["NONE", "STARTER", "GROWTH", "PRO"] as const;

const createSchema = z.object({
  name: z.string().min(1).max(60),
  label: z.string().max(80).nullable().optional(),
  bundleDiscountPct: z.number().int().min(0).max(100),
  includedFromTier: z.enum(TIER_VALUES).nullable().optional(),
  sortOrder: z.number().int().optional().default(0),
  active: z.boolean().optional().default(true),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "ADMIN" ? session : null;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const categories = await prisma.planCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  try {
    const { includedFromTier, ...rest } = parsed.data;
    const category = await prisma.planCategory.create({
      data: {
        ...rest,
        label: parsed.data.label ?? null,
        includedFromTier:
          includedFromTier && includedFromTier !== "NONE" ? includedFromTier : null,
      },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Create failed";
    return NextResponse.json(
      { error: msg.includes("Unique") ? "A category with that name already exists." : msg },
      { status: 400 },
    );
  }
}
