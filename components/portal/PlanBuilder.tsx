"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { pricingTiers } from "@/lib/pricing";
import CheckoutTosModal from "@/components/CheckoutTosModal";

type BillingType = "ONE_TIME" | "MONTHLY";

type PlanOption = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  priceCents: number;
  billingType: BillingType;
};

// Mirror of the Prisma `Plan` enum. Kept here so the PlanCategoryMeta
// type matches what Prisma actually returns — CUSTOM included.
type Tier = "NONE" | "STARTER" | "GROWTH" | "PRO" | "CUSTOM";

type PlanCategoryMeta = {
  name: string;
  label: string | null;
  bundleDiscountPct: number;
  includedFromTier: Tier | null;
  sortOrder: number;
};

// Higher rank = "more included". A category with includedFromTier=GROWTH
// gets bundled into any plan whose tier rank is >= GROWTH's rank.
const TIER_RANK: Record<string, number> = {
  NONE: 0,
  STARTER: 1,
  GROWTH: 2,
  PRO: 3,
  CUSTOM: 99,
};

// Derived from the homepage pricing data (lib/pricing.ts) so the builder
// and the public pricing cards can never drift out of sync. `value` is the
// Plan enum key — derive it from name by uppercasing.
const BASE_PLANS = pricingTiers.map((t) => ({
  value: t.name.toUpperCase(),
  label: t.name,
  buildFee: t.buildFee,
  monthlyFee: t.monthlyFee,
  tagline: t.tagline,
  features: t.features,
  badge: t.badge,
}));

function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

type Mode = "client" | "admin";

