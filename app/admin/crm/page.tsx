import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getCrmStats() {
  const [
    leadCount,
    leadStatusGroups,
    dealCount,
    dealStageGroups,
    openActivities,
    wonDeals,
    recentLeads,
    upcomingActivities,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.groupBy({ by: ["status"], _count: true }),
    prisma.deal.count(),
    prisma.deal.groupBy({
      by: ["stage"],
      _count: true,
      _sum: { value: true },
    }),
    prisma.activity.count({ where: { completedAt: null } }),
    prisma.deal.aggregate({
      where: { stage: "WON" },
      _sum: { value: true },
      _count: true,
    }),
    prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.activity.findMany({
      where: { completedAt: null, dueDate: { not: null } },
      take: 5,
      orderBy: { dueDate: "asc" },
      include: {
        lead: { select: { id: true, name: true } },
        deal: { select: { id: true, title: true } },
      },
    }),
  ]);

  const pipelineValue = dealStageGroups
    .filter((g) => g.stage !== "WON" && g.stage !== "LOST")
    .reduce((sum, g) => sum + (g._sum.value || 0), 0);

  return {
    leadCount,
    leadStatusGroups,
    dealCount,
    dealStageGroups,
    openActivities,
    wonRevenue: (wonDeals._sum.value || 0) / 100,
    wonCount: wonDeals._count,
    pipelineValue: pipelineValue / 100,
    recentLeads,
    upcomingActivities,
  };
}

export default async function CrmOverviewPage() {
  const stats = await getCrmStats();

  const cards = [
    {
      label: "Total Leads",
      value: stats.leadCount.toLocaleString(),
      href: "/admin/crm/leads",
      tone: "violet",
    },
    {
      label: "Open Deals",
      value: stats.dealCount.toLocaleString(),
      href: "/admin/crm/deals",
      tone: "blue",
    },
    {
      label: "Pipeline Value",
      value: `$${stats.pipelineValue.toLocaleString(undefined, { minimumFractionDigits: 0 })}`,
      href: "/admin/crm/deals",
      tone: "amber",
    },
    {
      label: "Won Revenue",
      value: `$${stats.wonRevenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}`,
      href: "/admin/crm/deals?stage=WON",
      tone: "emerald",
    },
  ];

  const toneText: Record<string, string> = {
    violet: "text-violet-700",
    blue: "text-blue-700",
    amber: "text-amber-700",
    emerald: "text-emerald-700",
  };

  return (
    <>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM</h1>
          <p className="mt-1 text-sm text-gray-500">
            Leads, deals, and pipeline activity.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/crm/leads/new"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            + New Lead
          </Link>
          <Link
            href="/admin/crm/deals/new"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            + New Deal
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {c.label}
            </p>
            <p className={`mt-2 text-3xl font-extrabold ${toneText[c.tone]}`}>
              {c.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Lead status breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Lead Status</h2>
          </div>
          <div className="px-5 py-4 space-y-2">
            {(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "UNQUALIFIED", "LOST"] as const).map(
              (status) => {
                const c =
                  stats.leadStatusGroups.find((g) => g.status === status)?._count || 0;
                const pct = stats.leadCount > 0 ? (c / stats.leadCount) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-gray-600">{status}</span>
                      <span className="text-gray-400">{c}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Deal stage breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Pipeline by Stage</h2>
          </div>
          <div className="px-5 py-4 space-y-2">
            {(["PROSPECT", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"] as const).map(
              (stage) => {
                const g = stats.dealStageGroups.find((x) => x.stage === stage);
                const c = g?._count || 0;
                const v = (g?._sum.value || 0) / 100;
                return (
                  <div
                    key={stage}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-gray-600">{stage}</span>
                    <span className="text-gray-400">
                      {c} {c === 1 ? "deal" : "deals"} &middot;{" "}
                      <span className="text-gray-700 font-semibold">
                        ${v.toLocaleString()}
                      </span>
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent Leads</h2>
            <Link
              href="/admin/crm/leads"
              className="text-xs font-medium text-violet-600 hover:text-violet-700"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentLeads.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">
                No leads yet.
              </p>
            ) : (
              stats.recentLeads.map((l) => (
                <Link
                  key={l.id}
                  href={`/admin/crm/leads/${l.id}`}
                  className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/60"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{l.name}</p>
                    <p className="text-xs text-gray-400">
                      {l.company || l.email}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                    {l.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Activities */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Upcoming Activities
            </h2>
            <Link
              href="/admin/crm/activities"
              className="text-xs font-medium text-violet-600 hover:text-violet-700"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.upcomingActivities.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">
                Nothing scheduled.
              </p>
            ) : (
              stats.upcomingActivities.map((a) => (
                <div
                  key={a.id}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {a.subject}
                    </p>
                    <p className="text-xs text-gray-400">
                      {a.type} &middot;{" "}
                      {a.lead?.name || a.deal?.title || "Unassigned"}
                    </p>
                  </div>
                  {a.dueDate && (
                    <p className="text-xs text-gray-500">
                      {new Date(a.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
