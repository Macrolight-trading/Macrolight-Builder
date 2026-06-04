import Link from "next/link";
import type { AdminCheckoutPlanView } from "@/lib/admin/client-checkout-plan";

const REQUEST_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  CANCELED: "bg-gray-100 text-gray-500",
};

const SUB_STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  TRIALING: "bg-blue-50 text-blue-700",
  PAST_DUE: "bg-amber-50 text-amber-700",
  CANCELED: "bg-gray-100 text-gray-500",
  INCOMPLETE: "bg-gray-100 text-gray-500",
  INCOMPLETE_EXPIRED: "bg-gray-100 text-gray-500",
  UNPAID: "bg-red-50 text-red-700",
};

function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ClientCheckoutPlan({
  plan,
}: {
  plan: AdminCheckoutPlanView;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden lg:col-span-2">
      <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Subscription &amp; checkout plan
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Full selection from Stripe checkout — base plan, add-ons, and totals.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${REQUEST_STATUS_STYLES[plan.requestStatus] ?? "bg-gray-100 text-gray-500"}`}
          >
            Checkout {plan.requestStatus}
          </span>
          {plan.subscriptionStatus && (
            <span
              className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${SUB_STATUS_STYLES[plan.subscriptionStatus] ?? "bg-gray-100 text-gray-500"}`}
            >
              Stripe {plan.subscriptionStatus}
            </span>
          )}
          {plan.cancelAtPeriodEnd && (
            <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
              Cancels at period end
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Base plan
          </p>
          <p className="mt-0.5 text-lg font-bold text-gray-900">{plan.basePlan}</p>
          <p className="mt-1 text-xs text-gray-500">
            Checked out {formatDate(plan.checkedOutAt)}
            {plan.currentPeriodEnd && (
              <>
                {" "}
                · Renews {formatDate(plan.currentPeriodEnd)}
              </>
            )}
          </p>
          {plan.stripeSubscriptionId && (
            <p className="mt-1 text-[11px] font-mono text-gray-400">
              sub_{plan.stripeSubscriptionId.slice(-12)}
            </p>
          )}
        </div>
        <div className="text-right">
          {plan.bundleDiscountCents > 0 && (
            <p className="text-xs text-emerald-700 mb-0.5">
              Bundle savings: −{money(plan.bundleDiscountCents)}
            </p>
          )}
          {plan.monthlyCents > 0 && (
            <p className="text-sm">
              <span className="font-bold text-violet-700">
                {money(plan.monthlyCents)}
              </span>
              <span className="text-xs text-gray-400">/mo</span>
            </p>
          )}
          {plan.oneTimeCents > 0 && (
            <p className="text-sm">
              <span className="font-bold text-amber-700">
                {money(plan.oneTimeCents)}
              </span>
              <span className="text-xs text-gray-400"> one-time</span>
            </p>
          )}
        </div>
      </div>

      <div className="px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Line items ({plan.items.length})
        </p>
        {plan.items.length === 0 ? (
          <p className="text-sm text-gray-400">No line items recorded.</p>
        ) : (
          <ul className="space-y-1.5">
            {plan.items.map((item, idx) => (
              <li
                key={`${item.category}-${item.nameSnapshot}-${idx}`}
                className="flex items-center justify-between text-sm gap-3"
              >
                <span className="text-gray-700 flex items-center gap-2 min-w-0">
                  <span className="text-xs text-gray-400 shrink-0">
                    {item.category}
                  </span>
                  <span className="truncate">{item.nameSnapshot}</span>
                  {item.includedInBasePlan && (
                    <span className="inline-block shrink-0 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-700">
                      Included
                    </span>
                  )}
                </span>
                <span
                  className={`font-mono shrink-0 ${
                    item.includedInBasePlan
                      ? "text-gray-400 line-through"
                      : "text-gray-900"
                  }`}
                >
                  {money(item.priceCents)}
                  {item.billingType === "MONTHLY" && (
                    <span className="text-xs text-gray-400">/mo</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}

        {plan.notes && (
          <div className="mt-4 text-sm bg-gray-50 rounded-lg px-3 py-2 text-gray-700">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Client note at checkout
            </p>
            {plan.notes}
          </div>
        )}
      </div>

      {plan.requestId && (
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <Link
            href="/admin/portal/plan-requests"
            className="text-xs font-semibold text-violet-600 hover:text-violet-700"
          >
            View all plan requests →
          </Link>
        </div>
      )}
    </div>
  );
}
