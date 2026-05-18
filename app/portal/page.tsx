import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getPortalData(userId: string) {
  const [user, payments, paymentSum] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        createdAt: true,
      },
    }),
    prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.payment.aggregate({
      where: { userId, status: "SUCCEEDED" },
      _sum: { amount: true },
    }),
  ]);

  return {
    user,
    payments,
    totalSpend: (paymentSum._sum.amount || 0) / 100,
  };
}

export default async function PortalDashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return null;
  }

  const data = await getPortalData(userId);
  const user = data.user;
  if (!user) return null;

  const firstName = (user.name || user.email).split(" ")[0];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {firstName}.
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here&apos;s a snapshot of your Macrolight account.
        </p>
      </div>

      {/* Build a plan CTA */}
      <div className="mb-8 bg-violet-50 border border-violet-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-violet-900">
            Want additional services?
          </p>
          <p className="mt-0.5 text-xs text-violet-700">
            Build a custom plan to add SEO, content, ads, or other services to your account.
          </p>
        </div>
        <Link
          href="/portal/build-plan"
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Build a Plan &rarr;
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Current Plan
          </p>
          <p className="mt-2 text-2xl font-extrabold text-violet-700">
            {user.plan}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Member since{" "}
            {new Date(user.createdAt).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Lifetime Spend
          </p>
          <p className="mt-2 text-2xl font-extrabold text-emerald-700">
            $
            {data.totalSpend.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Across {data.payments.length} payment
            {data.payments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Account
          </p>
          <p className="mt-2 text-sm font-medium text-gray-900 truncate">
            {user.name || "Unnamed account"}
          </p>
          <p className="mt-0.5 text-xs text-gray-400 truncate">{user.email}</p>
          <Link
            href="/portal/profile"
            className="mt-2 inline-block text-xs font-semibold text-violet-600 hover:text-violet-700"
          >
            Edit profile &rarr;
          </Link>
        </div>
      </div>

      {/* Recent payments */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Recent Payments
          </h2>
          <Link
            href="/portal/billing"
            className="text-xs font-medium text-violet-600 hover:text-violet-700"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {data.payments.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-400 text-center">
              No payments yet.
            </p>
          ) : (
            data.payments.map((p) => (
              <div
                key={p.id}
                className="px-5 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {p.description || "Payment"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      p.status === "SUCCEEDED"
                        ? "text-emerald-600"
                        : p.status === "FAILED"
                          ? "text-red-500"
                          : "text-gray-500"
                    }`}
                  >
                    ${(p.amount / 100).toFixed(2)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400">
                    {p.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Helpful links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/portal/support"
          className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <p className="text-sm font-semibold text-gray-900">
            Need a change?
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Request edits, additions, or a new page from our team.
          </p>
          <p className="mt-3 text-xs font-semibold text-violet-600">
            Open a request &rarr;
          </p>
        </Link>
        <a
          href="mailto:bbayley50@gmail.com"
          className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <p className="text-sm font-semibold text-gray-900">
            Reach your strategist
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Have a question? Email us and we&apos;ll get back within one
            business day.
          </p>
          <p className="mt-3 text-xs font-semibold text-violet-600">
            bbayley50@gmail.com &rarr;
          </p>
        </a>
      </div>
    </>
  );
}
