import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

/**
 * Admin endpoint for managing the per-user plan recommendation built
 * after the intro client meeting. The shape mirrors what the existing
 * PlanBuilder component sends:
 *   { basePlan: Plan, optionIds: string[], notes: string | null }
 *
 * The endpoint upserts in place — there is exactly one recommendation
 * per user — and DELETE clears it.
 */

const planEnum = z.enum(["NONE", "STARTER", "GROWTH", "PRO", "CUSTOM"]);

const upsertSchema = z.object({
  basePlan: planEnum,
  optionIds: z.array(z.string().min(1)).max(200),
  notes: z.string().max(2000).nullable().optional(),
});

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "ADMIN" ? session : null;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 },
    );
  }

  // Make sure the target user exists — otherwise the FK would still create
  // a row that the client portal would never see, which is confusing.
  const userExists = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { id: true },
  });
  if (!userExists) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Filter the submitted option IDs down to ones that actually exist and
  // are active. We don't error on stale IDs — we silently drop them — so
  // the admin doesn't get blocked by a recently-deactivated option.
  const validOptions = parsed.data.optionIds.length
    ? await prisma.planOption.findMany({
        where: { id: { in: parsed.data.optionIds }, active: true },
        select: { id: true },
      })
    : [];
  const validIds = validOptions.map((o) => o.id);

  const adminId = (session.user as { id?: string } | undefined)?.id ?? null;

  // Upsert + replace child items atomically so a half-written
  // recommendation can never be observed by the client.
  const recommendation = await prisma.$transaction(async (tx) => {
    const upserted = await tx.planRecommendation.upsert({
      where: { userId: params.userId },
      create: {
        userId: params.userId,
        basePlan: parsed.data.basePlan,
        notes: parsed.data.notes ?? null,
        createdById: adminId,
      },
      update: {
        basePlan: parsed.data.basePlan,
        notes: parsed.data.notes ?? null,
      },
    });

    await tx.planRecommendationItem.deleteMany({
      where: { recommendationId: upserted.id },
    });

    if (validIds.length > 0) {
      await tx.planRecommendationItem.createMany({
        data: validIds.map((optionId) => ({
          recommendationId: upserted.id,
          optionId,
        })),
      });
    }

    return tx.planRecommendation.findUnique({
      where: { id: upserted.id },
      include: { items: { select: { optionId: true } } },
    });
  });

  return NextResponse.json(recommendation);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { userId: string } },
) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Idempotent: if nothing exists for this user we still report success.
  await prisma.planRecommendation.deleteMany({
    where: { userId: params.userId },
  });

  return NextResponse.json({ ok: true });
}
