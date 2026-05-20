import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

/**
 * GET  — returns the current default plan template (creates it if missing).
 * PUT  — upserts the default template (base plan + add-on option IDs + notes).
 *
 * The template is a singleton row with id = "default".
 * On new user signup, /api/auth/signup reads this template and seeds a
 * PlanRecommendation for the new user so their portal is pre-populated.
 */

const planEnum = z.enum(["NONE", "STARTER", "GROWTH", "PRO", "CUSTOM"]);

const upsertSchema = z.object({
  basePlan: planEnum,
  optionIds: z.array(z.string().min(1)).max(200),
  notes: z.string().max(2000).nullable().optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "ADMIN" ? session : null;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const template = await prisma.defaultPlanTemplate.findUnique({
    where: { id: "default" },
    include: { items: { select: { optionId: true } } },
  });

  if (!template) {
    return NextResponse.json({ basePlan: "STARTER", optionIds: [], notes: null });
  }

  return NextResponse.json({
    basePlan: template.basePlan,
    optionIds: template.items.map((i) => i.optionId),
    notes: template.notes,
  });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  // Filter submitted IDs to only active options.
  const validOptions = parsed.data.optionIds.length
    ? await prisma.planOption.findMany({
        where: { id: { in: parsed.data.optionIds }, active: true },
        select: { id: true },
      })
    : [];
  const validIds = validOptions.map((o) => o.id);

  const template = await prisma.$transaction(async (tx) => {
    const upserted = await tx.defaultPlanTemplate.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        basePlan: parsed.data.basePlan,
        notes: parsed.data.notes ?? null,
      },
      update: {
        basePlan: parsed.data.basePlan,
        notes: parsed.data.notes ?? null,
      },
    });

    await tx.defaultPlanTemplateItem.deleteMany({
      where: { templateId: "default" },
    });

    if (validIds.length) {
      await tx.defaultPlanTemplateItem.createMany({
        data: validIds.map((optionId) => ({
          templateId: "default",
          optionId,
        })),
      });
    }

    return upserted;
  });

  return NextResponse.json({ ok: true, basePlan: template.basePlan });
}
