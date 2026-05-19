import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { z } from "zod";

import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import {
  resolveSelection,
  getUserSubscriptionState,
  type ResolvedOption,
  type ResolvedSelection,
} from "@/lib/plan-selection";
import { basePlanCents } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/checkout
 *
 * One entry point. Forks into two paths based on whether the user already
 * has an active subscription:
 *
 *   NEW path — no active sub:
 *     - Creates a Stripe Checkout Session in subscription mode.
 *     - Monthly items (base + add-ons) become recurring line items.
 *     - One-time items (build fee + one-time add-ons) ride the first
 *       invoice as non-recurring line items.
 *     - Returns { url } for a redirect.
 *
 *   MODIFY path — active sub exists:
 *     - Diffs desired vs current monthly items.
 *     - Calls subscriptions.update with proration_behavior=always_invoice
 *       so Stripe charges/credits only the net difference, immediately.
 *     - Creates invoice items for any new one-time add-ons; always_invoice
 *       folds them into the same immediate invoice.
 *     - Skips the build fee (already paid the first time).
 *     - Returns { modified: true } for an inline confirmation.
 */
const schema = z.object({
  basePlan: z.enum(["STARTER", "GROWTH", "PRO"]),
  optionIds: z.array(z.string().min(1)).max(50).optional().default([]),
  notes: z.string().max(2000).nullable().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 422 },
      );
    }

    const { basePlan, optionIds, notes, successUrl, cancelUrl } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const base = basePlanCents(basePlan);
    if (!base) {
      return NextResponse.json(
        { error: `Unknown base plan: ${basePlan}` },
        { status: 400 },
      );
    }

    const resolved = await resolveSelection(basePlan, optionIds);

    // Get-or-create the Stripe customer up front; both paths need it.
    let stripeCustomerId = user.stripeCustomerId ?? null;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId: user.id },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    // Snapshot the selection as a PENDING CustomPlanRequest. The webhook
    // (NEW path) or this route (MODIFY path) promotes it to APPROVED.
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

    const planRequest = await prisma.customPlanRequest.create({
      data: {
        userId,
        basePlan,
        source: "CHECKOUT",
        status: "PENDING",
        monthlyCents: resolved.monthlyCents + base.monthlyCents,
        oneTimeCents: resolved.oneTimeCents + base.buildCents,
        bundleDiscountCents: resolved.bundleDiscountCents,
        notes: notes ?? null,
        items: { create: itemRows },
      },
    });

    // Fork: is there already an active subscription to modify?
    const subState = await getUserSubscriptionState(userId);
    if (subState.stripeSubscriptionId) {
      return await modifyExistingSubscription({
        stripeSubscriptionId: subState.stripeSubscriptionId,
        stripeCustomerId,
        basePlan,
        baseMonthlyCents: base.monthlyCents,
        baseName: base.name,
        resolved,
        planRequestId: planRequest.id,
        userId,
      });
    }

    // NEW path: create a Stripe Checkout Session.
    return await createNewCheckoutSession({
      request,
      stripeCustomerId,
      basePlan,
      base,
      resolved,
      planRequestId: planRequest.id,
      userId,
      successUrl,
      cancelUrl,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── NEW path ────────────────────────────────────────────────────────────────

async function createNewCheckoutSession(opts: {
  request: NextRequest;
  stripeCustomerId: string;
  basePlan: "STARTER" | "GROWTH" | "PRO";
  base: { name: string; monthlyCents: number; buildCents: number };
  resolved: ResolvedSelection;
  planRequestId: string;
  userId: string;
  successUrl?: string;
  cancelUrl?: string;
}) {
  const {
    request,
    stripeCustomerId,
    basePlan,
    base,
    resolved,
    planRequestId,
    userId,
    successUrl,
    cancelUrl,
  } = opts;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  if (base.monthlyCents > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: base.monthlyCents,
        recurring: { interval: "month" },
        product_data: {
          name: `${base.name} plan — monthly`,
          description: `Hosting, support, and ongoing improvements for the ${base.name} plan.`,
          metadata: { kind: "base_monthly", basePlan },
        },
      },
    });
  }

  if (base.buildCents > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: base.buildCents,
        product_data: {
          name: `${base.name} website build`,
          description: `One-time build fee for the ${base.name} plan.`,
          metadata: { kind: "base_build_fee", basePlan },
        },
      },
    });
  }

  for (const opt of resolved.billable) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: opt.priceCents,
        ...(opt.billingType === "MONTHLY"
          ? { recurring: { interval: "month" } }
          : {}),
        product_data: {
          name: opt.name,
          metadata: {
            kind:
              opt.billingType === "MONTHLY" ? "addon_monthly" : "addon_one_time",
            optionId: opt.id,
            category: opt.category,
          },
        },
      },
    });
  }

  if (lineItems.length === 0) {
    return NextResponse.json(
      { error: "Nothing to charge for — pick a base plan with pricing." },
      { status: 400 },
    );
  }

  const discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
  if (resolved.bundleDiscountCents > 0) {
    const coupon = await stripe.coupons.create({
      amount_off: resolved.bundleDiscountCents,
      currency: "usd",
      duration: "once",
      name: "Bundle discount",
      metadata: { userId, basePlan },
    });
    discounts.push({ coupon: coupon.id });
  }

  const origin = request.nextUrl.origin;
  const hasBundleCoupon = discounts.length > 0;
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: lineItems,
    ...(hasBundleCoupon ? { discounts } : { allow_promotion_codes: true }),
    metadata: {
      userId,
      planRequestId,
      basePlan,
    },
    subscription_data: {
      metadata: {
        userId,
        planRequestId,
        basePlan,
      },
    },
    success_url: successUrl ?? `${origin}/portal/billing?checkout=success`,
    cancel_url: cancelUrl ?? `${origin}/portal/build-plan?checkout=canceled`,
  });

  await prisma.customPlanRequest.update({
    where: { id: planRequestId },
    data: { stripeCheckoutSessionId: checkoutSession.id },
  });

  return NextResponse.json({
    url: checkoutSession.url,
    sessionId: checkoutSession.id,
    planRequestId,
  });
}

