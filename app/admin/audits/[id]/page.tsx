import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { AuditIssue } from "@/lib/audit/types";

export const dynamic = "force-dynamic";

async function getAudit(id: string) {
  return prisma.auditJob.findUnique({
    where: { id },
    include: { result: true },
  });
}

export default async function AuditDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const audit = await getAudit(id);
  if (!audit) notFound();

  const result = audit.result;
  const issues: AuditIssue[] =
    result && Array.isArray(result.issues) ? (result.issues as AuditIssue[]) : [];
  const critical = issues.filter((i) => i.severity === "critical");
  const warnings = issues.filter((i) => i.severity === "warning");
  const info = issues.filter((i) => i.severity === "info");

  return (
    <>
      <div className="mb-6">
        <Link
          href="/admin/audits"
          className="text-xs font-medium text-gray-500 hover:text-gray-700"
        >
          &larr; Back to audits
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{audit.clientName}</h1>
            <a
              href={audit.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-violet-600 hover:text-violet-700 break-all"
            >
              {audit.url}
            </a>
            <p className="mt-1 text-xs text-gray-400">
              Run on {new Date(audit.createdAt).toLocaleString()}
              {audit.completedAt && (
                <> &middot; took {Math.round(((audit.completedAt.getTime() - (audit.startedAt?.getTime() ?? audit.createdAt.getTime())) / 1000))}s</>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {result && (
              <Link
                href={`/admin/audits/${audit.id}/report`}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Open report
              </Link>
            )}
            {result && (
              <a
                href={`/api/audits/${audit.id}/pdf`}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                Download PDF
              </a>
            )}
          </div>
        </div>
      </div>

      {audit.status === "FAILED" && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Audit failed.</strong> {audit.error ?? "Unknown error."}
        </div>
      )}

      {(audit.status === "PENDING" || audit.status === "RUNNING") && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          Audit in progress — refresh to see results.
        </div>
      )}

      {result && (
        <>
          {/* Score cards */}
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <ScoreCard label="Overall" score={result.overallScore} primary />
            <ScoreCard label="Technical" score={result.technicalScore} />
            <ScoreCard label="On-Page" score={result.onPageScore} />
            <ScoreCard label="Backlinks" score={result.backlinkScore} />
            <ScoreCard label="Local SEO" score={result.localSeoScore} />
          </div>

          {/* Issues summary */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            <IssueBucket
              label="Critical"
              count={critical.length}
              tone="red"
            />
            <IssueBucket
              label="Warnings"
              count={warnings.length}
              tone="amber"
            />
            <IssueBucket label="Info" count={info.length} tone="gray" />
          </div>

          {/* Issue list */}
          <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">
                All findings
              </h2>
            </div>
            {issues.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-gray-400">
                No issues found.
              </p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {issues.map((issue, idx) => (
                  <IssueRow key={idx} issue={issue} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}

function ScoreCard({
  label,
  score,
  primary = false,
}: {
  label: string;
  score: number;
  primary?: boolean;
}) {
  const color =
    score >= 80
      ? "text-emerald-600"
      : score >= 60
      ? "text-amber-600"
      : "text-red-600";

  return (
    <div
      className={`rounded-xl border p-5 ${
        primary
          ? "bg-violet-50 border-violet-100"
          : "bg-white border-gray-200"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-extrabold ${color}`}>{score}</p>
      <p className="text-xs text-gray-400">/ 100</p>
    </div>
  );
}

function IssueBucket({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "red" | "amber" | "gray";
}) {
  const styles = {
    red: "bg-red-50 border-red-100 text-red-700",
    amber: "bg-amber-50 border-amber-100 text-amber-700",
    gray: "bg-gray-50 border-gray-100 text-gray-700",
  };
  return (
    <div className={`rounded-xl border p-4 ${styles[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold">{count}</p>
    </div>
  );
}

function IssueRow({ issue }: { issue: AuditIssue }) {
  const sevStyles: Record<AuditIssue["severity"], string> = {
    critical: "bg-red-50 text-red-700 border-red-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    info: "bg-gray-50 text-gray-600 border-gray-100",
  };
  const moduleLabel: Record<AuditIssue["module"], string> = {
    technical: "Technical",
    onpage: "On-Page",
    backlinks: "Backlinks",
    localSeo: "Local SEO",
  };

  return (
    <li className="px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${sevStyles[issue.severity]}`}
            >
              {issue.severity}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
              {moduleLabel[issue.module]}
            </span>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-gray-900">
            {issue.title}
          </p>
          <p className="mt-1 text-sm text-gray-600">{issue.description}</p>
          <p className="mt-2 text-sm text-gray-700">
            <strong className="font-medium">Fix:</strong> {issue.recommendation}
          </p>
          {issue.docsUrl && (
            <a
              href={issue.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-xs font-medium text-violet-600 hover:text-violet-700"
            >
              Reference docs &rarr;
            </a>
          )}
        </div>
      </div>
    </li>
  );
}
