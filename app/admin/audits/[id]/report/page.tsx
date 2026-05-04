import type React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { AuditIssue } from "@/lib/audit/types";
import type { BacklinkItem } from "@/lib/audit/modules/backlinks";

export const dynamic = "force-dynamic";

/**
 * Printable PDF-ready audit report (in-app preview).
 *
 * Both this page and lib/audit/pdf-template.ts render from the same DB row.
 * Unavailable modules show "Not available" with no API-key explanation.
 */

interface ModuleAvail { available: boolean }
interface AvailabilityMap {
  technical:       ModuleAvail;
  onpage:          ModuleAvail;
  backlinks:       ModuleAvail;
  localSeo:        ModuleAvail;
  domainAnalytics: ModuleAvail;
  serpVisibility:  ModuleAvail;
  localPack:       ModuleAvail;
  reputation:      ModuleAvail;
  overallAvailable: boolean;
}

const ALL_AVAILABLE: AvailabilityMap = {
  technical:       { available: true },
  onpage:          { available: true },
  backlinks:       { available: true },
  localSeo:        { available: true },
  domainAnalytics: { available: true },
  serpVisibility:  { available: true },
  localPack:       { available: true },
  reputation:      { available: true },
  overallAvailable: true,
};

function readAvailability(rawData: unknown): AvailabilityMap {
  if (!rawData || typeof rawData !== "object") return ALL_AVAILABLE;
  const a = (rawData as Record<string, unknown>).availability;
  if (!a || typeof a !== "object") return ALL_AVAILABLE;
  const get = (key: string) => {
    const node = (a as Record<string, unknown>)[key];
    if (!node || typeof node !== "object") return { available: true };
    return { available: (node as Record<string, unknown>).available !== false };
  };
  return {
    technical:       get("technical"),
    onpage:          get("onpage"),
    backlinks:       get("backlinks"),
    localSeo:        get("localSeo"),
    domainAnalytics: get("domainAnalytics"),
    serpVisibility:  get("serpVisibility"),
    localPack:       get("localPack"),
    reputation:      get("reputation"),
    overallAvailable: (a as Record<string, unknown>).overallAvailable !== false,
  };
}

// ── Supporting raw-data types ─────────────────────────────────────────────────
interface DARawData {
  overview?: {
    organicCount?: number | null;
    organicEtv?: number | null;
    pos1?: number | null;
    pos1to3?: number | null;
    pos1to10?: number | null;
    paidCount?: number | null;
  };
  rankedKeywords?: Array<{ keyword: string; position: number; searchVolume: number | null; cpc: number | null; url: string }>;
  competitors?: Array<{ domain: string; intersections: number | null; organicCount: number | null; organicEtv: number | null }>;
}

interface SVRawData {
  keyword?: string;
  brandPosition?: number | null;
  serpFeatureTypes?: string[];
  hasAiOverview?: boolean;
  aiOverviewCitesDomain?: boolean;
  aiOverviewSources?: Array<{ domain: string; title: string }>;
  topOrganicResults?: Array<{ position: number; domain: string; title: string; url: string }>;
  serpError?: string;
}

