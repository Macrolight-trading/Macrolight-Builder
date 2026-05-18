/**
 * Server-side helpers for resolving a user's plan-builder selection into
 * a concrete set of billable + included line items, including bundle
 * discounts.
 *
 * Used by:
 *   - /api/portal/plan-requests (quote-request flow)
 *   - /api/stripe/checkout      (direct checkout flow)
 *
 * Both flows must reach the same answer for the same input, which is why
 * the logic lives here rather than in each route.
 */

import prisma from "@/lib/prisma";

export type BillingType = "ONE_TIME" | "MONTHLY";
export type BasePlanKey =
  | "NONE"
  | "STARTER"
  | "GROWTH"
  | "PRO"
  | "CUSTOM";

export type ResolvedOption = {
  id: string;
  name: string;
  priceCents: number;
  billingType: BillingType;
  category: string;
};

// Higher rank = "more included". A category with includedFromTier=GROWTH
// gets bundled into any plan whose tier rank is >= GROWTH's rank.
export const TIER_RANK: Record<string, number> = {
  NONE: 0,
  STARTER: 1,
  GROWTH: 2,
  PRO: 3,
  CUSTOM: 99,
};

export type ResolvedSelection = {
  /** Add-ons the user actively picked AND will be billed for. */
  billable: ResolvedOption[];
  /** Add-ons auto-bundled into the base plan (free). Returned so they can
   *  be snapshotted on the request/subscription for audit trail. */
  included: ResolvedOption[];
  /** Per-category bundle discount in cents, applied when every active item
   *  in a discount-eligible category is selected. */
  bundleDiscountCents: number;
  /** Total add-on monthly cents AFTER bundle discount. Does NOT include
   *  the base plan monthly fee — caller adds that separately. */
  monthlyCents: number;
  /** Total add-on one-time cents AFTER bundle discount. Does NOT include
   *  the base plan build fee — caller adds that separately. */
  oneTimeCents: number;
};

/**
 * Resolve a (basePlan, optionIds) selection into billable/included items and
 * apply bundle discounts. Hits the DB for plan options and category metadata
 * — only `active` rows are considered, so retired options are silently
 * dropped from the selection.
 */
export async function resolveSelection(
  basePlan: BasePlanKey,
  optionIds: string[],
): Promise<ResolvedSelection> {
  const baseRank = TIER_RANK[basePlan] ?? 0;

  const categories = (await prisma.planCategory.findMany({
    where: { active: true },
    select: { name: true, bundleDiscountPct: true, includedFromTier: true },
  })) as Array<{
    name: string;
    bundleDiscountPct: number;
    includedFromTier: BasePlanKey | null;
  }>;

  const includedCategoryNames = new Set<string>();
  const pctByCategory = new Map<string, number>();
  for (const c of categories) {
    pctByCategory.set(c.name, c.bundleDiscountPct);
    const tier = c.includedFromTier;
    if (tier && tier !== "NONE") {
      const tierRank = TIER_RANK[tier] ?? 0;
      if (baseRank >= tierRank) includedCategoryNames.add(c.name);
    }
  }

  // Pull every option in an included category, plus every option the user
  // explicitly picked. Inactive options are excluded.
  const optionWhere: Array<Record<string, unknown>> = [
    { id: { in: optionIds.length > 0 ? optionIds : ["__nope__"] } },
  ];
  if (includedCategoryNames.size > 0) {
    optionWhere.push({ category: { in: Array.from(includedCategoryNames) } });
  }
  const options = (await prisma.planOption.findMany({
    where: { active: true, OR: optionWhere },
  })) as ResolvedOption[];

  const picked = new Set(optionIds);
  const billable: ResolvedOption[] = [];
  const included: ResolvedOption[] = [];
  for (const o of options) {
    if (includedCategoryNames.has(o.category)) included.push(o);
    else if (picked.has(o.id)) billable.push(o);
    // else: matched the option-id branch but isn't in an included category
    // and the user didn't actually tick it — ignore.
  }

  // Bundle discount: count what's active in each billable category so we
  // can tell whether the user selected the whole bundle.
  const billableCategories = Array.from(
    new Set(billable.map((o) => o.category)),
  );
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

  const selectedByCategory = new Map<string, Set<string>>();
  for (const o of billable) {
    if (!selectedByCategory.has(o.category)) {
      selectedByCategory.set(o.category, new Set());
    }
    selectedByCategory.get(o.category)!.add(o.id);
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
    const selectedIds = selectedByCategory.get(category) ?? new Set();
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

  return { billable, included, bundleDiscountCents, monthlyCents, oneTimeCents };
}

export type UserSubscriptionState = {
  /** The Prisma Subscription row, or null when the user has no active sub. */
  subscriptionId: string | null;
  stripeSubscriptionId: string | null;
  /** Status as Prisma enum string. Null when no sub. */
  status: string | null;
  /** Base plan currently on the subscription. Null when no sub. */
  basePlan: BasePlanKey | null;
  /** PlanOption IDs currently active as monthly add-ons on the sub. The base
   *  plan item is excluded — track it via `basePlan` above. */
  subscribedOptionIds: string[];
};

/**
 * Read the user's current active subscription state. Used by:
 *   - /portal/build-plan to pre-check options the user is already paying for
 *   - /api/stripe/checkout to decide whether to start a new subscription or
 *     modify an existing one
 *
 * "Active" = ACTIVE or TRIALING. Anything else is treated as "no live sub"
 * so users in PAST_DUE or CANCELED state get the full new-checkout flow.
 */
export async function getUserSubscriptionState(
  userId: string,
): Promise<UserSubscriptionState> {
  const sub = await prisma.subscription.findFirst({
    where: { userId, status: { in: ["ACTIVE", "TRIALING"] } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  if (!sub) {
    return {
      subscriptionId: null,
      stripeSubscriptionId: null,
      status: null,
      basePlan: null,
      subscribedOptionIds: [],
    };
  }
  const subscribedOptionIds = sub.items
    .filter((i) => i.kind === "addon" && i.optionId)
    .map((i) => i.optionId as string);
  const bp = sub.basePlan as string;
  const validBp: BasePlanKey =
    bp === "STARTER" || bp === "GROWTH" || bp === "PRO" || bp === "CUSTOM"
      ? bp
      : "NONE";
  return {
    subscriptionId: sub.id,
    stripeSubscriptionId: sub.stripeSubscriptionId,
    status: sub.status as string,
    basePlan: validBp,
    subscribedOptionIds,
  };
}
