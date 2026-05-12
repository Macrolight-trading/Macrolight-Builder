import prisma from "@/lib/prisma";
import Link from "next/link";
import DealStageMover from "@/components/admin/crm/DealStageMover";

export const dynamic = "force-dynamic";

const STAGES = [
  { id: "PROSPECT", label: "Prospect", tone: "bg-gray-100 text-gray-700" },
  { id: "QUALIFIED", label: "Qualified", tone: "bg-blue-50 text-blue-700" },
  { id: "PROPOSAL", label: "Proposal", tone: "bg-violet-50 text-violet-700" },
  { id: "NEGOTIATION", label: "Negotiation", tone: "bg-amber-50 text-amber-700" },
  { id: "WON", label: "Won", tone: "bg-emerald-50 text-emerald-700" },
  { id: "LOST", label: "Lost", tone: "bg-red-50 text-red-700" },
] as const;

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const params = await searchParams;
  const stageFilter = params.stage;

  const where: Record<string, unknown> = {};
  if (stageFilter) where.stage = stageFilter;

  const deals = await prisma.deal.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      lead: { select: { id: true, name: true, company: true } },
    },
  });

  // Group by stage
  const byStage: Record<string, typeof deals> = {};
  for (const s of STAGES) byStage[s.id] = [];
  for (const d of deals) {
    if (!byStage[d.stage]) byStage[d.stage] = [];
    byStage[d.stage].push(d);
  }

  const totalValue = deals
    .filter((d) => d.stage !== "WON" && d.stage !== "LOST")
    .reduce((s, d) => s + d.value, 0);

  return (
    <>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals Pipeline</h1>
          <p className="mt-1 text-sm text-gray-500">
            {deals.length} deal{deals.length !== 1 ? "s" : ""} &middot;{" "}
            <span className="font-semibold text-gray-700">
              ${(totalValue / 100).toLocaleString()}
            </span>{" "}
            open
          </p>
        </div>
        <Link
          href="/admin/crm/deals/new"
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          + New Deal
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3">
        {STAGES.map((stage) => {
          const items = byStage[stage.id] || [];
          const sum = items.reduce((s, d) => s + d.value, 0);
          return (
            <div
              key={stage.id}
              className="bg-gray-50 rounded-xl border border-gray-200 flex flex-col min-h-[300px]"
            >
              <div className="px-3 py-2.5 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${stage.tone}`}
                  >
                    {stage.label}
                  </span>
                  <span className="text-xs text-gray-500">{items.length}</span>
                </div>
                <span className="text-[11px] font-semibold text-gray-600">
                  ${(sum / 100).toLocaleString()}
                </span>
              </div>
              <div className="p-2 space-y-2 flex-1">
                {items.length === 0 ? (
                  <p className="px-2 py-6 text-center text-[11px] text-gray-400">
                    Empty
                  </p>
                ) : (
                  items.map((d) => (
                    <div
                      key={d.id}
                      className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow"
                    >
                      <Link
                        href={`/admin/crm/deals/${d.id}`}
                        className="block group"
                      >
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-violet-700 line-clamp-2">
                          {d.title}
                        </p>
                        <p className="mt-1 text-[11px] text-gray-500 truncate">
                          {d.lead?.company || d.lead?.name || "—"}
                        </p>
                        <p className="mt-2 text-sm font-bold text-gray-900">
                          ${(d.value / 100).toLocaleString()}
                        </p>
                      </Link>
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <DealStageMover dealId={d.id} stage={d.stage} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
