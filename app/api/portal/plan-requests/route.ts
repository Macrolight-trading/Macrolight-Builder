import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { resolveSelection } from "@/lib/plan-selection";

const schema = z.object({
  basePlan: z.enum(["NONE", "STARTER", "GROWTH", "PRO", "CUSTOM"]),
  optionIds: z.array(z.string().min(1)).max(50),
  notes: z.string().max(2000).nullable().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const resolved = await resolveSelection(
    parsed.data.basePlan,
    parsed.data.optionIds,
  );

  if (resolved.billable.length + resolved.included.length === 0) {
    return NextResponse.json(
      {
        error:
          "Pick at least one option (or choose a base plan that includes something).",
      },
      { status: 400 },
    );
  }

  const itemRows = [
    ...resolved.billable.map((o) => ({
      optionId: o.id,
      nameSnapshot: o.name,
      priceCents: o.priceCents,
      billingType: o.billingType,
      category: o.category,
      includedInBasePlan: false,
    })),
    ...resolved.included.map((o) => ({
      optionId: o.id,
      nameSnapshot: o.name,
      priceCents: o.priceCents,
      billingType: o.billingType,
      category: o.category,
      includedInBasePlan: true,
    })),
  ];

  const request = await prisma.customPlanRequest.create({
    data: {
      userId,
      basePlan: parsed.data.basePlan,
      source: "QUOTE",
      monthlyCents: resolved.monthlyCents,
      oneTimeCents: resolved.oneTimeCents,
      bundleDiscountCents: resolved.bundleDiscountCents,
      notes: parsed.data.notes ?? null,
      items: { create: itemRows },
    },
    include: { items: true },
  });

  return NextResponse.json(request, { status: 201 });
}
