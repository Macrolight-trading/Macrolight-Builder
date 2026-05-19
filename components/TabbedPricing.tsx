"use client";

import { useState } from "react";
import Button from "./Button";
import CheckoutButton from "./CheckoutButton";
import type { PricingTier } from "./PricingCard";

// Tiers in this component map name → Plan enum key by uppercasing, matching
// what /api/stripe/checkout and lib/pricing.ts expect.
function planKeyFor(tier: PricingTier): "STARTER" | "GROWTH" | "PRO" | null {
  const k = tier.name.toUpperCase();
  return k === "STARTER" || k === "GROWTH" || k === "PRO" ? k : null;
}

interface TabbedPricingProps {
  tiers: PricingTier[];
  /** Optional name of the tier that should be active on first render. Defaults
   *  to the highlighted tier, or the first tier if none are highlighted. */
  defaultTierName?: string;
  /** If the logged-in viewer has an active subscription, the Plan enum key
   *  of its base plan (STARTER | GROWTH | PRO). Used to switch the CTA on
   *  matching/non-matching tiers. Null for logged-out or no-sub viewers. */
  currentBasePlan?: string | null;
}

export default function TabbedPricing({
  tiers,
  defaultTierName,
  currentBasePlan,
}: TabbedPricingProps) {
  // If the viewer is already subscribed, default the active tab to their
  // current plan so they land on "Current plan" rather than "Get Started".
  const subscribedTier = currentBasePlan
    ? tiers.find((t) => t.name.toUpperCase() === currentBasePlan)
    : undefined;
  const initial =
    tiers.find((t) => t.name === defaultTierName)?.name ??
    subscribedTier?.name ??
    tiers.find((t) => t.highlighted)?.name ??
    tiers[0]?.name;

  const [activeName, setActiveName] = useState<string | undefined>(initial);
  const active = tiers.find((t) => t.name === activeName) ?? tiers[0];

  if (!active) return null;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Tab strip ---------------------------------------------------- */}
      <div
        role="tablist"
        aria-label="Pricing tiers"
        className="relative flex w-full items-stretch gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1.5 shadow-sm"
      >
        {tiers.map((tier) => {
          const isActive = tier.name === active.name;
          const isCurrentPlan =
            currentBasePlan && planKeyFor(tier) === currentBasePlan;
          return (
            <button
              key={tier.name}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`tier-panel-${tier.name}`}
              id={`tier-tab-${tier.name}`}
              onClick={() => setActiveName(tier.name)}
              className={
                "relative flex-1 rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 " +
                (isActive
                  ? "bg-white text-gray-900 shadow-md shadow-violet-100/60 ring-1 ring-violet-200"
                  : "text-gray-500 hover:text-gray-800 hover:bg-white/60")
              }
            >
              <span className="block">{tier.name}</span>
              {isCurrentPlan ? (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Current
                </span>
              ) : (
                tier.badge && (
                  <span
                    className={
                      "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide " +
                      (isActive
                        ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white"
                        : "bg-violet-50 text-violet-600 border border-violet-100")
                    }
                  >
                    <span
                      className={
                        "h-1.5 w-1.5 rounded-full " +
                        (isActive
                          ? "bg-white/80 animate-pulse"
                          : "bg-violet-500")
                      }
                    />
                    {tier.badge}
                  </span>
                )
              )}
            </button>
          );
        })}
      </div>

      {/* Active panel ------------------------------------------------- */}
      <div
        role="tabpanel"
        id={`tier-panel-${active.name}`}
        aria-labelledby={`tier-tab-${active.name}`}
        key={active.name}
        className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm animate-fade-in-up"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-10 p-7 sm:p-10">
          {/* Left: name + price + CTA */}
          <div className="flex flex-col">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {active.name}
              </h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                {active.tagline}
              </p>
            </div>

            <div className="mt-6 mb-6 pb-6 border-b border-gray-100 md:border-b-0 md:pb-0">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-extrabold tracking-tight text-gray-900">
                  ${active.buildFee.toLocaleString()}
                </span>
                <span className="text-sm text-gray-400 pb-2">
                  one-time build
                </span>
              </div>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  + ${active.monthlyFee}
                  <span className="text-base font-medium text-gray-400">
                    /mo
                  </span>
                </span>
                <span className="text-sm text-gray-400 pb-1">
                  hosting & support
                </span>
              </div>
              <p className="mt-4 text-xs text-emerald-600 font-medium">
                ✓ Month-to-month · Cancel anytime
              </p>
            </div>

            <div className="mt-auto pt-6 md:pt-8 space-y-3">
              {(() => {
                const planKey = planKeyFor(active);
                if (!planKey) {
                  return (
                    <Button
                      href={active.ctaHref}
                      variant={active.highlighted ? "primary" : "secondary"}
                      size="lg"
                      fullWidth
                    >
                      {active.ctaLabel}
                    </Button>
                  );
                }
                const isCurrent =
                  currentBasePlan && currentBasePlan === planKey;
                const hasOtherSub =
                  Boolean(currentBasePlan) && !isCurrent;
                // Current plan: render a non-checkout button that links to
                // billing instead. Other plan but already subscribed:
                // "Switch to {tier}" — the checkout API will route this
                // through the modify path automatically. No active sub:
                // standard "Get started" CTA.
                if (isCurrent) {
                  return (
                    <Button
                      href="/portal/billing"
                      variant="secondary"
                      size="lg"
                      fullWidth
                    >
                      Current plan — manage →
                    </Button>
                  );
                }
                return (
                  <CheckoutButton
                    basePlan={planKey}
                    variant={active.highlighted ? "primary" : "secondary"}
                    size="lg"
                    fullWidth
                  >
                    {hasOtherSub
                      ? `Switch to ${active.name}`
                      : active.ctaLabel}
                  </CheckoutButton>
                );
              })()}
              <p className="text-center text-xs text-gray-400">
                {currentBasePlan && currentBasePlan !== planKeyFor(active)
                  ? "Net difference will be prorated on your next invoice."
                  : "🔒 30-day satisfaction guarantee"}
              </p>
            </div>
          </div>

          {/* Right: feature list */}
          <div className="mt-6 md:mt-0 md:border-l md:border-gray-100 md:pl-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              What&apos;s included
            </p>
            <ul className="space-y-3">
              {active.features.map((f) => (
                <li
                  key={f}
                  className="flex gap-3 text-sm text-gray-700 leading-relaxed"
                >
                  <svg
                    className={
                      "mt-0.5 h-5 w-5 shrink-0 " +
                      (active.highlighted
                        ? "text-violet-500"
                        : "text-emerald-500")
                    }
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
