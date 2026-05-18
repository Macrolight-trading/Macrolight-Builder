# Stripe — base subscription + dynamic add-ons

This document covers everything you need to do after pulling these changes:
schema migration, environment variables, Stripe-side configuration, and a
walkthrough of each flow.

## 1. Migrate the database

A new schema with new models (`Subscription`, `SubscriptionItem`),
new enums (`PlanRequestSource`, `SubscriptionStatus`), and new fields
(`User.stripeCustomerId`, `CustomPlanRequest.source`,
`CustomPlanRequest.stripeCheckoutSessionId`,
`CustomPlanRequest.stripeSubscriptionId`).

```bash
npx prisma generate
npx prisma migrate dev --name stripe_subscriptions_and_addons
```

For production:

```bash
npx prisma migrate deploy
```

## 2. Environment variables

Same env vars you already use — no new ones required.

```
STRIPE_SECRET_KEY=sk_test_...        # or sk_live_... in prod
STRIPE_WEBHOOK_SECRET=whsec_...
NEXTAUTH_URL=https://your-domain
DATABASE_URL=postgres://...
```

## 3. Stripe Dashboard configuration

- **Webhook endpoint**: `/api/stripe/webhook` — subscribe to these events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `charge.refunded`

- **Billing Portal**: in Stripe Dashboard → Settings → Billing → Customer
  portal, enable the features you want users to self-serve
  (cancel, update payment method, see invoices). The `/api/stripe/portal`
  route just opens the portal — it doesn't configure it.

- **Products & Prices**: nothing to create. Prices are built per-checkout
  from `lib/pricing.ts` (base plans) and the `PlanOption` table (add-ons),
  so editing those is the only place you change pricing.

## 4. Flows

### Public pricing page → signup → checkout
- `/pricing` `Get started` buttons → `CheckoutButton` → if logged out,
  redirects to `/signup?plan=X&next=/checkout/start?plan=X` → after signup,
  `/checkout/start` calls the checkout API and forwards to Stripe.

### Portal plan builder → direct checkout
- `/portal/build-plan` → pick base plan + add-ons → **Checkout now** posts
  selections to `/api/stripe/checkout`, snapshots the selection as a
  `CustomPlanRequest` (source = `CHECKOUT`, status = `PENDING`), creates a
  Stripe Checkout Session with mixed line items, redirects to Stripe.
- The old **Request a quote** button still works as a secondary CTA and
  takes the quote path (no Stripe).

### Webhook lifecycle
- `checkout.session.completed` promotes the pending `CustomPlanRequest` to
  `APPROVED`, sets `User.plan`, links the new `stripeSubscriptionId`.
- `customer.subscription.*` upserts the `Subscription` row.
- `invoice.payment_*` writes a `Payment` row so the billing history page
  stays accurate.

### Self-service billing
- `/portal/billing` shows a **Manage billing →** link once the user has a
  Stripe customer. It opens the Stripe Billing Portal so they can update
  card, cancel, or download invoices.

## 5. Known limitations / future work

- **Adding an add-on after initial checkout**: today this creates a second
  subscription. A future enhancement is `subscriptionItems.create` against
  the existing subscription. Out of scope for this pass.
- **Webhook idempotency**: Stripe may deliver the same event twice. The
  current handler is mostly idempotent (upserts), but `Payment` writes
  could duplicate on retry. Consider a `stripeEventId` unique key on
  `Payment` if this becomes a problem.
- **Bundle discount as Stripe coupon**: bundle savings are applied via a
  freshly-minted single-use Stripe coupon. Stripe accumulates these — you
  may want a janitor to delete old coupons periodically.

## 6. Files changed

```
prisma/schema.prisma                                  schema additions
lib/pricing.ts                                        + basePlanCents() helper
lib/plan-selection.ts                                 NEW — shared selection resolver
app/api/stripe/checkout/route.ts                      rewritten — subscription mode
app/api/stripe/webhook/route.ts                       rewritten — subscription lifecycle
app/api/stripe/portal/route.ts                        NEW — billing portal session
app/api/portal/plan-requests/route.ts                 refactored to use shared resolver
app/checkout/start/page.tsx                           NEW — post-signup handoff
app/portal/billing/page.tsx                           + Manage billing button
components/CheckoutButton.tsx                         NEW — pricing-page CTA
components/TabbedPricing.tsx                          uses CheckoutButton
components/portal/PlanBuilder.tsx                     + Checkout now CTA
components/portal/ManageBillingButton.tsx             NEW
components/auth/SignupForm.tsx                        honors ?next= param
```
