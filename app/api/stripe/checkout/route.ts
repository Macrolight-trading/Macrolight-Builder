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
  type ResolvedSelection,
} from "@/lib/plan-selection";
import { basePlanCents } from "@/lib/pricing";
import { generateAndStoreSowForRequest } from "@/lib/sow/generate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/checkout
 *
 * Single, simple path: every checkout — new signup OR plan change — goes
 * through a Stripe Checkout Session. The user always sees Stripe's hosted
 * payment page.
 *
 * Behaviors:
 *   - First-time signup: full checkout with build fee + base monthly +
 *     selected add-ons.
 *   - Existing subscriber: same flow, but the build fee is suppressed
 *     (already paid on the original signup). The webhook cancels their
 *     previous subscription at period end after the new one activates,
 *     so there's no permanent double-charge.
 *
 * Body:
 *   { basePlan, optionIds?, notes?, successUrl?, cancelUrl? }
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

    // Get-or-create Stripe customer.
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

    // Does this user already have an active subscription? If yes, skip the
    // build fee (they paid it the first time around) AND mark the old sub
    // for cancellation later via webhook.
    const subState = await getUserSubscriptionState(userId);
    let existingActiveStripeSubId: string | null = subState.stripeSubscriptionId;
    if (!existingActiveStripeSubId && stripeCustomerId) {
      try {
        const subs = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          status: "active",
          limit: 1,
        });
        if (subs.data.length > 0) {
          existingActiveStripeSubId = subs.data[0].id;
        } else {
          const trialing = await stripe.subscriptions.list({
            customer: stripeCustomerId,
            status: "trialing",
            limit: 1,
          });
          if (trialing.data.length > 0) {
            existingActiveStripeSubId = trialing.data[0].id;
          }
        }
      } catch (err) {
        console.error("Stripe subscription lookup failed", err);
      }
    }
    const isUpgrade = Boolean(existingActiveStripeSubId);

    // Snapshot the selection as a PENDING CustomPlanRequest. Webhook
    // promotes to APPROVED on checkout.session.completed.
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

    // The oneTimeCents we persist excludes the build fee for upgrades,
    // matching what the user will actually be charged at checkout.
    const buildCentsForRequest = isUpgrade ? 0 : base.buildCents;

    const planRequest = await prisma.customPlanRequest.create({
      data: {
        userId,
        basePlan,
        source: "CHECKOUT",
        status: "PENDING",
        monthlyCents: resolved.monthlyCents + base.monthlyCents,
        oneTimeCents: resolved.oneTimeCents + buildCentsForRequest,
        bundleDiscountCents: resolved.bundleDiscountCents,
        notes: notes ?? null,
        items: { create: itemRows },
      },
    });

    // SOW PDF — generated before redirect so it exists at the moment of
    // acceptance. Non-fatal: log + proceed if it fails.
    let sowPdfUrl: string | null = null;
    try {
      sowPdfUrl = await generateAndStoreSowForRequest(planRequest.id);
    } catch (err) {
      console.error("SOW generation failed for", planRequest.id, err);
    }

    return await createCheckoutSession({
      request,
      stripeCustomerId,
      basePlan,
      base,
      resolved,
      planRequestId: planRequest.id,
      userId,
      successUrl,
      cancelUrl,
      sowPdfUrl,
      isUpgrade,
      previousSubscriptionId: existingActiveStripeSubId,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function createCheckoutSession(opts: {
  request: NextRequest;
  stripeCustomerId: string;
  basePlan: "STARTER" | "GROWTH" | "PRO";
  base: { name: string; monthlyCents: number; buildCents: number };
  resolved: ResolvedSelection;
  planRequestId: string;
  userId: string;
  successUrl?: string;
  cancelUrl?: string;
  sowPdfUrl: string | null;
  isUpgrade: boolean;
  previousSubscriptionId: string | null;
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
    sowPdfUrl,
    isUpgrade,
    previousSubscriptionId,
  } = opts;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  // Base plan: monthly recurring (always included).
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

  // Base plan: build fee — only on first-time signups. Skipped for
  // upgrades because the user already paid this once.
  if (!isUpgrade && base.buildCents > 0) {
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

  // Add-ons (recurring + one-time mixed; Stripe handles both in sub mode).
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
      // The webhook reads this to know which sub to cancel after the new
      // one is created.
      previousSubscriptionId: previousSubscriptionId ?? "",
    },
    subscription_data: {
      metadata: {
        userId,
        planRequestId,
        basePlan,
        previousSubscriptionId: previousSubscriptionId ?? "",
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
    sowPdfUrl,
    isUpgrade,
  });
}