export default function PlanBuilder({
  currentPlan,
  options,
  categories,
  initialBasePlan,
  initialSelectedIds,
  initialNotes,
  mode = "client",
  targetUserId,
  hasActiveSubscription = false,
  currentSubscribedOptionIds = [],
  currentBasePlan,
}: {
  currentPlan: string;
  options: PlanOption[];
  categories: PlanCategoryMeta[];
  /** Pre-select a base plan. Falls back to `currentPlan`, then "STARTER". */
  initialBasePlan?: string;
  /** Pre-select these option IDs. Used by the admin recommendation editor
   *  and by the client view when a recommendation has been pre-populated. */
  initialSelectedIds?: string[];
  /** Pre-fill the notes field. */
  initialNotes?: string;
  /** "client" submits as a CustomPlanRequest. "admin" upserts the user's
   *  PlanRecommendation via the admin API. */
  mode?: Mode;
  /** Required when mode === "admin": the user whose recommendation is
   *  being edited. */
  targetUserId?: string;
  /** True when the user already has an ACTIVE or TRIALING Stripe sub.
   *  Switches CTA copy to "Update subscription" and the post-submit
   *  flow to an inline confirmation instead of a Stripe redirect. */
  hasActiveSubscription?: boolean;
  /** Option IDs the user is currently paying for as monthly add-ons.
   *  Rendered with an "Active" badge so they can see what's already
   *  subscribed vs. what they're about to add or drop. */
  currentSubscribedOptionIds?: string[];
  /** Current base plan on the user's Stripe sub (e.g. "GROWTH"). Used to
   *  compute current MRR so the summary can show current → new → delta. */
  currentBasePlan?: string;
}) {
  const subscribedSet = useMemo(
    () => new Set(currentSubscribedOptionIds),
    [currentSubscribedOptionIds],
  );
  const currentBase = useMemo(
    () =>
      currentBasePlan
        ? BASE_PLANS.find((p) => p.value === currentBasePlan)
        : undefined,
    [currentBasePlan],
  );
  const router = useRouter();
  // Precedence: explicit initialBasePlan > currentPlan > STARTER.
  const resolvedInitialBase =
    (initialBasePlan && BASE_PLANS.some((p) => p.value === initialBasePlan) && initialBasePlan) ||
    (BASE_PLANS.some((p) => p.value === currentPlan) ? currentPlan : "STARTER");
  const [basePlan, setBasePlan] = useState(resolvedInitialBase);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialSelectedIds ?? [])
  );
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [tosOpen, setTosOpen] = useState(false);

  const selectedBase = BASE_PLANS.find((p) => p.value === basePlan);

  // Lookup category metadata by name; fall back to defaults when a category
  // doesn't have an explicit row (which means no bundle discount).
  const categoryMeta = useMemo(() => {
    const m = new Map<string, PlanCategoryMeta>();
    for (const c of categories) m.set(c.name, c);
    return m;
  }, [categories]);

  // Group options by category, sorted by the category's own sortOrder.
  const grouped = useMemo(() => {
    const m = new Map<string, PlanOption[]>();
    for (const o of options) {
      if (!m.has(o.category)) m.set(o.category, []);
      m.get(o.category)!.push(o);
    }
    return Array.from(m.entries()).sort(([a], [b]) => {
      const sa = categoryMeta.get(a)?.sortOrder ?? 999;
      const sb = categoryMeta.get(b)?.sortOrder ?? 999;
      return sa - sb || a.localeCompare(b);
    });
  }, [options, categoryMeta]);

  // Per-category subtotals, bundle status, and inclusion status. An "included"
  // category is one whose includedFromTier is at or below the chosen base
  // plan's tier — every item is bundled for free, the price doesn't count
  // toward totals, and the bundle discount is moot (you can't discount $0).
  const categoryAnalysis = useMemo(() => {
    const baseRank = TIER_RANK[basePlan] ?? 0;
    return grouped.map(([category, items]) => {
      const meta = categoryMeta.get(category);
      const includedTier = meta?.includedFromTier ?? null;
      const includedTierRank = includedTier && includedTier !== "NONE"
        ? TIER_RANK[includedTier] ?? 0
        : 0;
      const includedByBasePlan =
        includedTier !== null && includedTier !== "NONE" && baseRank >= includedTierRank;

      // When the category is included by the base plan, treat every item as
      // selected for display purposes but skip them from totals.
      const allSelected = includedByBasePlan
        ? true
        : items.length > 0 && items.every((o) => selected.has(o.id));

      const discountPct = meta?.bundleDiscountPct ?? 0;
      const bundleEligible = !includedByBasePlan && items.length >= 2 && discountPct > 0;
      const bundleActive = bundleEligible && allSelected;

      const selectedItems = includedByBasePlan
        ? items
        : items.filter((o) => selected.has(o.id));

      // Only items NOT included by the base plan contribute to subtotals.
      const billableItems = includedByBasePlan ? [] : selectedItems;
      const monthlySub = billableItems
        .filter((o) => o.billingType === "MONTHLY")
        .reduce((a, b) => a + b.priceCents, 0);
      const oneTimeSub = billableItems
        .filter((o) => o.billingType === "ONE_TIME")
        .reduce((a, b) => a + b.priceCents, 0);
      const monthlyDiscount = bundleActive
        ? Math.round((monthlySub * discountPct) / 100)
        : 0;
      const oneTimeDiscount = bundleActive
        ? Math.round((oneTimeSub * discountPct) / 100)
        : 0;
      return {
        category,
        label: meta?.label ?? category,
        items,
        allSelected,
        discountPct,
        bundleEligible,
        bundleActive,
        includedByBasePlan,
        monthlySub,
        oneTimeSub,
        monthlyDiscount,
        oneTimeDiscount,
        selectedCount: selectedItems.length,
      };
    });
  }, [grouped, selected, categoryMeta, basePlan]);

  const totals = useMemo(() => {
    let addOnMonthly = 0;
    let addOnOneTime = 0;
    let monthlyDisc = 0;
    let oneTimeDisc = 0;
    for (const c of categoryAnalysis) {
      addOnMonthly += c.monthlySub;
      addOnOneTime += c.oneTimeSub;
      monthlyDisc += c.monthlyDiscount;
      oneTimeDisc += c.oneTimeDiscount;
    }
    // Base plan rates are in dollars in BASE_PLANS; convert to cents.
    const baseMonthly = (selectedBase?.monthlyFee ?? 0) * 100;
    const baseOneTime = (selectedBase?.buildFee ?? 0) * 100;
    return {
      addOnMonthly,
      addOnOneTime,
      monthlyDisc,
      oneTimeDisc,
      baseMonthly,
      baseOneTime,
      monthlyTotal: baseMonthly + addOnMonthly - monthlyDisc,
      oneTimeTotal: baseOneTime + addOnOneTime - oneTimeDisc,
      totalDiscount: monthlyDisc + oneTimeDisc,
    };
  }, [categoryAnalysis, selectedBase]);

  // When the user has an active subscription, compute current MRR (base
  // monthly + monthly add-ons currently on the sub) so we can show
  // current → new → delta in the summary. Build fee is excluded because
  // it was already paid and won't be charged on a modification.
  const currentTotals = useMemo(() => {
    if (!hasActiveSubscription || !currentBase) {
      return null;
    }
    const baseMonthly = currentBase.monthlyFee * 100;
    let addOnMonthly = 0;
    for (const o of options) {
      if (o.billingType === "MONTHLY" && subscribedSet.has(o.id)) {
        addOnMonthly += o.priceCents;
      }
    }
    return {
      baseMonthly,
      addOnMonthly,
      monthlyTotal: baseMonthly + addOnMonthly,
    };
  }, [hasActiveSubscription, currentBase, options, subscribedSet]);

  // Deltas only meaningful when modifying. The "new recurring" figure is
  // intentionally NOT discounted — bundle savings are applied once on the
  // immediate invoice, not as a recurring discount, so the user's MRR
  // going forward is the un-discounted total.
  const deltas = useMemo(() => {
    if (!currentTotals) return null;
    const newRecurringMonthly = totals.baseMonthly + totals.addOnMonthly;
    const monthlyDelta = newRecurringMonthly - currentTotals.monthlyTotal;
    // The full bundle discount (monthly + one-time portions) is applied as
    // a one-time credit on the immediate invoice via a negative invoice
    // item — see the MODIFY path in /api/stripe/checkout.
    const bundleSavings = totals.monthlyDisc + totals.oneTimeDisc;
    // One-time charged today = new one-time add-ons - bundle credit. Build
    // fee is excluded (already paid). Floored at 0; if the credit exceeds
    // the new charge, Stripe carries the rest forward as a credit balance.
    const oneTimeCharge = Math.max(0, totals.addOnOneTime - bundleSavings);
    return {
      newRecurringMonthly,
      monthlyDelta,
      oneTimeCharge,
      bundleSavings,
      newAddOnsOneTime: totals.addOnOneTime,
    };
  }, [currentTotals, totals]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleCategory(items: PlanOption[], allSelected: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        for (const o of items) next.delete(o.id);
      } else {
        for (const o of items) next.add(o.id);
      }
      return next;
    });
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      // Admin and client use different endpoints but the same payload
      // shape so the editor UI stays identical for both.
      const url =
        mode === "admin" && targetUserId
          ? `/api/admin/portal/plan-recommendations/${encodeURIComponent(targetUserId)}`
          : "/api/portal/plan-requests";
      const method = mode === "admin" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basePlan,
          optionIds: Array.from(selected),
          notes: notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Submission failed");
      }
      setSubmitted(true);
      // Don't clear the form on submit. If the user clicks "Start a new
      // plan" we want to re-apply the recommendation (admin-curated
      // starting point), not drop them onto an empty editor — so the
      // reset happens in the success card's button below, not here.
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Checkout path: every plan change — new signup or upgrade — goes
   * through Stripe Checkout. The /api/stripe/checkout route snapshots the
   * selection as a PENDING CustomPlanRequest and creates a fresh Stripe
   * Checkout Session, returning a redirect URL. For upgrades, the webhook
   * cancels the previous subscription after the new one activates.
   */
  async function checkout() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basePlan,
          optionIds: Array.from(selected),
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? "Checkout failed");
      }
      if (!data?.url) {
        throw new Error("Checkout failed: no redirect URL returned");
      }
      window.location.href = data.url as string;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setSubmitting(false);
    }
  }

  if (submitted && mode !== "admin") {
    return (
      <div className="bg-white rounded-xl border border-emerald-200 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900">Request submitted</h2>
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          We&apos;ll review your custom plan and follow up shortly. You can
          build another one below if you&apos;d like to revise it.
        </p>
        <button
          onClick={() => {
            // Re-seed from the original props so the next session begins
            // from the admin recommendation (when one exists) rather than
            // whatever the client happened to have selected at submit.
            setSelected(new Set(initialSelectedIds ?? []));
            setNotes(initialNotes ?? "");
            setSubmitted(false);
          }}
          className="mt-5 px-4 py-2 text-sm font-semibold text-violet-700 hover:text-violet-800"
        >
          Start a new plan
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">

        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            1. Choose your base plan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BASE_PLANS.map((p) => {
              const active = basePlan === p.value;
              return (
                <button
                  key={p.value}
                  onClick={() => setBasePlan(p.value)}
                  className={`relative text-left px-4 py-4 rounded-xl border transition-all ${
                    active
                      ? "border-violet-500 bg-violet-50 ring-2 ring-violet-200"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  {p.badge && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full">
                      {p.badge}
                    </span>
                  )}
                  <p className={`text-sm font-bold ${active ? "text-violet-700" : "text-gray-900"}`}>
                    {p.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{p.tagline}</p>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      <span className="font-semibold text-gray-700">${p.buildFee}</span> build
                      {" · "}
                      <span className="font-semibold text-gray-700">${p.monthlyFee}/mo</span>
                    </p>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5">
                        <CheckIcon />
                        <span className="text-xs text-gray-600 leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">
            2. Add the services you want
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Tick anything you&apos;d like on top of your base plan. Categories with a green badge offer a bundle discount when you select every item.
          </p>
          <div className="space-y-6">
            {categoryAnalysis.map(({ category, label, items, allSelected, discountPct, bundleEligible, bundleActive, includedByBasePlan }) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {includedByBasePlan ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-violet-100 text-violet-600 flex items-center justify-center text-[10px] font-bold">✓</span>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</span>
                      </span>
                    ) : (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={() => toggleCategory(items, allSelected)}
                          className="rounded text-violet-600 focus:ring-violet-500"
                          aria-label={`Select all in ${label}`}
                        />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</span>
                      </label>
                    )}
                    {includedByBasePlan ? (
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                        Included with {basePlan}
                      </span>
                    ) : bundleEligible ? (
                      <span
                        className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          bundleActive ? "bg-emerald-100 text-emerald-700" : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {bundleActive ? `${discountPct}% bundle applied` : `Save ${discountPct}% as bundle`}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {items.map((o) => {
                    const checked = includedByBasePlan || selected.has(o.id);
                    const disabled = includedByBasePlan;
                    const isActiveSubscribed = subscribedSet.has(o.id);
                    return (
                      <label
                        key={o.id}
                        className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                          disabled
                            ? "border-violet-200 bg-violet-50/40 cursor-not-allowed"
                            : checked
                              ? "border-violet-300 bg-violet-50/50 cursor-pointer"
                              : "border-gray-100 hover:bg-gray-50 cursor-pointer"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => !disabled && toggle(o.id)}
                          className="mt-0.5 rounded text-violet-600 focus:ring-violet-500 disabled:opacity-60"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-gray-900 truncate flex items-center gap-1.5">
                              {o.name}
                              {isActiveSubscribed && !disabled && (
                                <span className="inline-flex items-center text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                  Active
                                </span>
                              )}
                            </span>
                            <span className="text-sm font-mono whitespace-nowrap">
                              {disabled ? (
                                <span className="text-violet-700 font-semibold">Included</span>
                              ) : (
                                <span className="text-gray-900">
                                  {money(o.priceCents)}
                                  {o.billingType === "MONTHLY" && (<span className="text-xs text-gray-400">/mo</span>)}
                                </span>
                              )}
                            </span>
                          </div>
                          {o.description && (<p className="text-xs text-gray-500 mt-0.5">{o.description}</p>)}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">
            3. Anything we should know?
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Optional — context, timing, or specifics about your project.
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={2000}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none resize-none"
            placeholder="e.g. We're launching in Q3 and need the website live by July."
          />
        </section>
      </div>

      <aside className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-gray-200 p-5 lg:sticky lg:top-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Your plan</p>

          <div className="mt-3 space-y-2 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Base plan</span>
              <span className="font-semibold text-gray-900">{basePlan}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Add-ons selected</span>
              <span className="font-semibold text-gray-900">{selected.size}</span>
            </div>
          </div>

          {totals.totalDiscount > 0 && (
            <div className="mt-4 space-y-1 pb-4 border-b border-gray-100 text-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Bundle savings</p>
              {categoryAnalysis
                .filter((c) => c.bundleActive)
                .map((c) => (
                  <div key={c.category} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 truncate">{c.label} ({c.discountPct}%)</span>
                    <span className="font-mono text-emerald-700">−{money(c.monthlyDiscount + c.oneTimeDiscount)}</span>
                  </div>
                ))}
            </div>
          )}

          {/* MODIFY mode: show current → new → delta. */}
          {currentTotals && deltas ? (
            <>
              <div className="mt-4 space-y-1 pb-3 border-b border-gray-100 text-xs">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  Currently paying
                </p>
                <div className="flex items-baseline justify-between">
                  <span className="text-gray-500">{currentBase?.label} plan</span>
                  <span className="font-mono text-gray-900">
                    {money(currentTotals.baseMonthly)}
                    <span className="text-gray-400">/mo</span>
                  </span>
                </div>
                {currentTotals.addOnMonthly > 0 && (
                  <div className="flex items-baseline justify-between">
                    <span className="text-gray-500">Current add-ons</span>
                    <span className="font-mono text-gray-900">
                      {money(currentTotals.addOnMonthly)}
                      <span className="text-gray-400">/mo</span>
                    </span>
                  </div>
                )}
                <div className="flex items-baseline justify-between pt-1 border-t border-gray-50 mt-1">
                  <span className="text-gray-700 font-semibold">Total today</span>
                  <span className="font-mono text-gray-900 font-semibold">
                    {money(currentTotals.monthlyTotal)}
                    <span className="text-gray-400 font-normal">/mo</span>
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-1 pb-3 border-b border-gray-100 text-xs">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-600 mb-1">
                  After update
                </p>
                <div className="flex items-baseline justify-between">
                  <span className="text-gray-500">{selectedBase?.label} plan</span>
                  <span className="font-mono text-gray-900">
                    {money(totals.baseMonthly)}
                    <span className="text-gray-400">/mo</span>
                  </span>
                </div>
                {totals.addOnMonthly > 0 && (
                  <div className="flex items-baseline justify-between">
                    <span className="text-gray-500">Monthly add-ons</span>
                    <span className="font-mono text-gray-900">
                      {money(totals.addOnMonthly)}
                      <span className="text-gray-400">/mo</span>
                    </span>
                  </div>
                )}
                <div className="flex items-baseline justify-between pt-1 border-t border-gray-50 mt-1">
                  <span className="text-gray-700 font-semibold">New total</span>
                  <span className="font-mono text-violet-700 font-semibold">
                    {money(deltas.newRecurringMonthly)}
                    <span className="text-violet-400 font-normal">/mo</span>
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {/* Net monthly change — the headline number. Charged or
                    credited via Stripe proration at submit. */}
                <div
                  className={`rounded-lg px-3 py-3 ${
                    deltas.monthlyDelta > 0
                      ? "bg-amber-50 border border-amber-100"
                      : deltas.monthlyDelta < 0
                        ? "bg-emerald-50 border border-emerald-100"
                        : "bg-gray-50 border border-gray-100"
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-gray-600">
                      {deltas.monthlyDelta > 0
                        ? "Monthly change"
                        : deltas.monthlyDelta < 0
                          ? "Monthly savings"
                          : "No monthly change"}
                    </span>
                    <span
                      className={`text-2xl font-extrabold ${
                        deltas.monthlyDelta > 0
                          ? "text-amber-700"
                          : deltas.monthlyDelta < 0
                            ? "text-emerald-700"
                            : "text-gray-500"
                      }`}
                    >
                      {deltas.monthlyDelta > 0 ? "+" : deltas.monthlyDelta < 0 ? "−" : ""}
                      {money(Math.abs(deltas.monthlyDelta))}
                      <span className="text-xs font-medium text-gray-400">/mo</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {deltas.monthlyDelta !== 0
                      ? "Prorated to today and charged or credited immediately."
                      : "Your monthly bill stays the same."}
                  </p>
                </div>

                {/* One-time charge today: new one-time add-ons net of
                    bundle credit. Build fee is excluded (already paid). */}
                {(deltas.newAddOnsOneTime > 0 || deltas.bundleSavings > 0) && (
                  <div className="rounded-lg px-3 py-3 bg-amber-50 border border-amber-100 space-y-1">
                    {deltas.newAddOnsOneTime > 0 && (
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-gray-500">New one-time add-ons</span>
                        <span className="font-mono text-gray-900">
                          {money(deltas.newAddOnsOneTime)}
                        </span>
                      </div>
                    )}
                    {deltas.bundleSavings > 0 && (
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-gray-500">Bundle credit</span>
                        <span className="font-mono text-emerald-700">
                          −{money(deltas.bundleSavings)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline justify-between pt-1 border-t border-amber-100">
                      <span className="text-sm text-gray-700 font-semibold">
                        One-time charge today
                      </span>
                      <span className="text-2xl font-extrabold text-amber-700">
                        {money(deltas.oneTimeCharge)}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Build fees aren&apos;t re-charged.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* NEW checkout flow: full totals as before. */}
              {(totals.baseMonthly > 0 || totals.baseOneTime > 0) && (
                <div className="mt-4 space-y-1 pb-3 border-b border-gray-100 text-xs">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Base plan ({selectedBase?.label})
                  </p>
                  {totals.baseOneTime > 0 && (
                    <div className="flex items-baseline justify-between">
                      <span className="text-gray-500">Build fee</span>
                      <span className="font-mono text-gray-900">{money(totals.baseOneTime)}</span>
                    </div>
                  )}
                  {totals.baseMonthly > 0 && (
                    <div className="flex items-baseline justify-between">
                      <span className="text-gray-500">Monthly</span>
                      <span className="font-mono text-gray-900">
                        {money(totals.baseMonthly)}<span className="text-gray-400">/mo</span>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {(totals.addOnMonthly > 0 || totals.addOnOneTime > 0) && (
                <div className="mt-3 space-y-1 pb-3 border-b border-gray-100 text-xs">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Add-ons</p>
                  {totals.addOnOneTime > 0 && (
                    <div className="flex items-baseline justify-between">
                      <span className="text-gray-500">One-time</span>
                      <span className="font-mono text-gray-900">{money(totals.addOnOneTime)}</span>
                    </div>
                  )}
                  {totals.addOnMonthly > 0 && (
                    <div className="flex items-baseline justify-between">
                      <span className="text-gray-500">Monthly</span>
                      <span className="font-mono text-gray-900">
                        {money(totals.addOnMonthly)}<span className="text-gray-400">/mo</span>
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 space-y-2">
                {totals.monthlyTotal > 0 && (
                  <div>
                    {totals.monthlyDisc > 0 && (
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-gray-400">Before bundle savings</span>
                        <span className="font-mono text-gray-400 line-through">{money(totals.monthlyTotal + totals.monthlyDisc)}</span>
                      </div>
                    )}
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-gray-500">Total monthly</span>
                      <span>
                        <span className="text-2xl font-extrabold text-violet-700">{money(totals.monthlyTotal)}</span>
                        <span className="text-xs text-gray-400">/mo</span>
                      </span>
                    </div>
                  </div>
                )}
                {totals.oneTimeTotal > 0 && (
                  <div>
                    {totals.oneTimeDisc > 0 && (
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-gray-400">Before bundle savings</span>
                        <span className="font-mono text-gray-400 line-through">{money(totals.oneTimeTotal + totals.oneTimeDisc)}</span>
                      </div>
                    )}
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-gray-500">Total one-time</span>
                      <span className="text-2xl font-extrabold text-amber-700">{money(totals.oneTimeTotal)}</span>
                    </div>
                  </div>
                )}
                {totals.monthlyTotal === 0 && totals.oneTimeTotal === 0 && (
                  <p className="text-sm text-gray-400 py-4 text-center">Pick a base plan to see your total.</p>
                )}
              </div>
            </>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          {mode === "admin" ? (
            <>
              <button
                onClick={submit}
                disabled={submitting}
                className="mt-5 w-full px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Saving…" : "Save recommendation"}
              </button>
              {submitted && !submitting && (
                <p className="mt-2 text-[11px] text-emerald-600 text-center font-semibold">
                  Recommendation saved.
                </p>
              )}
            </>
          ) : (
            <>
              {/* Primary CTA: open the TOS modal, then on confirm fire the
                  checkout. For a new user, /api/stripe/checkout builds a
                  Stripe Checkout Session and we redirect. For a user with
                  an active subscription, the API modifies the sub in place
                  and the modal handler shows the inline success. */}
              <button
                onClick={() => {
                  setError(null);
                  setTosOpen(true);
                }}
                disabled={submitting}
                className="mt-5 w-full px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? hasActiveSubscription
                    ? "Updating…"
                    : "Redirecting…"
                  : hasActiveSubscription
                    ? "Update subscription"
                    : "Checkout now"}
              </button>
              <p className="mt-2 text-[11px] text-gray-400 text-center leading-relaxed">
                {hasActiveSubscription
                  ? "We'll charge or credit only the net difference. Changes apply immediately."
                  : "You'll be redirected to secure Stripe billing to complete your subscription."}
              </p>
            </>
          )}
        </div>
      </aside>

      {/* TOS-agreement modal — gates the Stripe redirect / sub modification.
          Wraps the existing checkout() so the user has to actively agree
          before any money moves. */}
      <CheckoutTosModal
        open={tosOpen}
        onCancel={() => !submitting && setTosOpen(false)}
        onConfirm={() => {
          // Fire-and-forget; checkout() handles its own redirect + state.
          // Modal stays mounted with busy=true while submitting, then
          // either the page navigates or we close the modal on error.
          void checkout().finally(() => {
            setTosOpen(false);
          });
        }}
        busy={submitting}
        title={
          hasActiveSubscription
            ? "Confirm subscription update"
            : "Confirm your subscription"
        }
        description={
          hasActiveSubscription
            ? "We'll charge or credit the net difference via Stripe and apply your changes immediately. Confirm you've read and accepted our Terms and Privacy Policy to continue."
            : "By continuing, you authorize Macrolight Builder to charge your payment method via Stripe and confirm you've read and accepted our Terms and Privacy Policy."
        }
        confirmLabel={
          hasActiveSubscription ? "Update subscription" : "Continue to checkout"
        }
      />
    </div>
  );
}
