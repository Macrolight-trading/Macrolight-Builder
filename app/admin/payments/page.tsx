import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const totals = await prisma.payment.groupBy({
    by: ["status"],
    _sum: { amount: true },
    _count: true,
  });

  const succeeded = totals.find(
    (t: { status: string; _sum: { amount: number | null }; _count: number }) =>
      t.status === "SUCCEEDED"
  );
  const totalRevenue = (succeeded?._sum.amount || 0) / 100;
  const totalCount = payments.length;

  const statusStyles: Record<string, string> = {
    SUCCEEDED: "bg-emerald-50 text-emerald-700",
    PENDING: "bg-amber-50 text-amber-700",
    FAILED: "bg-red-50 text-red-600",
    REFUNDED: "bg-gray-100 text-gray-500",
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="mt-1 text-sm text-gray-500">
          {totalCount} total payment{totalCount !== 1 ? "s" : ""} &middot;{" "}
          <span className="text-emerald-600 font-medium">
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>{" "}
          revenue
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(["SUCCEEDED", "PENDING", "FAILED", "REFUNDED"] as const).map(
          (status) => {
            const t = totals.find(
              (t: { status: string; _sum: { amount: number | null }; _count: number }) =>
                t.status === status
            );
            return (
              <div
                key={status}
                className="bg-white rounded-xl border border-gray-200 px-4 py-3"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  {status}
                </p>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  {t?._count || 0}
                </p>
                <p className="text-xs text-gray-400">
                  ${((t?._sum.amount || 0) / 100).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            );
          }
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Description
                </th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p: {
                id: string;
                amount: number;
                status: string;
                description: string | null;
                createdAt: Date;
                user: { name: string | null; email: string };
              }) => (
                <tr key={p.id} className="hover:bg-gray-50/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900">
                      {p.user.name || p.user.email}
                    </p>
                    <p className="text-xs text-gray-400">{p.user.email}</p>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-gray-900">
                    ${(p.amount / 100).toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        statusStyles[p.status] || "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {p.description || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">
                    {new Date(p.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payments.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-gray-400">
            No payments found.
          </p>
        )}
      </div>
    </>
  );
}
