import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700",
  CONTACTED: "bg-amber-50 text-amber-700",
  QUALIFIED: "bg-violet-50 text-violet-700",
  CONVERTED: "bg-emerald-50 text-emerald-700",
  UNQUALIFIED: "bg-gray-100 text-gray-500",
  LOST: "bg-red-50 text-red-700",
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status = params.status;
  const q = params.q;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
    ];
  }

  const [leads, statusCounts] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { deals: true, activities: true } },
      },
    }),
    prisma.lead.groupBy({ by: ["status"], _count: true }),
  ]);

  return (
    <>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="mt-1 text-sm text-gray-500">
            {leads.length} lead{leads.length !== 1 ? "s" : ""}
            {status && (
              <>
                {" "}
                in <span className="font-medium">{status}</span>
              </>
            )}
          </p>
        </div>
        <Link
          href="/admin/crm/leads/new"
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          + New Lead
        </Link>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/crm/leads"
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            !status
              ? "bg-gray-900 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          All
          <span className="opacity-60">{leads.length}</span>
        </Link>
        {(
          ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "UNQUALIFIED", "LOST"] as const
        ).map((s) => {
          const count =
            statusCounts.find((g) => g.status === s)?._count || 0;
          const active = status === s;
          return (
            <Link
              key={s}
              href={`/admin/crm/leads?status=${s}`}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                active ? "ring-2 ring-offset-1 ring-violet-500" : ""
              } ${STATUS_STYLES[s]}`}
            >
              {s}
              <span className="opacity-60">{count}</span>
            </Link>
          );
        })}
      </div>

      {/* Search */}
      <form action="/admin/crm/leads" method="GET" className="mb-6">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name, email, or company…"
          className="w-full max-w-sm rounded-lg border border-gray-200 px-3.5 py-2 text-sm"
        />
      </form>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {leads.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-400">
            No leads match this filter.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Company
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Value
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Deals
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Source
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Added
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50/40">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/crm/leads/${l.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold text-xs">
                          {l.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-violet-700">
                            {l.name}
                          </p>
                          <p className="text-xs text-gray-400">{l.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {l.company || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          STATUS_STYLES[l.status]
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {l.value != null
                        ? `$${(l.value / 100).toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {l._count.deals}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {l.source || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/crm/leads/${l.id}`}
                        className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                      >
                        Open &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
