import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { AuditIssue } from "@/lib/audit/types";

export const dynamic = "force-dynamic";

/**
 * Printable PDF-ready audit report.
 *
 * This route is the source-of-truth design for the branded PDF (plan section
 * 8). The PDF generator in lib/audit/pdf.ts uses Puppeteer to render this
 * page and convert to PDF in Milestone 4.
 *
 * Layout follows the six-section structure from the plan:
 *   1. Cover (logo, client, URL, date, overall score)
 *   2. Executive summary + score chart
 *   3. Top critical issues
 *   4. Module sections
 *   5. What's working
 *   6. Next steps / CTA
 */
export default async function AuditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const audit = await prisma.auditJob.findUnique({
    where: { id },
    include: { result: true },
  });

  if (!audit || !audit.result) notFound();

  const result = audit.result;
  const issues: AuditIssue[] = Array.isArray(result.issues)
    ? (result.issues as AuditIssue[])
    : [];
  const critical = issues.filter((i) => i.severity === "critical").slice(0, 5);
  const positives =
    (result.rawData as { positives?: Record<string, string[]> })?.positives ?? {};
  const allPositives = Object.values(positives).flat();

  const moduleSections = [
    {
      key: "technical" as const,
      label: "Technical SEO",
      score: result.technicalScore,
    },
    {
      key: "onpage" as const,
      label: "On-Page / Content",
      score: result.onPageScore,
    },
    {
      key: "backlinks" as const,
      label: "Backlink Profile",
      score: result.backlinkScore,
    },
    {
      key: "localSeo" as const,
      label: "Local SEO",
      score: result.localSeoScore,
    },
  ];

  return (
    <article className="bg-white text-gray-900 max-w-3xl mx-auto px-8 py-12 print:px-0 print:py-0">
      {/* 1. Cover */}
      <header className="border-b border-gray-200 pb-8 mb-10">
        <div className="flex items-center justify-between mb-12">
          <span className="text-2xl font-extrabold tracking-tight">
            macro<span className="text-violet-600">light</span>
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            SEO Audit Report
          </span>
        </div>
        <h1 className="text-4xl font-extrabold mb-2">{audit.clientName}</h1>
        <p className="text-base text-gray-600 break-all">{audit.url}</p>
        <p className="mt-1 text-sm text-gray-400">
          {new Date(audit.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <div className="mt-10 flex items-end gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Overall Score
            </p>
            <p
              className={`text-7xl font-extrabold ${scoreColor(result.overallScore)}`}
            >
              {result.overallScore}
            </p>
          </div>
          <p className="text-sm text-gray-400 mb-3">/ 100</p>
        </div>
      </header>

      {/* 2. Executive summary */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Executive Summary</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-6">
          {summarize(result.overallScore, issues.length, critical.length)}
        </p>
        <div className="grid grid-cols-4 gap-3">
          {moduleSections.map((m) => (
            <div
              key={m.key}
              className="rounded-lg border border-gray-200 p-3 text-center"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {m.label}
              </p>
              <p className={`mt-1 text-2xl font-extrabold ${scoreColor(m.score)}`}>
                {m.score}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Top critical issues */}
      {critical.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Top Critical Issues</h2>
          <ol className="space-y-4">
            {critical.map((issue, i) => (
              <li
                key={i}
                className="border-l-4 border-red-500 bg-red-50/40 px-4 py-3"
              >
                <p className="text-sm font-bold">
                  {i + 1}. {issue.title}
                </p>
                <p className="mt-1 text-sm text-gray-700">{issue.description}</p>
                <p className="mt-2 text-sm">
                  <span className="font-medium">Recommended fix:</span>{" "}
                  {issue.recommendation}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 4. Module sections */}
      {moduleSections.map((m) => {
        const moduleIssues = issues.filter((i) => i.module === m.key);
        return (
          <section key={m.key} className="mb-10 break-inside-avoid">
            <div className="flex items-baseline justify-between border-b border-gray-200 pb-2 mb-4">
              <h2 className="text-xl font-bold">{m.label}</h2>
              <span className={`text-2xl font-extrabold ${scoreColor(m.score)}`}>
                {m.score}
                <span className="text-sm text-gray-400">/100</span>
              </span>
            </div>
            {moduleIssues.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No issues found in this category.
              </p>
            ) : (
              <ul className="space-y-3">
                {moduleIssues.map((issue, i) => (
                  <li key={i} className="text-sm">
                    <p>
                      <SeverityDot severity={issue.severity} />
                      <span className="font-semibold">{issue.title}</span>
                    </p>
                    <p className="ml-4 mt-0.5 text-gray-600">
                      {issue.recommendation}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      {/* 5. What's working */}
      {allPositives.length > 0 && (
        <section className="mb-10 break-inside-avoid">
          <h2 className="text-xl font-bold mb-4">What&apos;s Working</h2>
          <ul className="space-y-2">
            {allPositives.map((p, i) => (
              <li key={i} className="text-sm text-gray-700">
                <span className="text-emerald-600 font-bold mr-2">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 6. CTA */}
      <section className="mt-12 rounded-xl bg-violet-50 border border-violet-100 p-6 break-inside-avoid">
        <h2 className="text-lg font-bold text-violet-900">
          Want Macrolight Builders to fix these?
        </h2>
        <p className="mt-2 text-sm text-violet-800">
          We rebuild sites with SEO baked in from day one. Most of the issues
          flagged in this report are fixed automatically by the way we build —
          no plugin chasing, no patchwork. Reply to this email or book a call
          and we&apos;ll walk you through what we&apos;d prioritise first.
        </p>
      </section>

      <footer className="mt-10 pt-6 border-t border-gray-100 text-center text-[10px] text-gray-400">
        Generated by Macrolight Builders &middot;{" "}
        {new Date(audit.createdAt).toLocaleDateString()}
      </footer>
    </article>
  );
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

function summarize(
  overall: number,
  total: number,
  criticalCount: number
): string {
  const grade =
    overall >= 80
      ? "in good shape"
      : overall >= 60
      ? "in workable shape but with several gaps"
      : "underperforming and leaving rankings on the table";
  const criticalPhrase =
    criticalCount === 0
      ? "no critical issues were detected"
      : criticalCount === 1
      ? "one critical issue was detected"
      : `${criticalCount} critical issues were detected`;

  return (
    `Across the four audit categories, this site scored ${overall}/100 — ` +
    `${grade}. We surfaced ${total} total finding${total === 1 ? "" : "s"}, ` +
    `and ${criticalPhrase} that should be addressed first.`
  );
}

function SeverityDot({ severity }: { severity: AuditIssue["severity"] }) {
  const color =
    severity === "critical"
      ? "bg-red-500"
      : severity === "warning"
      ? "bg-amber-500"
      : "bg-gray-400";
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full mr-2 align-middle ${color}`}
    />
  );
}
