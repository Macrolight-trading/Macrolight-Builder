import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { enqueuePaymentConfirmedForUser } from "@/lib/onboarding/payment-confirmed";
import { syncDeliveryScheduleForUser } from "@/lib/delivery/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook receiver.
 *
 * Auth: signature verified against STRIPE_WEBHOOK_SECRET.
 *
 * Events handled:
 *   - checkout.session.completed         → promote CustomPlanRequest, create Subscription, set User.plan
 *   - customer.subscription.updated      → sync status, period, cancel flag
 *   - customer.subscription.deleted      → mark canceled
 *   - invoice.payment_succeeded          → record Payment (SUCCEEDED)
 *   - invoice.payment_failed             → record Payment (FAILED)
 *   - charge.refunded                    → record Payment (REFUNDED)
 *
 * Match policy: always prefer metadata.userId (set on the checkout session
 * and the subscription). Fall back to stripeCustomerId lookup. Only fall
 * back to email match if neither is available — email match is fragile
 * because users can change their address.
 */

type StripePlan = "STARTER" | "GROWTH" | "PRO" | "CUSTOM" | "NONE";

const SUBSCRIPTION_STATUS_MAP: Record<string, StripeSubStatus> = {
  active: "ACTIVE",
  trialing: "TRIALING",
  past_due: "PAST_DUE",
  canceled: "CANCELED",
  unpaid: "UNPAID",
  incomplete: "INCOMPLETE",
  incomplete_expired: "INCOMPLETE_EXPIRED",
  paused: "PAUSED",
};

type StripeSubStatus =
  | "ACTIVE"
  | "TRIALING"
  | "PAST_DUE"
  | "CANCELED"
  | "UNPAID"
  | "INCOMPLETE"
  | "INCOMPLETE_EXPIRED"
  | "PAUSED";

/** Resolve a user by, in order: metadata.userId, stripeCustomerId, email. */
async function resolveUser(opts: {
  userIdMeta?: string | null;
  customerId?: string | null;
  email?: string | null;
}) {
  const { userIdMeta, customerId, email } = opts;
  if (userIdMeta) {
    const u = await prisma.user.findUnique({ where: { id: userIdMeta } });
    if (u) return u;
  }
  if (customerId) {
    const u = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    });
    if (u) return u;
  }
  if (email) {
    return prisma.user.findFirst({ where: { email } });
  }
  return null;
}

function toPlan(value: string | undefined | null): StripePlan {
  const up = (value ?? "").toUpperCase();
  if (up === "STARTER" || up === "GROWTH" || up === "PRO" || up === "CUSTOM") {
    return up as StripePlan;
  }
  return "NONE";
}

