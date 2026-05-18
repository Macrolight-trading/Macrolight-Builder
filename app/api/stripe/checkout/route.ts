import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { z } from "zod";

import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { resolveSelection } from "@/lib/plan-selection";
import { basePlanCents } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/checkout
 *
 * Builds a Stripe Checkout Session from the user's plan-builder selection.
 *
 * Behavior:
 *   - mode = "subscription" (the base plan is always recurring).
 *   - Recurring items (base plan monthly + monthly add-ons) become recurring
 *     line items.
 *   - One-time items (base plan build fee + one-time add-ons) are mixed into
 *     the same line_items array — in subscription mode Stripe attaches them
 *     to the first invoice automatically.
 *   - Persists a CustomPlanRequest with source=CHECKOUT so the request is
 *     auditable before payment completes. The webhook promotes it to
 *     APPROVED on checkout.session.completed.
 *
 * Body:
 *   {
 *     basePlan: "STARTER" | "GROWTH" | "PRO",
 *     optionIds?: string[],
 *     notes?: string | null,
 *     successUrl?: string,   // defaults to /portal/billing?checkout=success
 *     cancelUrl?: string     // defaults to /portal/build-plan?checkout=canceled
 *   }
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

    // Lookup user + verify they exist.
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Pricing for the chosen base plan — pulled from the same lib/pricing.ts
    // the marketing page uses, so prices can never drift.
    const base = basePlanCents(basePlan);
    if (!base) {
      return NextResponse.json(
        { error: `Unknown base plan: ${basePlan}` },
        { status: 400 },
      );
    }

    // Resolve add-on selection → billable + included, with bundle discount.
    const resolved = await resolveSelection(basePlan, optionIds);

    // Build Stripe line items. price_data lets us push prices straight from
    // the DB without maintaining a parallel set of Stripe Products.
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // 1. Base plan: monthly recurring.
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

    // 2. Base plan: build fee (one-time). In subscription mode this is added
    //    to the first invoice automatically.
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

    // 3. Add-ons: billable items only. Included items aren't charged; they're
    //    just snapshotted on the CustomPlanRequest for the audit trail.
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
              kind: opt.billingType === "MONTHLY" ? "addon_monthly" : "addon_one_time",
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

    // 4. Apply per-category bundle discounts. The simplest path that keeps
    //    Stripe's books consistent with what the UI shows is a single
    //    Stripe Coupon for the total bundle discount on the first invoice.
    //    We only apply it when there's a discount to apply.
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

    // 5. Get-or-create the Stripe customer for this user. Keeping it on
    //    user.stripeCustomerId means future actions (portal, add-on, cancel)
    //    don't have to look the customer up by email.
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

    // 6. Snapshot the selection as a PENDING CustomPlanRequest. The webhook
    //    promotes it to APPROVED on checkout.session.completed.
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

    // 7. Create the Checkout Session.
    const origin = request.nextUrl.origin;
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: lineItems,
      discounts: discounts.length > 0 ? discounts : undefined,
      allow_promotion_codes: discounts.length === 0,
      metadata: {
        userId,
        planRequestId: planRequest.id,
        basePlan,
      },
      subscription_data: {
        metadata: {
          userId,
          planRequestId: planRequest.id,
          basePlan,
        },
      },
      success_url:
        successUrl ?? `${origin}/portal/billing?checkout=success`,
      cancel_url:
        cancelUrl ?? `${origin}/portal/build-plan?checkout=canceled`,
    });

    // 8. Link the session ID so the webhook can find this request.
    await prisma.customPlanRequest.update({
      where: { id: planRequest.id },
      data: { stripeCheckoutSessionId: checkoutSession.id },
    });

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
      planRequestId: planRequest.id,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