// ─────────────────────────────────────────────────────────────────────────────

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
  const rawData = result.rawData as Record<string, unknown> | null;

  const issues: AuditIssue[] = Array.isArray(result.issues)
    ? ((result.issues as unknown) as AuditIssue[])
    : [];
  const critical = issues.filter((i) => i.severity === "critical").slice(0, 5);
  const positives =
    (rawData as { positives?: Record<string, string[]> } | null)?.positives ?? {};
  const availability = readAvailability(rawData);

  // Extract per-module raw data blobs
  const rawBLData = rawData?.backlinks as Record<string, unknown> | undefined;
  const topBacklinks: BacklinkItem[] = Array.isArray(rawBLData?.topBacklinks)
    ? (rawBLData!.topBacklinks as BacklinkItem[])
    : [];
  const topBacklinksError =
    typeof rawBLData?.topBacklinksError === "string" ? rawBLData.topBacklinksError : null;

  const rawDAData = rawData?.domainAnalytics as DARawData | undefined;
  const rawSVData = rawData?.serpVisibility as SVRawData | undefined;

  const allPositives = (
    Object.entries(positives) as Array<[string, string[]]>
  )
    .filter(([key]) => {
      if (key === "overallAvailable") return false;
      const a = ((availability as unknown) as Record<string, unknown>)[key];
      return a && typeof a === "object" && "available" in (a as object)
        ? (a as ModuleAvail).available
        : true;
    })
    .flatMap(([, list]) => list);

  const moduleSections = [
    {
      key: "technical" as const,
      label: "Technical SEO",
      score: result.technicalScore,
      available: availability.technical.available,
    },
    {
      key: "onpage" as const,
      label: "On-Page / Content",
      score: result.onPageScore,
      available: availability.onpage.available,
    },
    {
      key: "backlinks" as const,
      label: "Backlink Profile",
      score: result.backlinkScore,
      available: availability.backlinks.available,
    },
    {
      key: "localSeo" as const,
      label: "Local SEO",
      score: result.localSeoScore,
      available: availability.localSeo.available,
    },
    {
      key: "domainAnalytics" as const,
      label: "Domain Analytics",
      score: (result as Record<string, unknown>).domainAnalyticsScore as number ?? 0,
      available: availability.domainAnalytics.available,
    },
    {
      key: "serpVisibility" as const,
      label: "SERP Visibility",
      score: (result as Record<string, unknown>).serpScore as number ?? 0,
      available: availability.serpVisibility.available,
    },
    {
      key: "localPack" as const,
      label: "Local Pack Visibility",
      score: (result as Record<string, unknown>).localPackScore as number ?? 0,
      available: availability.localPack.available,
    },
    {
      key: "reputation" as const,
      label: "Reputation",
      score: (result as Record<string, unknown>).reputationScore as number ?? 0,
      available: availability.reputation.available,
    },
  ];

  const availableCount = moduleSections.filter((m) => m.available).length;
  const overallAvailable = availability.overallAvailable;

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
        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Overall Score
          </p>
          {overallAvailable ? (
            <>
              <div className="flex items-end gap-4">
                <p className={`text-7xl font-extrabold ${scoreColor(result.overallScore)}`}>
                  {result.overallScore}
                </p>
                <p className="text-sm text-gray-400 mb-3">/ 100</p>
              </div>
              {availableCount < 8 && (
                <p className="mt-2 text-xs text-gray-500 italic">
                  Score reflects the {availableCount} of 8 audit categories with available data.
                </p>
              )}
            </>
          ) : (
            <p className="text-3xl font-bold text-gray-500 mt-1">Not available</p>
          )}
        </div>
      </header>

      {/* 2. Executive summary */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Executive Summary</h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-6">
          {summarize(
            overallAvailable ? result.overallScore : null,
            issues.length,
            critical.length,
            availableCount
          )}
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {moduleSections.map((m) => (
            <div key={m.key} className="rounded-lg border border-gray-200 p-3 text-center">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                {m.label}
              </p>
              {m.available ? (
                <p className={`mt-1 text-2xl font-extrabold ${scoreColor(m.score)}`}>{m.score}</p>
              ) : (
                <p className="mt-1 text-base font-semibold text-gray-400">N/A</p>
              )}
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
              <li key={i} className="border-l-4 border-red-500 bg-red-50/40 px-4 py-3">
                <p className="text-sm font-bold">
                  {i + 1}. {issue.title}
                </p>
                <p className="mt-1 text-sm text-gray-700">{issue.description}</p>
                <p className="mt-2 text-sm">
                  <span className="font-medium">Recommended fix:</span> {issue.recommendation}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 4. Module sections */}
      {moduleSections.map((m) => {
        if (!m.available) {
          return (
            <section key={m.key} className="mb-10 break-inside-avoid">
              <div className="flex items-baseline justify-between border-b border-gray-200 pb-2 mb-4">
                <h2 className="text-xl font-bold">{m.label}</h2>
                <span className="text-base font-semibold text-gray-400">Not available</span>
              </div>
              <p className="text-sm text-gray-500 italic">
                This category was not analyzed in this audit.
              </p>
            </section>
          );
        }

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
              <p className="text-sm text-gray-500 italic">No issues found in this category.</p>
            ) : (
              <ul className="space-y-3">
                {moduleIssues.map((issue, i) => (
                  <li key={i} className="text-sm">
                    <p>
                      <SeverityDot severity={issue.severity} />
                      <span className="font-semibold">{issue.title}</span>
                    </p>
                    <p className="ml-4 mt-0.5 text-gray-600">{issue.recommendation}</p>
                  </li>
                ))}
              </ul>
            )}

            {/* Backlinks extra data */}
            {/* When the per-link enumeration isn't available (subscription
                tier limitation), simply omit the table from the report.
                The "subscription required" notice is internal billing info
                and shouldn't appear in a client-facing artifact — the
                admin-only dashboard at /admin/audits/[id] still surfaces it. */}
            {m.key === "backlinks" && topBacklinks.length > 0 && (
              <BacklinksTable backlinks={topBacklinks} />
            )}

            {/* Domain Analytics extra data */}
            {m.key === "domainAnalytics" && rawDAData && (
              <div className="mt-6 space-y-5">
                {rawDAData.overview && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {[
                      { label: "Est. Monthly Visits", value: rawDAData.overview.organicEtv?.toLocaleString() ?? "—" },
                      { label: "Organic Keywords",    value: rawDAData.overview.organicCount?.toLocaleString() ?? "—" },
                      { label: "Top 10 Rankings",     value: rawDAData.overview.pos1to10?.toLocaleString() ?? "—" },
                      { label: "Top 3 Rankings",      value: rawDAData.overview.pos1to3?.toLocaleString() ?? "—" },
                      { label: "#1 Rankings",         value: rawDAData.overview.pos1?.toLocaleString() ?? "—" },
                      { label: "Paid Keywords",       value: rawDAData.overview.paidCount?.toLocaleString() ?? "—" },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                        <p className="text-lg font-extrabold text-gray-900">{value}</p>
                        <p className="text-[10px] font-medium text-gray-400 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                )}
                {rawDAData.rankedKeywords && rawDAData.rankedKeywords.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                      Top Ranking Keywords
                    </p>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <Th>Keyword</Th><Th center>Pos.</Th><Th center>Volume/mo</Th><Th center>CPC</Th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {rawDAData.rankedKeywords.slice(0, 10).map((kw, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-800">{kw.keyword}</td>
                              <td className="px-3 py-2 text-center text-gray-600">{kw.position}</td>
                              <td className="px-3 py-2 text-center text-gray-500">{kw.searchVolume?.toLocaleString() ?? "—"}</td>
                              <td className="px-3 py-2 text-center text-gray-500">{kw.cpc != null ? `$${kw.cpc.toFixed(2)}` : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {rawDAData.competitors && rawDAData.competitors.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                      Top Competitors
                    </p>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <Th>Domain</Th><Th center>Shared KWs</Th><Th center>Their Traffic</Th><Th center>Their KWs</Th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {rawDAData.competitors.map((c, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-800">{c.domain}</td>
                              <td className="px-3 py-2 text-center text-gray-500">{c.intersections?.toLocaleString() ?? "—"}</td>
                              <td className="px-3 py-2 text-center text-gray-500">{c.organicEtv?.toLocaleString() ?? "—"}</td>
                              <td className="px-3 py-2 text-center text-gray-500">{c.organicCount?.toLocaleString() ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SERP Visibility extra data */}
            {m.key === "serpVisibility" && rawSVData && (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                    <p className={`text-2xl font-extrabold ${rawSVData.brandPosition === 1 ? "text-emerald-600" : rawSVData.brandPosition == null ? "text-red-600" : "text-amber-600"}`}>
                      {rawSVData.brandPosition ?? "N/F"}
                    </p>
                    <p className="text-[10px] font-medium text-gray-400 mt-0.5">Brand Position</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                    <p className={`text-2xl font-extrabold ${rawSVData.hasAiOverview ? "text-emerald-600" : "text-gray-400"}`}>
                      {rawSVData.hasAiOverview ? "Yes" : "No"}
                    </p>
                    <p className="text-[10px] font-medium text-gray-400 mt-0.5">AI Overview</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                    <p className={`text-2xl font-extrabold ${rawSVData.aiOverviewCitesDomain ? "text-emerald-600" : "text-gray-400"}`}>
                      {rawSVData.aiOverviewCitesDomain ? "Cited" : "—"}
                    </p>
                    <p className="text-[10px] font-medium text-gray-400 mt-0.5">AI Citation</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                    <p className="text-2xl font-extrabold text-gray-900">{rawSVData.serpFeatureTypes?.length ?? 0}</p>
                    <p className="text-[10px] font-medium text-gray-400 mt-0.5">SERP Features</p>
                  </div>
                </div>
                {rawSVData.serpFeatureTypes && rawSVData.serpFeatureTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {rawSVData.serpFeatureTypes.map((f) => (
                      <span key={f} className="inline-block rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                        {f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    ))}
                  </div>
                )}
                {rawSVData.topOrganicResults && rawSVData.topOrganicResults.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                      Top 10 Organic Results for &ldquo;{rawSVData.keyword}&rdquo;
                    </p>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <Th center>#</Th><Th>Domain</Th><Th>Title</Th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {rawSVData.topOrganicResults.slice(0, 10).map((r, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-center text-gray-500 font-medium">{r.position}</td>
                              <td className="px-3 py-2 font-medium text-gray-800">{r.domain}</td>
                              <td className="px-3 py-2 text-gray-500 max-w-[280px] truncate">
                                <a href={r.url} target="_blank" rel="noreferrer" className="hover:text-violet-600 hover:underline" title={r.title}>
                                  {r.title}
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
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

// ── Shared table header cell ──────────────────────────────────────────────────
function Th({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <th className={`px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500 ${center ? "text-center" : "text-left"}`}>
      {children}
    </th>
  );
}

// ── Backlinks table component ─────────────────────────────────────────────────
function BacklinksTable({ backlinks }: { backlinks: BacklinkItem[] }) {
  return (
    <div className="mt-6">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
        Top Backlinks — by domain rank
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <Th>Referring Domain</Th>
              <Th>Anchor Text</Th>
              <Th center>Rank</Th>
              <Th center>Type</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {backlinks.map((bl, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-medium text-gray-800 break-all max-w-[200px]">
                  <a href={bl.urlFrom} target="_blank" rel="noreferrer"
                    className="hover:text-violet-600" title={bl.urlFrom}>
                    {bl.domainFrom}
                  </a>
                </td>
                <td className="px-3 py-2 text-gray-500 italic max-w-[160px] break-words">{bl.anchor}</td>
                <td className="px-3 py-2 text-center text-gray-500">{bl.rank ?? "—"}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide ${bl.dofollow ? "text-emerald-600" : "text-gray-400"}`}>
                    {bl.dofollow ? "dofollow" : "nofollow"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

function summarize(
  overall: number | null,
  total: number,
  criticalCount: number,
  availableCount: number
): string {
  if (overall == null) {
    return (
      "This audit could not produce a score — none of the categories had " +
      "enough data to evaluate. Check the site URL and try again."
    );
  }
  // Grade is floored by criticalCount so a high score with multiple criticals
  // doesn't read as "in good shape".
  const grade =
    criticalCount >= 3
      ? "underperforming and leaving rankings on the table"
      : criticalCount >= 1
      ? "in workable shape but with serious gaps to address"
      : overall >= 80
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
  const scopePhrase =
    availableCount < 8
      ? `Across the ${availableCount} audit categories with available data, `
      : "Across all eight audit categories, ";
  return (
    `${scopePhrase}this site scored ${overall}/100 — ` +
    `${grade}. We surfaced ${total} total finding${total === 1 ? "" : "s"}, ` +
    `and ${criticalPhrase} that should be addressed first.`
  );
}

function SeverityDot({ severity }: { severity: AuditIssue["severity"] }) {
  const color =
    severity === "critical" ? "bg-red-500" : severity === "warning" ? "bg-amber-500" : "bg-gray-400";
  return <span className={`inline-block w-2 h-2 rounded-full mr-2 align-middle ${color}`} />;
}
