import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leads" };

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700",
  CONTACTED: "bg-amber-50 text-amber-700",
  QUALIFIED: "bg-violet-50 text-violet-700",
  CONVERTED: "bg-emerald-50 text-emerald-700",
  UNQUALIFIED: "bg-gray-100 text-gray-500",
  LOST: "bg-red-50 text-red-700",
};

export default async function PortalLeadsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;

  const [leads, statusCounts, project] = await Promise.all([
    prisma.lead.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { deals: true, activities: true } },
      },
    }),
    prisma.lead.groupBy({
      by: ["status"],
      where: { ownerId: userId },
      _count: true,
    }),
    prisma.project.findUnique({
      where: { userId },
      select: { liveUrl: true, previewUrl: true },
    }),
  ]);

  const countFor = (status: string) =>
    statusCounts.find((entry) => entry.status === status)?._count ?? 0;

  const totalLeadValue = leads.reduce((sum, lead) => sum + (lead.value ?? 0), 0);
  const latestLead = leads[0] ?? null;
  const destinationUrl = project?.liveUrl || project?.previewUrl || null;

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track the leads assigned to your portal account.
          </p>
        </div>
        {destinationUrl ? (
          <a
            href={destinationUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            View site →
          </a>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard
          label="Total Leads"
          value={String(leads.length)}
          helper={latestLead ? `Latest: ${latestLead.name}` : "No leads assigned yet"}
        />
        <StatCard
          label="New"
          value={String(countFor("NEW"))}
          helper="Fresh submissions waiting for follow-up"
        />
        <StatCard
          label="Qualified"
          value={String(countFor("QUALIFIED"))}
          helper="Promising leads worth active attention"
        />
        <StatCard
          label="Pipeline Value"
          value={
            totalLeadValue > 0
              ? `$${(totalLeadValue / 100).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}`
              : "—"
          }
          helper="Based on any estimated lead values on file"
        />
      </div>

      <div className="mb-8 rounded-xl border border-violet-200 bg-violet-50 p-5">
        <p className="text-sm font-semibold text-violet-900">How this page works</p>
        <p className="mt-1 text-sm text-violet-800">
          This first version shows leads assigned directly to your portal account.
          As your site-to-CRM wiring is completed, new website submissions can be
          routed here automatically.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "UNQUALIFIED", "LOST"] as const).map((status) => (
          <span
            key={status}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
          >
            {status}
            <span className="opacity-60">{countFor(status)}</span>
          </span>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {leads.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-gray-700">No leads assigned yet.</p>
            <p className="mt-1 text-sm text-gray-400">
              Once form submissions are routed into the Builder CRM and assigned to
              your account, they&apos;ll appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Lead
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Source
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Deals
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Activities
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Added
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/40">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{lead.name}</p>
                          <p className="text-xs text-gray-400">
                            {lead.company || lead.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[lead.status]}`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {lead.source || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{lead._count.deals}</td>
                    <td className="px-5 py-3.5 text-gray-600">{lead._count.activities}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/portal/leads/${lead.id}`}
                        className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                      >
                        Open →
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

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-extrabold text-violet-700">{value}</p>
      <p className="mt-1 text-xs text-gray-400">{helper}</p>
    </div>
  );
}
