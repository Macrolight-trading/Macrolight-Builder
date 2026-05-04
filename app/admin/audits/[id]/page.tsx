import type React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { AuditIssue } from "@/lib/audit/types";
import type { BacklinkItem } from "@/lib/audit/modules/backlinks";

export const dynamic = "force-dynamic";

async function getAudit(id: string) {
  return prisma.auditJob.findUnique({
    where: { id },
    include: { result: true },
  });
}

/** Shape of the availability metadata persisted in rawData. */
interface AvailabilityMap {
  technical:       { available: boolean; reason: string | null };
  onpage:          { available: boolean; reason: string | null };
  backlinks:       { available: boolean; reason: string | null };
  localSeo:        { available: boolean; reason: string | null };
  domainAnalytics: { available: boolean; reason: string | null };
  serpVisibility:  { available: boolean; reason: string | null };
  localPack:       { available: boolean; reason: string | null };
  reputation:      { available: boolean; reason: string | null };
  overallAvailable: boolean;
}

const ALL_AVAILABLE: AvailabilityMap = {
  technical:       { available: true, reason: null },
  onpage:          { available: true, reason: null },
  backlinks:       { available: true, reason: null },
  localSeo:        { available: true, reason: null },
  domainAnalytics: { available: true, reason: null },
  serpVisibility:  { available: true, reason: null },
  localPack:       { available: true, reason: null },
  reputation:      { available: true, reason: null },
  overallAvailable: true,
};