// ── MODIFY path ─────────────────────────────────────────────────────────────

type ExistingItem = {
  id: string;
  kind: "base" | "addon" | "unknown";
  optionId: string | null;
  unitAmount: number | null;
  /** Stripe Product ID — needed for in-place price updates because
   *  subscriptions.update's PriceData accepts `product`, not `product_data`. */
  productId: string | null;
};

async function modifyExistingSubscription(opts: {
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  basePlan: "STARTER" | "GROWTH" | "PRO";
  baseMonthlyCents: number;
  baseName: string;
  resolved: ResolvedSelection;
  planRequestId: string;
  userId: string;
}) {
  const {
    stripeSubscriptionId,
    stripeCustomerId,
    basePlan,
    baseMonthlyCents,
    baseName,
    resolved,
    planRequestId,
    userId,
  } = opts;

  // Pull the live subscription with product expansion. Product metadata is
  // our cross-system mapping (kind = base|addon, optionId = PlanOption id).
  const fullSub = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
    expand: ["items.data.price.product"],
  });

  const existingItems: ExistingItem[] = fullSub.items.data.map((it) => {
    const product =
      typeof it.price.product === "object" && it.price.product !== null
        ? (it.price.product as Stripe.Product)
        : null;
    const productId =
      typeof it.price.product === "string"
        ? it.price.product
        : product?.id ?? null;
    const meta = product?.metadata ?? {};
    const kind: ExistingItem["kind"] =
      meta.kind === "base_monthly"
        ? "base"
        : meta.kind === "addon_monthly"
          ? "addon"
          : "unknown";
    return {
      id: it.id,
      kind,
      optionId: meta.optionId ?? null,
      unitAmount: it.price.unit_amount ?? null,
      productId,
    };
  });

  type DesiredItem = {
    matchKind: "base" | "addon";
    optionId?: string;
    priceCents: number;
    name: string;
    productMetadata: Stripe.MetadataParam;
  };
  const desired: DesiredItem[] = [];

  if (baseMonthlyCents > 0) {
    desired.push({
      matchKind: "base",
      priceCents: baseMonthlyCents,
      name: `${baseName} plan — monthly`,
      productMetadata: { kind: "base_monthly", basePlan },
    });
  }

  const monthlyAddons = resolved.billable.filter(
    (o) => o.billingType === "MONTHLY",
  );
  for (const opt of monthlyAddons) {
    desired.push({
      matchKind: "addon",
      optionId: opt.id,
      priceCents: opt.priceCents,
      name: opt.name,
      productMetadata: {
        kind: "addon_monthly",
        optionId: opt.id,
        category: opt.category,
      },
    });
  }

  // Diff: match desired vs existing by (kind, optionId).
  const usedExisting = new Set<string>();
  const updateItems: Stripe.SubscriptionUpdateParams.Item[] = [];

  for (const d of desired) {
    const match =
      d.matchKind === "base"
        ? existingItems.find(
            (e) => e.kind === "base" && !usedExisting.has(e.id),
          )
        : existingItems.find(
            (e) =>
              e.kind === "addon" &&
              e.optionId === d.optionId &&
              !usedExisting.has(e.id),
          );

    if (match) {
      usedExisting.add(match.id);
      if (match.unitAmount !== d.priceCents) {
        // Reuse the existing Stripe Product so we only mint a new Price.
        // Fall back to creating a fresh product if the existing item
        // somehow has no product (shouldn't happen — defensive).
        const productId =
          match.productId ??
          (
            await stripe.products.create({
              name: d.name,
              metadata: d.productMetadata,
            })
          ).id;
        updateItems.push({
          id: match.id,
          price_data: {
            currency: "usd",
            unit_amount: d.priceCents,
            recurring: { interval: "month" },
            product: productId,
          },
        });
      }
    } else {
      // No existing item to reuse — create a fresh Product and reference
      // it by ID. subscriptions.update doesn't accept inline product_data.
      const product = await stripe.products.create({
        name: d.name,
        metadata: d.productMetadata,
      });
      updateItems.push({
        price_data: {
          currency: "usd",
          unit_amount: d.priceCents,
          recurring: { interval: "month" },
          product: product.id,
        },
      });
    }
  }

  // Any existing item not matched gets deleted; Stripe credits the proration.
  for (const existing of existingItems) {
    if (!usedExisting.has(existing.id)) {
      updateItems.push({ id: existing.id, deleted: true });
    }
  }

  // One-time add-ons + bundle discount go on the immediate invoice as
  // invoice items. We create them BEFORE the subscriptions.update so
  // always_invoice picks them up alongside the proration.
  const oneTimeAddons = resolved.billable.filter(
    (o) => o.billingType === "ONE_TIME",
  );
  for (const opt of oneTimeAddons) {
    await stripe.invoiceItems.create({
      customer: stripeCustomerId,
      subscription: stripeSubscriptionId,
      currency: "usd",
      unit_amount: opt.priceCents,
      quantity: 1,
      description: opt.name,
      metadata: {
        kind: "addon_one_time",
        optionId: opt.id,
        planRequestId,
      },
    });
  }

  if (resolved.bundleDiscountCents > 0) {
    await stripe.invoiceItems.create({
      customer: stripeCustomerId,
      subscription: stripeSubscriptionId,
      currency: "usd",
      amount: -resolved.bundleDiscountCents,
      description: "Bundle discount",
      metadata: { kind: "bundle_discount", planRequestId },
    });
  }

  const hasMonthlyChanges = updateItems.length > 0;
  const hasOneTime =
    oneTimeAddons.length > 0 || resolved.bundleDiscountCents > 0;
  const noChanges = !hasMonthlyChanges && !hasOneTime;

  if (noChanges) {
    await prisma.customPlanRequest.update({
      where: { id: planRequestId },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        stripeSubscriptionId,
      },
    });
    return NextResponse.json({
      modified: true,
      noChanges: true,
      planRequestId,
      message: "Your subscription already matches this selection.",
    });
  }

  if (hasMonthlyChanges) {
    await stripe.subscriptions.update(stripeSubscriptionId, {
      items: updateItems,
      proration_behavior: "always_invoice",
      metadata: {
        userId,
        planRequestId,
        basePlan,
      },
    });
  } else if (hasOneTime) {
    const invoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      subscription: stripeSubscriptionId,
      auto_advance: true,
    });
    await stripe.invoices.finalizeInvoice(invoice.id);
  }

  await prisma.customPlanRequest.update({
    where: { id: planRequestId },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
      stripeSubscriptionId,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { plan: basePlan },
  });

  return NextResponse.json({
    modified: true,
    planRequestId,
    subscriptionId: stripeSubscriptionId,
    message:
      "Subscription updated. Net difference has been billed (or credited) immediately.",
  });
}

export type { ResolvedOption };
