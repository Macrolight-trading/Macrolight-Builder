import prisma from "@/lib/prisma";

export type AdminCheckoutPlanItem = {
  nameSnapshot: string;
  category: string;
  priceCents: number;
  billingType: "ONE_TIME" | "MONTHLY";
  includedInBasePlan: boolean;
};

export type AdminCheckoutPlanView = {
  requestId: string | null;
  basePlan: string;
  requestStatus: string;
  subscriptionStatus: string | null;
  stripeSubscriptionId: string | null;
  monthlyCents: number;
  oneTimeCents: number;
  bundleDiscountCents: number;
  notes: string | null;
  checkedOutAt: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  items: AdminCheckoutPlanItem[];
};

/**
 * Load the fullest checkout snapshot for an admin client project view.
 * Prefers the CustomPlanRequest tied to the user's latest subscription,
 * then falls back to the most recent CHECKOUT request.
 */
export async function loadClientCheckoutPlanForAdmin(
  userId: string,
): Promise<AdminCheckoutPlanView | null> {
  const subscription = await prisma.subscription.findFirst({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  let request = await prisma.customPlanRequest.findFirst({
    where: { userId, source: "CHECKOUT" },
    include: {
      items: { orderBy: [{ category: "asc" }, { nameSnapshot: "asc" }] },
    },
    orderBy: { createdAt: "desc" },
  });

  if (subscription?.stripeSubscriptionId) {
    const linked = await prisma.customPlanRequest.findFirst({
      where: { stripeSubscriptionId: subscription.stripeSubscriptionId },
      include: {
        items: { orderBy: [{ category: "asc" }, { nameSnapshot: "asc" }] },
      },
    });
    if (linked) request = linked;
  }

  if (!request) {
    if (!subscription || subscription.status === "CANCELED") {
      return null;
    }

    const items: AdminCheckoutPlanItem[] = subscription.items.map((i) => ({
      nameSnapshot: i.nameSnapshot,
      category: i.kind === "base" ? "Base plan" : "Add-on",
      priceCents: i.priceCents,
      billingType: i.billingType as "ONE_TIME" | "MONTHLY",
      includedInBasePlan: false,
    }));

    return {
      requestId: null,
      basePlan: subscription.basePlan,
      requestStatus: "APPROVED",
      subscriptionStatus: subscription.status,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      monthlyCents: items
        .filter((i) => i.billingType === "MONTHLY")
        .reduce((s, i) => s + i.priceCents, 0),
      oneTimeCents: items
        .filter((i) => i.billingType === "ONE_TIME")
        .reduce((s, i) => s + i.priceCents, 0),
      bundleDiscountCents: 0,
      notes: null,
      checkedOutAt: subscription.createdAt.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      items,
    };
  }

  const showRequest =
    request.status !== "REJECTED" && request.status !== "CANCELED";
  if (!showRequest && !subscription) return null;

  return {
    requestId: request.id,
    basePlan: request.basePlan,
    requestStatus: request.status,
    subscriptionStatus: subscription?.status ?? null,
    stripeSubscriptionId:
      request.stripeSubscriptionId ?? subscription?.stripeSubscriptionId ?? null,
    monthlyCents: request.monthlyCents,
    oneTimeCents: request.oneTimeCents,
    bundleDiscountCents: request.bundleDiscountCents,
    notes: request.notes,
    checkedOutAt: (request.reviewedAt ?? request.createdAt).toISOString(),
    currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
    items: request.items.map((i) => ({
      nameSnapshot: i.nameSnapshot,
      category: i.category,
      priceCents: i.priceCents,
      billingType: i.billingType,
      includedInBasePlan: i.includedInBasePlan,
    })),
  };
}