function epochToDate(seconds: number | null | undefined): Date | null {
  if (!seconds) return null;
  return new Date(seconds * 1000);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await onCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await onSubscriptionUpserted(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.deleted":
        await onSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_succeeded":
        await onInvoicePaid(event.data.object as Stripe.Invoice, "SUCCEEDED");
        break;

      case "invoice.payment_failed":
        await onInvoicePaid(event.data.object as Stripe.Invoice, "FAILED");
        break;

      case "charge.refunded":
        await onChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        // Acknowledge but don't act.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}

// ── Handlers ────────────────────────────────────────────────────────────────

async function onCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userIdMeta = session.metadata?.userId ?? null;
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;
  const user = await resolveUser({
    userIdMeta,
    customerId,
    email: session.customer_email ?? session.customer_details?.email ?? null,
  });
  if (!user) {
    console.warn("checkout.session.completed: no matching user", {
      sessionId: session.id,
      userIdMeta,
      customerId,
    });
    return;
  }

  // Make sure the customer id is stored on the user.
  if (customerId && user.stripeCustomerId !== customerId) {
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  // Update plan on the user. This makes the "Current plan" pill on the
  // billing page show the right tier as soon as the redirect lands.
  const basePlan = toPlan(session.metadata?.basePlan);
  if (basePlan !== "NONE") {
    await prisma.user.update({
      where: { id: user.id },
      data: { plan: basePlan },
    });
  }

  // Enqueue Hermes event for payment confirmation automation
  await enqueuePaymentConfirmedForUser(user.id, {
    sessionId: session.id,
    amountTotal: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
    plan: basePlan !== "NONE" ? basePlan : undefined,
    stripeCustomerId: customerId,
  }).catch((err) => {
    console.error("[stripe/webhook] payment_confirmed enqueue failed:", err);
  });

  // Promote the pending plan request, if there is one.
  const planRequestId = session.metadata?.planRequestId ?? null;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  if (planRequestId) {
    await prisma.customPlanRequest.update({
      where: { id: planRequestId },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        stripeSubscriptionId: subscriptionId,
      },
    });
    // SOW PDF is generated synchronously in /api/stripe/checkout BEFORE
    // the user is sent to Stripe — see lib/sow/generate.ts. This handler
    // only promotes the request to APPROVED; the doc already exists.
  }

  // Upgrade flow: if the user already had a subscription before this
  // checkout, cancel it now that the new one is active. We set
  // cancel_at_period_end=true so they keep service through the period
  // they've already paid for, then auto-cancel at the boundary.
  const previousSubscriptionId =
    session.metadata?.previousSubscriptionId || null;
  if (
    previousSubscriptionId &&
    subscriptionId &&
    previousSubscriptionId !== subscriptionId
  ) {
    try {
      await stripe.subscriptions.update(previousSubscriptionId, {
        cancel_at_period_end: true,
        metadata: {
          canceledByUpgrade: "true",
          replacedBy: subscriptionId,
        },
      });
    } catch (err) {
      // Don't fail the webhook — the user has their new sub. Surface in
      // logs so admin can clean up manually if needed.
      console.error(
        "Failed to schedule cancellation of previous subscription",
        previousSubscriptionId,
        err,
      );
    }
  }

  // Subscription record is created/updated by the subscription.* events,
  // which usually fire alongside checkout.session.completed. We don't
  // create one here to avoid races — the subscription handler is the
  // single owner of the Subscription row.

  if (basePlan !== "NONE" || planRequestId) {
    await syncDeliveryScheduleForUser(user.id).catch((err) => {
      console.error("[stripe/webhook] delivery schedule sync (checkout):", err);
    });
  }
}

async function onSubscriptionUpserted(sub: Stripe.Subscription) {
  const userIdMeta = sub.metadata?.userId ?? null;
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  const user = await resolveUser({ userIdMeta, customerId });
  if (!user) {
    console.warn("subscription.* : no matching user", {
      subId: sub.id,
      customerId,
    });
    return;
  }

  const basePlan = toPlan(sub.metadata?.basePlan);
  const status = SUBSCRIPTION_STATUS_MAP[sub.status] ?? "INCOMPLETE";

  // Re-fetch with product expansion so we can read product metadata
  // (kind, optionId) off each subscription item. We stamp this metadata on
  // the products when creating Checkout Sessions / subscription items, so
  // it's our cross-system mapping back to PlanOption IDs.
  const fullSub = await stripe.subscriptions.retrieve(sub.id, {
    expand: ["items.data.price.product"],
  });

  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: sub.id },
    select: { id: true },
  });

  const ourSub = existing
    ? await prisma.subscription.update({
        where: { stripeSubscriptionId: sub.id },
        data: {
          status,
          basePlan,
          currentPeriodStart: epochToDate(sub.current_period_start),
          currentPeriodEnd: epochToDate(sub.current_period_end),
          cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
          canceledAt: epochToDate(sub.canceled_at),
        },
      })
    : await prisma.subscription.create({
        data: {
          userId: user.id,
          stripeSubscriptionId: sub.id,
          stripeCustomerId: customerId,
          status,
          basePlan,
          currentPeriodStart: epochToDate(sub.current_period_start),
          currentPeriodEnd: epochToDate(sub.current_period_end),
          cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
          canceledAt: epochToDate(sub.canceled_at),
        },
      });

  // Sync items: remove anything Stripe no longer has, upsert the rest with
  // metadata-derived kind/optionId. Doing this on every subscription.*
  // event keeps the DB in lockstep when a user adds/removes add-ons via
  // the Billing Portal or the modify path below.
  const stripeItemIds = fullSub.items.data.map((i) => i.id);
  await prisma.subscriptionItem.deleteMany({
    where: {
      subscriptionId: ourSub.id,
      stripeItemId: { notIn: stripeItemIds.length > 0 ? stripeItemIds : ["__none__"] },
    },
  });

  for (const it of fullSub.items.data) {
    const product =
      typeof it.price.product === "object" && it.price.product !== null
        ? (it.price.product as Stripe.Product)
        : null;
    const meta = product?.metadata ?? {};
    const isBase = meta.kind === "base_monthly";
    await prisma.subscriptionItem.upsert({
      where: { stripeItemId: it.id },
      create: {
        subscriptionId: ourSub.id,
        stripeItemId: it.id,
        nameSnapshot: product?.name ?? "Item",
        priceCents: it.price.unit_amount ?? 0,
        billingType: "MONTHLY",
        quantity: it.quantity ?? 1,
        optionId: !isBase && meta.optionId ? meta.optionId : null,
        kind: isBase ? "base" : "addon",
      },
      update: {
        nameSnapshot: product?.name ?? "Item",
        priceCents: it.price.unit_amount ?? 0,
        quantity: it.quantity ?? 1,
        optionId: !isBase && meta.optionId ? meta.optionId : null,
        kind: isBase ? "base" : "addon",
      },
    });
  }

  if (status === "ACTIVE" || status === "TRIALING" || status === "PAST_DUE") {
    await syncDeliveryScheduleForUser(user.id).catch((err) => {
      console.error("[stripe/webhook] delivery schedule sync failed:", err);
    });
  }
}

