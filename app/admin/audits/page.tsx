import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getAudits() {
  return prisma.auditJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      result: {
        select: {
          overallScore: true,
          technicalScore: true,
          onPageScore: true,
          backlinkScore: true,
          localSeoScore: true,
        },
      },
    },
  });
}

export default async function AuditsListPage() {
  const audits = await getAudits();

  return (
    <>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO Audits</h1>
          <p className="mt-1 text-sm text-gray-500">
            On-demand audits for client and prospect sites.
          </p>
        </div>
        <Link
          href="/admin/audits/new"
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Run New Audit
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {audits.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm text-gray-400">
              No audits yet. Run your first one to see it here.
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Client
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  URL
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Score
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Run on
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {audits.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">
                    {a.clientName}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500 max-w-xs truncate">
                    {a.url}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-900">
                    {a.result ? <ScoreChip score={a.result.overallScore} /> : "—"}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">
                    {new Date(a.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/audits/${a.id}`}
                      className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                    >
                      View &rarr;
                    </Link>
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-gray-100 text-gray-600",
    RUNNING: "bg-blue-50 text-blue-600",
    COMPLETED: "bg-emerald-50 text-emerald-600",
    FAILED: "bg-red-50 text-red-600",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        styles[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function ScoreChip({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-emerald-600"
      : score >= 60
      ? "text-amber-600"
      : "text-red-600";
  return <span className={color}>{score}</span>;
}
