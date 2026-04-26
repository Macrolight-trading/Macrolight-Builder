import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  const [userCount, revenue, contactCount, pageViewCount, recentPayments, recentContacts] =
    await Promise.all([
      prisma.user.count(),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "SUCCEEDED" } }),
      prisma.contact.count(),
      prisma.pageView.count(),
      prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.contact.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

  return {
    userCount,
    totalRevenue: (revenue._sum.amount || 0) / 100,
    contactCount,
    pageViewCount,
    recentPayments,
    recentContacts,
  };
}

export default async function AdminOverviewPage() {
  const stats = await getStats();

  const cards = [
    {
      label: "Total Users",
      value: stats.userCount.toLocaleString(),
      href: "/admin/users",
      color: "violet",
    },
    {
      label: "Revenue",
      value: `$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      href: "/admin/payments",
      color: "emerald",
    },
    {
      label: "Contacts",
      value: stats.contactCount.toLocaleString(),
      href: "/admin/contacts",
      color: "blue",
    },
    {
      label: "Page Views",
      value: stats.pageViewCount.toLocaleString(),
      href: "/admin/analytics",
      color: "amber",
    },
  ];

  const colorMap: Record<string, string> = {
    violet: "bg-violet-50 text-violet-700 border-violet-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your business metrics.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {card.label}
            </p>
            <p className={`mt-2 text-3xl font-extrabold ${colorMap[card.color]?.split(" ")[1] || "text-gray-900"}`}>
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Two-column recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Recent Payments
            </h2>
            <Link
              href="/admin/payments"
              className="text-xs font-medium text-violet-600 hover:text-violet-700"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentPayments.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">
                No payments yet.
              </p>
            ) : (
              stats.recentPayments.map((p) => (
                <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {p.user.name || p.user.email}
                    </p>
                    <p className="text-xs text-gray-400">
                      {p.description || "Payment"} &middot;{" "}
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      p.status === "SUCCEEDED"
                        ? "text-emerald-600"
                        : p.status === "FAILED"
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    ${(p.amount / 100).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Recent Contacts
            </h2>
            <Link
              href="/admin/contacts"
              className="text-xs font-medium text-violet-600 hover:text-violet-700"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentContacts.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">
                No contacts yet.
              </p>
            ) : (
              stats.recentContacts.map((c) => (
                <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400">
                      {c.industry || c.company || c.email} &middot;{" "}
                      {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      c.status === "NEW"
                        ? "bg-blue-50 text-blue-600"
                        : c.status === "REPLIED"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
