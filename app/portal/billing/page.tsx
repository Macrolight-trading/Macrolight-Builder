import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import ManageBillingButton from "@/components/portal/ManageBillingButton";
import { getUserSubscriptionState } from "@/lib/plan-selection";
import { basePlanCents } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  SUCCEEDED: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
  FAILED: "bg-red-50 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-500",
};

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;

  const subState = await getUserSubscriptionState(userId);

  // Look up the display names + prices for the user's active monthly
  // add-ons. We can't trust the option to still exist (admin may have
  // retired it) so fall back to "Add-on" / $0 in those edge cases.
  const activeAddons =
    subState.subscribedOptionIds.length > 0
      ? await prisma.planOption.findMany({
          where: { id: { in: subState.subscribedOptionIds } },
          select: {
            id: true,
            name: true,
            priceCents: true,
            billingType: true,
            category: true,
          },
        })
      : [];
  const activeMonthlyAddons = activeAddons.filter(
    (o) => o.billingType === "MONTHLY",
  );
  const addonMonthlyTotal = activeMonthlyAddons.reduce(
    (sum, o) => sum + o.priceCents,
    0,
  );
  const baseMonthlyCents = subState.basePlan
    ? basePlanCents(subState.basePlan)?.monthlyCents ?? 0
    : 0;
  const recurringTotal = baseMonthlyCents + addonMonthlyTotal;

  const [user, payments, sum, sows] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, stripeCustomerId: true },
    }),
    prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.aggregate({
      where: { userId, status: "SUCCEEDED" },
      _sum: { amount: true },
    }),
    // Approved plan requests with a generated SOW PDF. We list every one
    // (not just the latest) so users can grab historical SOWs after they
    // upgrade or modify.
    prisma.customPlanRequest.findMany({
      where: {
        userId,
        status: "APPROVED",
        sowPdfUrl: { not: null },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        basePlan: true,
        sowPdfUrl: true,
        sowGeneratedAt: true,
        createdAt: true,
      },
    }),
  ]);

  const total = (sum._sum.amount || 0) / 100;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Plan, invoices, and payment history.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Current Plan
          </p>
          <p className="mt-2 text-2xl font-extrabold text-violet-700">
            {user?.plan ?? "STARTER"}
          </p>

          {/* Active add-ons. We list them inline under the plan name so
              the user can see what they're paying for at a glance — not
              just the base tier. */}
          {activeMonthlyAddons.length > 0 ? (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Active add-ons
              </p>
              <ul className="space-y-1">
                {activeMonthlyAddons.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-gray-700 truncate">{a.name}</span>
                    <span className="font-mono text-gray-500 ml-2 whitespace-nowrap">
                      ${(a.priceCents / 100).toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                      })}
                      <span className="text-gray-400">/mo</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 pt-2 border-t border-gray-50 flex items-baseline justify-between text-xs">
                <span className="text-gray-500 font-semibold">
                  Monthly total
                </span>
                <span className="font-mono text-gray-900 font-semibold">
                  ${(recurringTotal / 100).toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                  })}
                  <span className="text-gray-400">/mo</span>
                </span>
              </div>
            </div>
          ) : subState.basePlan ? (
            <p className="mt-2 text-xs text-gray-400">
              No active add-ons. Total{" "}
              <span className="font-mono text-gray-700">
                ${(baseMonthlyCents / 100).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                })}
                /mo
              </span>
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            <Link
              href="/pricing"
              className="text-xs font-semibold text-violet-600 hover:text-violet-700"
            >
              Change plan &rarr;
            </Link>
            <Link
              href="/portal/build-plan"
              className="text-xs font-semibold text-violet-600 hover:text-violet-700"
            >
              {activeMonthlyAddons.length > 0 ? "Manage add-ons" : "Build a custom plan"} &rarr;
            </Link>
            <ManageBillingButton hasStripeCustomer={Boolean(user?.stripeCustomerId)} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Lifetime Spend
          </p>
          <p className="mt-2 text-2xl font-extrabold text-emerald-700">
            ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Across {payments.length} payment
            {payments.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {sows.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Documents</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Signed Statements of Work for your subscription history.
            </p>
          </div>
          <ul className="divide-y divide-gray-50">
            {sows.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    Statement of Work · {s.basePlan}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Issued{" "}
                    {new Date(
                      s.sowGeneratedAt ?? s.createdAt,
                    ).toLocaleDateString()}{" "}
                    · SOW-{s.id.slice(-10).toUpperCase()}
                  </p>
                </div>
                <a
                  href={`/api/portal/plan-requests/${s.id}/sow?download=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
                    />
                  </svg>
                  Download PDF
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            Payment History
          </h2>
        </div>
        {payments.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-400">
            No payments yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Description
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/40">
                  <td className="px-5 py-3.5 text-gray-900">
                    {p.description || "Payment"}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        STATUS_STYLES[p.status] || "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-gray-900">
                    ${(p.amount / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