async function onSubscriptionDeleted(sub: Stripe.Subscription) {
  await prisma.subscription
    .updateMany({
      where: { stripeSubscriptionId: sub.id },
      data: {
        status: "CANCELED",
        canceledAt: epochToDate(sub.canceled_at) ?? new Date(),
        cancelAtPeriodEnd: false,
      },
    })
    .catch((e) => {
      console.error("subscription.deleted update failed", e);
    });

  // If the user's only subscription is now canceled, drop them back to
  // NONE so the portal reflects that they're no longer on a plan.
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const userIdMeta = sub.metadata?.userId ?? null;
  const user = await resolveUser({ userIdMeta, customerId });
  if (user) {
    const active = await prisma.subscription.count({
      where: { userId: user.id, status: "ACTIVE" },
    });
    if (active === 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { plan: "NONE" },
      });
    }
  }
}

async function onInvoicePaid(
  invoice: Stripe.Invoice,
  status: "SUCCEEDED" | "FAILED",
) {
  // subscription_details is populated for invoices that originate from a
  // subscription (the common case here). Its `metadata` is a snapshot of
  // subscription metadata at finalization — we set { userId, planRequestId,
  // basePlan } on the subscription in the checkout route, so userId is here.
  const userIdMeta = invoice.subscription_details?.metadata?.userId ?? null;
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id ?? null;

  const user = await resolveUser({
    userIdMeta,
    customerId,
    email: invoice.customer_email,
  });
  if (!user) return;

  const amount =
    status === "SUCCEEDED"
      ? invoice.amount_paid ?? 0
      : invoice.amount_due ?? 0;

  await prisma.payment.create({
    data: {
      amount,
      currency: invoice.currency ?? "usd",
      status,
      description:
        status === "SUCCEEDED"
          ? `Invoice ${invoice.number ?? invoice.id} paid`
          : `Invoice ${invoice.number ?? invoice.id} failed`,
      userId: user.id,
    },
  });
}

async function onChargeRefunded(charge: Stripe.Charge) {
  const customerId =
    typeof charge.customer === "string"
      ? charge.customer
      : charge.customer?.id ?? null;
  const user = await resolveUser({
    customerId,
    email: charge.billing_details?.email,
  });
  if (!user) return;

  await prisma.payment.create({
    data: {
      amount: charge.amount_refunded ?? 0,
      currency: charge.currency ?? "usd",
      status: "REFUNDED",
      description: `Refund: ${charge.description ?? "Charge refunded"}`,
      userId: user.id,
    },
  });
}
