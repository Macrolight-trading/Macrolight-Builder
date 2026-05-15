import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  basePlan: z.enum(["NONE", "STARTER", "GROWTH", "PRO", "CUSTOM"]),
  optionIds: z.array(z.string().min(1)).max(50),
  notes: z.string().max(2000).nullable().optional(),
});

// Tier ranks matching the client. Higher = more inclusive.
const TIER_RANK: Record<string, number> = {
  NONE: 0,
  STARTER: 1,
  GROWTH: 2,
  PRO: 3,
  CUSTOM: 99,
};

type LiveOption = {
  id: string;
  name: string;
  priceCents: number;
  billingType: "ONE_TIME" | "MONTHLY";
  category: string;
};

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

  const baseRank = TIER_RANK[parsed.data.basePlan] ?? 0;

  // Find every category that's included in the chosen base plan so we can
  // auto-add its options even if the client didn't tick them. The client UI
  // shows them as locked-checked; this is the server-side belt-and-braces.
  const allCategories = (await prisma.planCategory.findMany({
    where: { active: true },
    select: { name: true, bundleDiscountPct: true, includedFromTier: true },
  })) as Array<{
    name: string;
    bundleDiscountPct: number;
    includedFromTier: "NONE" | "STARTER" | "GROWTH" | "PRO" | null;
  }>;

  const includedCategoryNames = new Set<string>();
  const pctByCategory = new Map<string, number>();
  for (const c of allCategories) {
    pctByCategory.set(c.name, c.bundleDiscountPct);
    const tier = c.includedFromTier;
    if (tier && tier !== "NONE") {
      const tierRank = TIER_RANK[tier] ?? 0;
      if (baseRank >= tierRank) includedCategoryNames.add(c.name);
    }
  }

  // Pull every option from included categories, plus every option the client
  // explicitly picked.
  const optionWhere: Array<Record<string, unknown>> = [
    { id: { in: parsed.data.optionIds } },
  ];
  if (includedCategoryNames.size > 0) {
    optionWhere.push({ category: { in: Array.from(includedCategoryNames) } });
  }
  const options = (await prisma.planOption.findMany({
    where: { active: true, OR: optionWhere },
  })) as LiveOption[];

  if (options.length === 0) {
    return NextResponse.json(
      { error: "No options were selected and the base plan has no inclusions." },
      { status: 400 },
    );
  }

  // Categorize options: included (free) vs billable.
  const userPicked = new Set(parsed.data.optionIds);
  const billable: LiveOption[] = [];
  const includedOptions: LiveOption[] = [];
  for (const o of options) {
    if (includedCategoryNames.has(o.category)) includedOptions.push(o);
    else if (userPicked.has(o.id)) billable.push(o);
    // else: in OR-set because we union'd both queries but the user didn't pick
    // it and it's not included — ignore.
  }

  // Now resolve bundle discounts using only billable items. Determine which
  // categories the user fully selected (all active items in that category).
  const billableCategories = Array.from(new Set(billable.map((o) => o.category)));
  const allActiveInCats = (await prisma.planOption.findMany({
    where: { active: true, category: { in: billableCategories } },
    select: { id: true, category: true },
  })) as Array<{ id: string; category: string }>;

  const activeIdsByCategory = new Map<string, Set<string>>();
  for (const row of allActiveInCats) {
    if (!activeIdsByCategory.has(row.category)) {
      activeIdsByCategory.set(row.category, new Set());
    }
    activeIdsByCategory.get(row.category)!.add(row.id);
  }

  const selectedBillableByCategory = new Map<string, Set<string>>();
  for (const o of billable) {
    if (!selectedBillableByCategory.has(o.category)) {
      selectedBillableByCategory.set(o.category, new Set());
    }
    selectedBillableByCategory.get(o.category)!.add(o.id);
  }

  let monthlyCents = 0;
  let oneTimeCents = 0;
  let bundleDiscountCents = 0;

  for (const category of billableCategories) {
    const items = billable.filter((o) => o.category === category);
    const monthlySub = items
      .filter((o) => o.billingType === "MONTHLY")
      .reduce((a, b) => a + b.priceCents, 0);
    const oneTimeSub = items
      .filter((o) => o.billingType === "ONE_TIME")
      .reduce((a, b) => a + b.priceCents, 0);
    monthlyCents += monthlySub;
    oneTimeCents += oneTimeSub;

    const activeIds = activeIdsByCategory.get(category) ?? new Set();
    const selectedIds = selectedBillableByCategory.get(category) ?? new Set();
    const pct = pctByCategory.get(category) ?? 0;

    const allSelected =
      activeIds.size >= 2 &&
      activeIds.size === selectedIds.size &&
      Array.from(activeIds).every((id) => selectedIds.has(id));

    if (allSelected && pct > 0) {
      const monthlyDisc = Math.round((monthlySub * pct) / 100);
      const oneTimeDisc = Math.round((oneTimeSub * pct) / 100);
      bundleDiscountCents += monthlyDisc + oneTimeDisc;
      monthlyCents -= monthlyDisc;
      oneTimeCents -= oneTimeDisc;
    }
  }

  // Build the line items list: every billable item + every included item.
  const itemRows = [
    ...billable.map((o) => ({
      optionId: o.id,
      nameSnapshot: o.name,
      priceCents: o.priceCents,
      billingType: o.billingType,
      category: o.category,
      includedInBasePlan: false,
    })),
    ...includedOptions.map((o) => ({
      optionId: o.id,
      nameSnapshot: o.name,
      priceCents: o.priceCents,
      billingType: o.billingType,
      category: o.category,
      includedInBasePlan: true,
    })),
  ];

  if (itemRows.length === 0) {
    return NextResponse.json(
      { error: "Pick at least one option (or choose a base plan that includes something)." },
      { status: 400 },
    );
  }

  const request = await prisma.customPlanRequest.create({
    data: {
      userId,
      basePlan: parsed.data.basePlan,
      monthlyCents,
      oneTimeCents,
      bundleDiscountCents,
      notes: parsed.data.notes ?? null,
      items: { create: itemRows },
    },
    include: { items: true },
  });

  return NextResponse.json(request, { status: 201 });
}
