import prisma from "@/lib/prisma";
import type { BillingType, Plan } from "@prisma/client";

export type PlanLineItem = {
  optionId: string | null;
  nameSnapshot: string;
  category: string;
  billingType: BillingType;
  includedInBasePlan: boolean;
};

export type PaidPlanSnapshot = {
  userId: string;
  basePlan: Plan;
  anchorAt: Date;
  planRequestId: string | null;
  subscriptionId: string | null;
  subscriptionPeriodEnd: Date | null;
  items: PlanLineItem[];
};

export async function loadPaidPlanSnapshot(
  userId: string,
): Promise<PaidPlanSnapshot | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  if (!user) return null;

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] },
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  let request = await prisma.customPlanRequest.findFirst({
    where: {
      userId,
      source: "CHECKOUT",
      status: { in: ["PENDING", "APPROVED"] },
    },
    include: { items: { orderBy: [{ category: "asc" }, { nameSnapshot: "asc" }] } },
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

  const basePlan =
    subscription?.basePlan && subscription.basePlan !== "NONE"
      ? subscription.basePlan
      : request?.basePlan && request.basePlan !== "NONE"
        ? request.basePlan
        : user.plan !== "NONE"
          ? user.plan
          : null;

  if (!basePlan || (basePlan as string) === "NONE") return null;

  const items: PlanLineItem[] = request
    ? request.items.map((i) => ({
        optionId: i.optionId,
        nameSnapshot: i.nameSnapshot,
        category: i.category,
        billingType: i.billingType,
        includedInBasePlan: i.includedInBasePlan,
      }))
    : (subscription?.items ?? [])
        .filter((i) => i.kind === "addon")
        .map((i) => ({
          optionId: i.optionId,
          nameSnapshot: i.nameSnapshot,
          category: "Add-on",
          billingType: i.billingType,
          includedInBasePlan: false,
        }));

  const anchorAt =
    request?.reviewedAt ??
    request?.createdAt ??
    subscription?.createdAt ??
    new Date();

  return {
    userId,
    basePlan,
    anchorAt,
    planRequestId: request?.id ?? null,
    subscriptionId: subscription?.id ?? null,
    subscriptionPeriodEnd: subscription?.currentPeriodEnd ?? null,
    items,
  };
}