function readAvailability(rawData: unknown): AvailabilityMap {
  if (!rawData || typeof rawData !== "object") return ALL_AVAILABLE;
  const a = (rawData as Record<string, unknown>).availability;
  if (!a || typeof a !== "object") return ALL_AVAILABLE;
  const get = (key: string) => {
    const node = (a as Record<string, unknown>)[key];
    if (!node || typeof node !== "object") return { available: true, reason: null };
    const obj = node as Record<string, unknown>;
    return {
      available: obj.available !== false,
      reason: typeof obj.reason === "string" ? obj.reason : null,
    };
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

// ── Domain analytics types ────────────────────────────────────────────────────
interface DARawData {
  overview?: {
    organicCount?: number | null;
    organicEtv?: number | null;
    paidCount?: number | null;
    pos1?: number | null;
    pos1to3?: number | null;
    pos1to10?: number | null;
  };
  rankedKeywords?: Array<{
    keyword: string;
    position: number;
    searchVolume: number | null;
    url: string;
    cpc: number | null;
  }>;
  competitors?: Array<{
    domain: string;
    intersections: number | null;
    organicCount: number | null;
    organicEtv: number | null;
  }>;
  overviewError?: string;
  rankedKeywordsError?: string;
  competitorsError?: string;
}

// ── SERP visibility types ─────────────────────────────────────────────────────
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
    result && Array.isArray(result.issues) ? ((result.issues as unknown) as AuditIssue[]) : [];
  const critical = issues.filter((i) => i.severity === "critical");
  const warnings = issues.filter((i) => i.severity === "warning");
  const info = issues.filter((i) => i.severity === "info");

  const availability = result ? readAvailability(result.rawData) : ALL_AVAILABLE;

  const rawData = result?.rawData as Record<string, unknown> | null | undefined;

  // Backlinks
  const rawBLData = rawData?.backlinks as Record<string, unknown> | undefined;
  const topBacklinks: BacklinkItem[] = Array.isArray(rawBLData?.topBacklinks)
    ? (rawBLData!.topBacklinks as BacklinkItem[])
    : [];
  const topBacklinksError =
    typeof rawBLData?.topBacklinksError === "string" ? rawBLData.topBacklinksError : null;

  // Domain analytics
  const rawDAData = rawData?.domainAnalytics as DARawData | undefined;

  // SERP visibility
  const rawSVData = rawData?.serpVisibility as SVRawData | undefined;

  console.log("[audit detail] topBacklinks count:", topBacklinks.length);

  const unavailableModules = result
    ? (
        [
          ["Technical SEO",    availability.technical]       as const,
          ["On-Page",          availability.onpage]          as const,
          ["Backlinks",        availability.backlinks]       as const,
          ["Local SEO",        availability.localSeo]        as const,
          ["Domain Analytics", availability.domainAnalytics] as const,
          ["SERP Visibility",  availability.serpVisibility]  as const,
          ["Local Pack",       availability.localPack]       as const,
          ["Reputation",       availability.reputation]      as const,
        ] satisfies ReadonlyArray<readonly [string, { available: boolean; reason: string | null }]>
      ).filter(([, a]) => !a.available)
    : [];

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

      {/* Admin-only banner: which modules couldn't run and why */}
      {result && unavailableModules.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            {unavailableModules.length} module{unavailableModules.length === 1 ? "" : "s"} could not run
          </p>
          <p className="mt-1 text-xs text-amber-700">
            These modules are excluded from the overall score. The PDF will
            show them as &quot;Not available&quot; without revealing the
            reason. Admin-only diagnostic info:
          </p>
          <ul className="mt-3 space-y-1.5">
            {unavailableModules.map(([label, a]) => (
              <li key={label} className="text-xs text-amber-900">
                <strong className="font-semibold">{label}:</strong>{" "}
                {a.reason ?? "Not available"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result && (
        <>
          {/* Score cards — 9 total: overall + 8 modules */}
          <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
            <ScoreCard
              label="Overall"
              score={result.overallScore}
              available={availability.overallAvailable}
              primary
            />
            <ScoreCard
              label="Technical"
              score={result.technicalScore}
              available={availability.technical.available}
            />
            <ScoreCard
              label="On-Page"
              score={result.onPageScore}
              available={availability.onpage.available}
            />
            <ScoreCard
              label="Backlinks"
              score={result.backlinkScore}
              available={availability.backlinks.available}
            />
            <ScoreCard
              label="Local SEO"
              score={result.localSeoScore}
              available={availability.localSeo.available}
            />
            <ScoreCard
              label="Domain Analytics"
              score={(result as Record<string, unknown>).domainAnalyticsScore as number ?? 0}
              available={availability.domainAnalytics.available}
            />
            <ScoreCard
              label="SERP Visibility"
              score={(result as Record<string, unknown>).serpScore as number ?? 0}
              available={availability.serpVisibility.available}
            />
            <ScoreCard
              label="Local Pack"
              score={(result as Record<string, unknown>).localPackScore as number ?? 0}
              available={availability.localPack.available}
            />
            <ScoreCard
              label="Reputation"
              score={(result as Record<string, unknown>).reputationScore as number ?? 0}
              available={availability.reputation.available}
            />
          </div>

          {/* Issues summary */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            <IssueBucket label="Critical" count={critical.length} tone="red" />
            <IssueBucket label="Warnings" count={warnings.length} tone="amber" />
            <IssueBucket label="Info" count={info.length} tone="gray" />
          </div>

          {/* Issue list */}
          <section className="mb-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">All findings</h2>
            </div>
            {issues.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-gray-400">
                {unavailableModules.length === 6
                  ? "No data available — none of the audit modules could run."
                  : "No issues found in the modules that ran."}
              </p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {issues.map((issue, idx) => (
                  <IssueRow key={idx} issue={issue} />
                ))}
              </ul>
            )}
          </section>

          {/* Backlinks data table */}
          {availability.backlinks.available && topBacklinksError && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
              <strong>Backlinks list not available:</strong> DataForSEO returned{" "}
              <code className="text-xs bg-amber-100 px-1 rounded">{topBacklinksError}</code>
              <br />
              <a
                href="https://app.dataforseo.com/backlinks-subscription"
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-xs font-medium text-amber-900 underline"
              >
                Activate Backlinks subscription at dataforseo.com →
              </a>
            </div>
          )}
          {availability.backlinks.available && topBacklinks.length > 0 && (
            <section className="mb-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Top Backlinks</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Up to 25 backlinks, ordered by referring domain rank (highest first)
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <Th>Referring Domain</Th>
                      <Th>Anchor Text</Th>
                      <Th>Linking Page</Th>
                      <Th center>Rank</Th>
                      <Th center>Type</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {topBacklinks.map((bl, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-800">{bl.domainFrom}</td>
                        <td className="px-4 py-3 text-gray-500 italic max-w-[160px] truncate">{bl.anchor}</td>
                        <td className="px-4 py-3 text-gray-400 max-w-[220px] truncate">
                          <a href={bl.urlFrom} target="_blank" rel="noreferrer"
                            className="hover:text-violet-600 hover:underline" title={bl.urlFrom}>
                            {bl.urlFrom.replace(/^https?:\/\//, "").slice(0, 60)}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-500">{bl.rank ?? "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide ${bl.dofollow ? "text-emerald-600" : "text-gray-400"}`}>
                            {bl.dofollow ? "dofollow" : "nofollow"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Domain Analytics data panel */}
          {availability.domainAnalytics.available && rawDAData && (
            <section className="mb-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Domain Analytics</h2>
                <p className="text-xs text-gray-400 mt-0.5">DataForSEO Labs — organic visibility overview</p>
              </div>
              <div className="px-5 py-4 space-y-6">
                {/* Overview metrics */}
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
                      <div key={label} className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
                        <p className="text-lg font-extrabold text-gray-900">{value}</p>
                        <p className="text-[10px] font-medium text-gray-400 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                )}
                {rawDAData.overviewError && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                    Overview error: {rawDAData.overviewError}
                  </p>
                )}

                {/* Ranked keywords */}
                {rawDAData.rankedKeywords && rawDAData.rankedKeywords.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                      Top Ranking Keywords
                    </p>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <Th>Keyword</Th>
                            <Th center>Pos.</Th>
                            <Th center>Volume/mo</Th>
                            <Th center>CPC</Th>
                            <Th>Ranking URL</Th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {rawDAData.rankedKeywords.slice(0, 15).map((kw, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-800">{kw.keyword}</td>
                              <td className="px-3 py-2 text-center text-gray-600">{kw.position}</td>
                              <td className="px-3 py-2 text-center text-gray-500">{kw.searchVolume?.toLocaleString() ?? "—"}</td>
                              <td className="px-3 py-2 text-center text-gray-500">{kw.cpc != null ? `$${kw.cpc.toFixed(2)}` : "—"}</td>
                              <td className="px-3 py-2 text-gray-400 max-w-[200px] truncate">
                                <a href={kw.url} target="_blank" rel="noreferrer"
                                  className="hover:text-violet-600 hover:underline" title={kw.url}>
                                  {kw.url.replace(/^https?:\/\//, "").slice(0, 50)}
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Competitors */}
                {rawDAData.competitors && rawDAData.competitors.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                      Top Competitors
                    </p>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <Th>Domain</Th>
                            <Th center>Shared KWs</Th>
                            <Th center>Their Traffic</Th>
                            <Th center>Their KWs</Th>
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
            </section>
          )}

          {/* SERP Visibility data panel */}
          {availability.serpVisibility.available && rawSVData && (
            <section className="mb-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">SERP Visibility</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Brand search: &ldquo;{rawSVData.keyword}&rdquo;
                </p>
              </div>
              <div className="px-5 py-4 space-y-5">
                {rawSVData.serpError && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                    SERP error: {rawSVData.serpError}
                  </p>
                )}
                {/* Metrics row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
                    <p className={`text-2xl font-extrabold ${rawSVData.brandPosition === 1 ? "text-emerald-600" : rawSVData.brandPosition == null ? "text-red-600" : "text-amber-600"}`}>
                      {rawSVData.brandPosition ?? "N/F"}
                    </p>
                    <p className="text-[10px] font-medium text-gray-400 mt-0.5">Brand Position</p>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
                    <p className={`text-2xl font-extrabold ${rawSVData.hasAiOverview ? "text-emerald-600" : "text-gray-400"}`}>
                      {rawSVData.hasAiOverview ? "Yes" : "No"}
                    </p>
                    <p className="text-[10px] font-medium text-gray-400 mt-0.5">AI Overview</p>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
                    <p className={`text-2xl font-extrabold ${rawSVData.aiOverviewCitesDomain ? "text-emerald-600" : "text-gray-400"}`}>
                      {rawSVData.aiOverviewCitesDomain ? "Cited" : "—"}
                    </p>
                    <p className="text-[10px] font-medium text-gray-400 mt-0.5">AI Citation</p>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
                    <p className="text-2xl font-extrabold text-gray-900">
                      {rawSVData.serpFeatureTypes?.length ?? 0}
                    </p>
                    <p className="text-[10px] font-medium text-gray-400 mt-0.5">SERP Features</p>
                  </div>
                </div>

                {/* SERP feature tags */}
                {rawSVData.serpFeatureTypes && rawSVData.serpFeatureTypes.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                      SERP Features Present
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {rawSVData.serpFeatureTypes.map((f) => (
                        <span
                          key={f}
                          className="inline-block rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-600"
                        >
                          {f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top organic results */}
                {rawSVData.topOrganicResults && rawSVData.topOrganicResults.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                      Top 10 Organic Results for &ldquo;{rawSVData.keyword}&rdquo;
                    </p>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <Th center>#</Th>
                            <Th>Domain</Th>
                            <Th>Title</Th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {rawSVData.topOrganicResults.slice(0, 10).map((r, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-center text-gray-500 font-medium">{r.position}</td>
                              <td className="px-3 py-2 font-medium text-gray-800">{r.domain}</td>
                              <td className="px-3 py-2 text-gray-500 max-w-[300px] truncate">
                                <a href={r.url} target="_blank" rel="noreferrer"
                                  className="hover:text-violet-600 hover:underline" title={r.title}>
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

                {/* AI Overview sources */}
                {rawSVData.aiOverviewSources && rawSVData.aiOverviewSources.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                      AI Overview Sources
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {rawSVData.aiOverviewSources.map((s, i) => (
                        <span key={i} className="inline-block rounded border border-gray-200 bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700">
                          {s.domain}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </>
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

// ── Score card ────────────────────────────────────────────────────────────────
function ScoreCard({
  label,
  score,
  available,
  primary = false,
}: {
  label: string;
  score: number;
  available: boolean;
  primary?: boolean;
}) {
  if (!available) {
    return (
      <div className={`rounded-xl border p-4 ${primary ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200"}`}>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 leading-tight">{label}</p>
        <p className="mt-2 text-2xl font-bold text-gray-400">N/A</p>
        <p className="text-xs text-gray-400">Not available</p>
      </div>
    );
  }

  const color =
    score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : "text-red-600";

  return (
    <div className={`rounded-xl border p-4 ${primary ? "bg-violet-50 border-violet-100" : "bg-white border-gray-200"}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 leading-tight">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold ${color}`}>{score}</p>
      <p className="text-xs text-gray-400">/ 100</p>
    </div>
  );
}

// ── Issue bucket ──────────────────────────────────────────────────────────────
function IssueBucket({ label, count, tone }: { label: string; count: number; tone: "red" | "amber" | "gray" }) {
  const styles = {
    red: "bg-red-50 border-red-100 text-red-700",
    amber: "bg-amber-50 border-amber-100 text-amber-700",
    gray: "bg-gray-50 border-gray-100 text-gray-700",
  };
  return (
    <div className={`rounded-xl border p-4 ${styles[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{count}</p>
    </div>
  );
}

// ── Issue row ─────────────────────────────────────────────────────────────────
function IssueRow({ issue }: { issue: AuditIssue }) {
  const sevStyles: Record<AuditIssue["severity"], string> = {
    critical: "bg-red-50 text-red-700 border-red-100",
    warning:  "bg-amber-50 text-amber-700 border-amber-100",
    info:     "bg-gray-50 text-gray-600 border-gray-100",
  };
  const moduleLabel: Record<AuditIssue["module"], string> = {
    technical:       "Technical",
    onpage:          "On-Page",
    backlinks:       "Backlinks",
    localSeo:        "Local SEO",
    domainAnalytics: "Domain Analytics",
    serpVisibility:  "SERP Visibility",
    localPack:       "Local Pack",
    reputation:      "Reputation",
  };

  return (
    <li className="px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${sevStyles[issue.severity]}`}>
              {issue.severity}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
              {moduleLabel[issue.module]}
            </span>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-gray-900">{issue.title}</p>
          <p className="mt-1 text-sm text-gray-600">{issue.description}</p>
          <p className="mt-2 text-sm text-gray-700">
            <strong className="font-medium">Fix:</strong> {issue.recommendation}
          </p>
          {issue.docsUrl && (
            <a href={issue.docsUrl} target="_blank" rel="noreferrer"
              className="mt-1 inline-block text-xs font-medium text-violet-600 hover:text-violet-700">
              Reference docs &rarr;
            </a>
          )}
        </div>
      </div>
    </li>
  );
}
