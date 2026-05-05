import type { AuditIssue, AuditModuleResult, AuditRunResult } from "./types";
import type { ContentPlanWithMeta } from "./ai/content-plan";

/**
 * Self-contained HTML template for the PDF report.
 *
 * Why a separate template (instead of rendering the React /report page)?
 * The PDF generator runs in a serverless function and can't easily authenticate
 * Puppeteer to navigate to a /admin route. Instead we hand Puppeteer a single
 * fully-styled HTML string via `setContent()`. Inline CSS keeps the template
 * portable — no Tailwind compilation needed at PDF time.
 *
 * Unavailable modules are rendered as "Not available" with no reason —
 * clients shouldn't see backend config issues like missing API keys.
 */

export interface BuildReportHtmlOptions {
  clientName: string;
  url: string;
  auditDate: Date;
  result: AuditRunResult;
  positives?: {
    technical?: string[];
    onpage?: string[];
    backlinks?: string[];
    localSeo?: string[];
    domainAnalytics?: string[];
    serpVisibility?: string[];
    localPack?: string[];
    reputation?: string[];
  };
  /**
   * AI-generated Content Plan from /api/audits/:id/content-plan. When present,
   * replaces the rule-based 90-day roadmap section. Null/undefined means the
   * admin hasn't generated one yet — section is omitted entirely.
   */
  aiContentPlan?: ContentPlanWithMeta | null;
}

export function buildReportHtml(opts: BuildReportHtmlOptions): string {
  const { clientName, url, auditDate, result } = opts;
  const allPositives = [
    ...(result.technical.available       ? opts.positives?.technical       ?? [] : []),
    ...(result.onpage.available          ? opts.positives?.onpage          ?? [] : []),
    ...(result.backlinks.available       ? opts.positives?.backlinks       ?? [] : []),
    ...(result.localSeo.available        ? opts.positives?.localSeo        ?? [] : []),
    ...(result.domainAnalytics.available ? opts.positives?.domainAnalytics ?? [] : []),
    ...(result.serpVisibility.available  ? opts.positives?.serpVisibility  ?? [] : []),
    ...(result.localPack.available       ? opts.positives?.localPack       ?? [] : []),
    ...(result.reputation.available      ? opts.positives?.reputation      ?? [] : []),
  ];

  const critical = result.issues
    .filter((i) => i.severity === "critical")
    .slice(0, 5);

  const moduleSections: Array<{
    key: AuditIssue["module"];
    label: string;
    module: AuditModuleResult;
  }> = [
    { key: "technical",       label: "Technical SEO",     module: result.technical },
    { key: "onpage",          label: "On-Page",           module: result.onpage },
    { key: "backlinks",       label: "Backlinks",         module: result.backlinks },
    { key: "localSeo",        label: "Local SEO",         module: result.localSeo },
    { key: "domainAnalytics", label: "Domain Analytics",  module: result.domainAnalytics },
    { key: "serpVisibility",  label: "SERP Visibility",   module: result.serpVisibility },
    { key: "localPack",       label: "Local Pack",        module: result.localPack },
    { key: "reputation",      label: "Reputation",        module: result.reputation },
  ];

  const availableModules = moduleSections.filter((m) => m.module.available);
  const unavailableCount = moduleSections.length - availableModules.length;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>SEO Audit Report — ${escapeHtml(clientName)}</title>
  <style>
    ${baseCss()}
  </style>
</head>
<body>
  <article class="report">
    <!-- 1. Cover -->
    <header class="cover">
      <div class="brand">
        <span class="brand-name">macro<span class="accent">light</span></span>
        <span class="brand-meta">SEO Audit Report</span>
      </div>
      <h1 class="client-name">${escapeHtml(clientName)}</h1>
      <p class="client-url">${escapeHtml(url)}</p>
      <p class="audit-date">${formatDate(auditDate)}</p>
      <div class="overall-score">
        <p class="overall-label">Overall Score</p>
        ${
          result.overallScore == null
            ? `<p class="overall-na">Not available</p>`
            : `<p class="overall-value ${scoreClass(result.overallScore)}">
                 ${result.overallScore}<span class="overall-of">/100</span>
               </p>`
        }
        ${
          unavailableCount > 0 && result.overallScore != null
            ? `<p class="overall-note">Score reflects the ${availableModules.length} of ${moduleSections.length} audit categories with available data.</p>`
            : ""
        }
      </div>
    </header>

    ${renderAtAGlanceSection(result)}

    <!-- 2. Executive summary -->
    <section class="section avoid-break">
      <h2>Executive Summary</h2>
      <p class="summary-prose">${escapeHtml(
        summarize(
          result.overallScore,
          result.issues.length,
          critical.length,
          availableModules.length
        )
      )}</p>
      <div class="module-scores">
        ${moduleSections
          .map(
            (m) => `
          <div class="module-score">
            <p class="module-label">${m.label}</p>
            ${
              m.module.available
                ? `<p class="module-value ${scoreClass(m.module.score)}">${m.module.score}</p>`
                : `<p class="module-value-na">N/A</p>`
            }
          </div>`
          )
          .join("")}
      </div>
    </section>

    ${
      critical.length > 0
        ? `
    <!-- 3. Top critical issues -->
    <section class="section avoid-break">
      <h2>Top Critical Issues</h2>
      <ol class="critical-list">
        ${critical
          .map(
            (issue, i) => `
          <li class="critical-item">
            <p class="critical-title">${i + 1}. ${escapeHtml(issue.title)}</p>
            <p class="critical-desc">${escapeHtml(issue.description)}</p>
            <p class="critical-fix">
              <strong>Recommended fix:</strong> ${escapeHtml(issue.recommendation)}
            </p>
          </li>`
          )
          .join("")}
      </ol>
    </section>`
        : ""
    }

    <!-- 4. Module sections -->
    ${moduleSections
      .map((m) => {
        if (!m.module.available) {
          return `
      <section class="section module-section avoid-break">
        <div class="module-header">
          <h2>${m.label}</h2>
          <span class="module-header-na">Not available</span>
        </div>
        <p class="empty-state">This category was not analyzed in this audit.</p>
      </section>`;
        }

        // Dedupe: any critical issue already promoted into the "Top Critical
        // Issues" section above doesn't need to repeat verbatim down here.
        // The previous PDF showed LCP/FCP twice within two pages of each
        // other; this filter cleans that up.
        const topCriticalCheckIds = new Set(critical.map((i) => i.check));
        const moduleIssues = result.issues
          .filter((i) => i.module === m.key)
          .filter((i) => !topCriticalCheckIds.has(i.check));

        // Extra data tables rendered beneath each module's issue list.
        let extraHtml = "";

        if (m.key === "domainAnalytics") {
          const rawDA = result.domainAnalytics.rawData as {
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
          } | null;

          const ov = rawDA?.overview;
          const kws = rawDA?.rankedKeywords ?? [];
          const comps = rawDA?.competitors ?? [];

          if (ov) {
            extraHtml += `
            <div class="da-metrics">
              <div class="da-metric"><span class="da-val">${ov.organicEtv != null ? formatCompactNumber(ov.organicEtv) : "—"}</span><span class="da-lbl">Est. Monthly Visits</span></div>
              <div class="da-metric"><span class="da-val">${ov.organicCount != null ? formatCompactNumber(ov.organicCount) : "—"}</span><span class="da-lbl">Organic Keywords</span></div>
              <div class="da-metric"><span class="da-val">${ov.pos1to10 != null ? formatCompactNumber(ov.pos1to10) : "—"}</span><span class="da-lbl">Top 10 Rankings</span></div>
              <div class="da-metric"><span class="da-val">${ov.pos1 != null ? formatCompactNumber(ov.pos1) : "—"}</span><span class="da-lbl">#1 Rankings</span></div>
            </div>`;
          }

          if (kws.length > 0) {
            extraHtml += `
            <p class="bl-table-label">Top Ranking Keywords</p>
            <table class="bl-table">
              <thead><tr><th>Keyword</th><th>Pos.</th><th>Volume/mo</th><th>CPC</th></tr></thead>
              <tbody>${kws.slice(0, 10).map((kw) => `
                <tr>
                  <td class="bl-domain">${escapeHtml(kw.keyword)}</td>
                  <td class="bl-rank">${kw.position}</td>
                  <td class="bl-rank">${kw.searchVolume?.toLocaleString() ?? "—"}</td>
                  <td class="bl-rank">${kw.cpc != null ? `$${kw.cpc.toFixed(2)}` : "—"}</td>
                </tr>`).join("")}
              </tbody>
            </table>`;
          }

          if (comps.length > 0) {
            extraHtml += `
            <p class="bl-table-label">Top Competitors</p>
            <table class="bl-table">
              <thead><tr><th>Domain</th><th>Shared KWs</th><th>Their Traffic</th><th>Their KWs</th></tr></thead>
              <tbody>${comps.map((c) => `
                <tr>
                  <td class="bl-domain">${escapeHtml(c.domain)}</td>
                  <td class="bl-rank">${c.intersections != null ? formatCompactNumber(c.intersections) : "—"}</td>
                  <td class="bl-rank">${c.organicEtv != null ? formatCompactNumber(c.organicEtv) : "—"}</td>
                  <td class="bl-rank">${c.organicCount != null ? formatCompactNumber(c.organicCount) : "—"}</td>
                </tr>`).join("")}
              </tbody>
            </table>`;
          }
        }

        if (m.key === "serpVisibility") {
          const rawSV = result.serpVisibility.rawData as {
            keyword?: string;
            brandPosition?: number | null;
            serpFeatureTypes?: string[];
            hasAiOverview?: boolean;
            aiOverviewCitesDomain?: boolean;
            aiOverviewSources?: Array<{ domain: string; title: string }>;
            topOrganicResults?: Array<{ position: number; domain: string; title: string }>;
          } | null;

          if (rawSV) {
            const features = rawSV.serpFeatureTypes ?? [];
            const friendlyFeature = (f: string) =>
              f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

            extraHtml += `
            <div class="da-metrics">
              <div class="da-metric">
                <span class="da-val ${rawSV.brandPosition === 1 ? "score-good" : rawSV.brandPosition == null ? "score-poor" : "score-ok"}">
                  ${rawSV.brandPosition ?? "N/F"}
                </span>
                <span class="da-lbl">Brand Position</span>
              </div>
              <div class="da-metric">
                <span class="da-val ${rawSV.hasAiOverview ? "score-good" : "score-poor"}">${rawSV.hasAiOverview ? "Yes" : "No"}</span>
                <span class="da-lbl">AI Overview</span>
              </div>
              <div class="da-metric">
                <span class="da-val ${rawSV.aiOverviewCitesDomain ? "score-good" : "score-poor"}">${rawSV.aiOverviewCitesDomain ? "Yes" : "No"}</span>
                <span class="da-lbl">Cited in AI Overview</span>
              </div>
              <div class="da-metric">
                <span class="da-val">${features.length}</span>
                <span class="da-lbl">SERP Features</span>
              </div>
            </div>`;

            if (features.length > 0) {
              extraHtml += `
              <p class="bl-table-label">SERP Features Present</p>
              <p class="da-features">${features.map(friendlyFeature).map((f) => `<span class="da-feature-tag">${escapeHtml(f)}</span>`).join(" ")}</p>`;
            }

            const organic = rawSV.topOrganicResults ?? [];
            if (organic.length > 0) {
              // Take the top-10 ORGANIC results and renumber sequentially
              // (1..N). Showing the raw rank_absolute caused positions to
              // skip (1, 2, 4, 5, ...) because Google interleaves SERP
              // features into rank_absolute that we don't render in this
              // table — confusing for the reader.
              const topOrganic = organic
                .slice()
                .sort((a, b) => a.position - b.position)
                .slice(0, 10);
              extraHtml += `
              <p class="bl-table-label">Top 10 Organic Results for "${escapeHtml(rawSV.keyword ?? "")}"</p>
              <table class="bl-table">
                <thead><tr><th>#</th><th>Domain</th><th>Title</th></tr></thead>
                <tbody>${topOrganic.map((r, i) => `
                  <tr>
                    <td class="bl-rank">${i + 1}</td>
                    <td class="bl-domain">${escapeHtml(r.domain)}</td>
                    <td class="bl-anchor">${escapeHtml(r.title.slice(0, 60))}</td>
                  </tr>`).join("")}
                </tbody>
              </table>`;
            }
          }
        }

        if (m.key === "backlinks") {
          const rawBL = result.backlinks.rawData as {
            topBacklinks?: Array<{
              domainFrom: string;
              anchor: string;
              rank: number | null;
              dofollow: boolean;
              urlFrom: string;
            }>;
            topBacklinksError?: string;
          } | null;
          const bls = rawBL?.topBacklinks ?? [];
          // When the per-link enumeration endpoint is unavailable (most
          // commonly: account doesn't have the Backlinks subscription tier
          // that includes /backlinks/backlinks/live), simply omit the Top
          // Backlinks table from the report. We don't surface a "subscription
          // required" notice in the client-facing PDF — that's an internal
          // billing detail, not a finding about their site.
          if (bls.length > 0) {
            const rows = bls
              .slice(0, 20)
              .map(
                (bl) => `
              <tr>
                <td class="bl-domain">${escapeHtml(bl.domainFrom)}</td>
                <td class="bl-anchor">${escapeHtml(bl.anchor)}</td>
                <td class="bl-rank">${bl.rank ?? "—"}</td>
                <td class="bl-follow ${bl.dofollow ? "follow-do" : "follow-no"}">${bl.dofollow ? "dofollow" : "nofollow"}</td>
              </tr>`
              )
              .join("");
            extraHtml = `
            <p class="bl-table-label">Top Backlinks (by domain rank)</p>
            <table class="bl-table">
              <thead>
                <tr>
                  <th>Referring Domain</th>
                  <th>Anchor Text</th>
                  <th>Rank</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>`;
          }
        }

        return `
      <section class="section module-section avoid-break">
        <div class="module-header">
          <h2>${m.label}</h2>
          <span class="module-header-score ${scoreClass(m.module.score)}">
            ${m.module.score}<span class="of">/100</span>
          </span>
        </div>
        ${
          moduleIssues.length === 0
            ? `<p class="empty-state">No issues found in this category.</p>`
            : `
        <ul class="module-issues">
          ${moduleIssues
            .map(
              (issue) => `
            <li class="module-issue">
              <p class="issue-title">
                <span class="dot dot-${issue.severity}"></span>
                ${escapeHtml(issue.title)}
              </p>
              <p class="issue-fix">${escapeHtml(issue.recommendation)}</p>
            </li>`
            )
            .join("")}
        </ul>`
        }
        ${extraHtml}
      </section>`;
      })
      .join("")}

    ${renderLocalPackSection(result)}
    ${renderReputationSection(result)}
    ${renderCompetitivePositionSection(result)}
    ${renderTrendLinesSection(result)}
    ${renderCitationHealthSection(result)}
    ${renderLinkOpportunitiesSection(result)}

    ${
      allPositives.length > 0
        ? `
    <!-- 5. What's working -->
    <section class="section avoid-break">
      <h2>What's Working</h2>
      <ul class="positives">
        ${allPositives
          .map((p) => `<li><span class="check">✓</span>${escapeHtml(p)}</li>`)
          .join("")}
      </ul>
    </section>`
        : ""
    }

    ${renderContentPlanSection(opts.aiContentPlan ?? null)}

    <!-- 6. CTA -->
    ${renderCtaSection()}

    <footer class="footer">
      Generated by Macrolight Builders &middot; ${formatDate(auditDate)}
    </footer>
  </article>
</body>
</html>`;
}

/**
 * AI-generated Content Plan.
 *
 * Replaces the rule-based 90-day roadmap. Renders only when the admin has
 * generated a plan via /api/audits/:id/content-plan; absent otherwise.
 * The plan ships 5–10 specific page recommendations with titles, target
 * keywords, outlines, and reasoning grounded in the audit data.
 */
function renderContentPlanSection(plan: ContentPlanWithMeta | null): string {
  if (!plan) return "";

  const recommendations = plan.recommendations ?? [];
  if (recommendations.length === 0) return "";

  return `
    <section class="section content-plan">
      <h2>Recommended Content Plan</h2>
      <p class="section-lead">${escapeHtml(plan.strategySummary)}</p>
      <ol class="cp-list">
        ${recommendations
          .map(
            (rec, idx) => `
          <li class="cp-item avoid-break">
            <div class="cp-head">
              <span class="cp-num">${idx + 1}</span>
              <div class="cp-head-text">
                <p class="cp-title">${escapeHtml(rec.title)}</p>
                <div class="cp-chips">
                  <span class="cp-chip cp-chip-${rec.priority}">${escapeHtml(rec.priority.toUpperCase())}</span>
                  <span class="cp-chip cp-chip-type">${escapeHtml(formatRecType(rec.type))}</span>
                </div>
              </div>
            </div>
            <div class="cp-meta">
              <span class="cp-meta-item"><strong>Target keyword:</strong> ${escapeHtml(rec.targetKeyword)}</span>
              ${
                rec.searchVolumePerMonth != null
                  ? `<span class="cp-meta-item"><strong>Volume:</strong> ${rec.searchVolumePerMonth.toLocaleString()} / mo</span>`
                  : ""
              }
              ${
                rec.improvementTargetUrl
                  ? `<span class="cp-meta-item"><strong>Existing URL:</strong> <span class="cp-url">${escapeHtml(rec.improvementTargetUrl)}</span></span>`
                  : ""
              }
            </div>
            <p class="cp-reasoning">${escapeHtml(rec.reasoning)}</p>
            <div class="cp-outline">
              <p class="cp-outline-h">Outline</p>
              <ol class="cp-outline-list">
                ${rec.outline
                  .map((h) => `<li>${escapeHtml(h)}</li>`)
                  .join("")}
              </ol>
            </div>
            ${
              rec.internalLinkingNote
                ? `<p class="cp-link-note"><strong>Internal linking:</strong> ${escapeHtml(rec.internalLinkingNote)}</p>`
                : ""
            }
          </li>`
          )
          .join("")}
      </ol>
    </section>`;
}

function formatRecType(t: ContentPlanWithMeta["recommendations"][number]["type"]): string {
  switch (t) {
    case "blog_post":    return "Blog Post";
    case "service_page": return "Service Page";
    case "landing_page": return "Landing Page";
    case "improvement":  return "Existing-Page Upgrade";
  }
}
/**
 * Render the closing CTA section. Reads MACROLIGHT_CONTACT_EMAIL,
 * MACROLIGHT_CONTACT_URL, MACROLIGHT_CONTACT_PHONE from env so the report
 * surfaces real contact details. All three are optional — if all are unset,
 * we fall back to the original "reply to this email" copy.
 */
function renderCtaSection(): string {
  const email = process.env.MACROLIGHT_CONTACT_EMAIL?.trim();
  const url = process.env.MACROLIGHT_CONTACT_URL?.trim();
  const phone = process.env.MACROLIGHT_CONTACT_PHONE?.trim();

  const contactBits: string[] = [];
  if (url) {
    contactBits.push(
      `<a class="cta-link" href="${escapeHtml(url)}">${escapeHtml(url.replace(/^https?:\/\//, ""))}</a>`
    );
  }
  if (email) {
    contactBits.push(
      `<a class="cta-link" href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`
    );
  }
  if (phone) {
    contactBits.push(
      `<a class="cta-link" href="tel:${escapeHtml(phone.replace(/[^\d+]/g, ""))}">${escapeHtml(phone)}</a>`
    );
  }

  const contactRow = contactBits.length > 0
    ? `<p class="cta-contact">${contactBits.join(" &nbsp;·&nbsp; ")}</p>`
    : "";

  return `
    <section class="section cta avoid-break">
      <h2>Want Macrolight Builders to fix these?</h2>
      <p>
        We rebuild sites with SEO baked in from day one. Most of the issues
        flagged in this report are fixed automatically by the way we build —
        no plugin chasing, no patchwork. Get in touch and we'll walk you
        through what we'd prioritise first.
      </p>
      ${contactRow}
    </section>`;
}

/**
 * At-a-Glance Snapshot — four tiles immediately under the cover that give a
 * 5-second read of the most pitch-relevant numbers in the audit. Each tile
 * gracefully shows "—" when its source data is unavailable.
 */
function renderAtAGlanceSection(result: AuditRunResult): string {
  // Estimated monthly visits — from Domain Analytics overview.
  const da = result.domainAnalytics.rawData as
    | { overview?: { organicEtv?: number | null } }
    | null;
  const etv = da?.overview?.organicEtv;
  const visits =
    result.domainAnalytics.available && typeof etv === "number" && etv >= 1
      ? formatCompactNumber(etv)
      : null;

  // Local-pack visibility — from Local Pack module rawData.
  const lp = result.localPack.rawData as
    | { packVisibility?: number; queriesAttempted?: number }
    | null;
  const packVis =
    result.localPack.available && lp && typeof lp.packVisibility === "number"
      ? `${Math.round(lp.packVisibility * 100)}%`
      : null;

  // Aggregate review rating — from Reputation module rawData.
  const rep = result.reputation.rawData as
    | { aggregateRating?: number | null }
    | null;
  const rating =
    result.reputation.available &&
    rep &&
    typeof rep.aggregateRating === "number"
      ? `${rep.aggregateRating.toFixed(1)}★`
      : null;

  // Backlink-gap opportunity count.
  const bl = result.backlinks.rawData as
    | { backlinkGap?: Array<unknown> }
    | null;
  const gapCount =
    result.backlinks.available && Array.isArray(bl?.backlinkGap)
      ? bl!.backlinkGap.length
      : null;

  // Render the section even when most tiles are "—" — it still anchors the
  // top of the report and shows the reader what's coming. Only suppress
  // entirely if literally nothing is populated.
  if (visits == null && packVis == null && rating == null && gapCount == null) {
    return "";
  }

  const tile = (label: string, value: string | null, accent?: "good" | "warn" | "bad"): string => `
    <div class="snapshot-tile">
      <p class="snapshot-label">${label}</p>
      <p class="snapshot-value ${value == null ? "snapshot-empty" : accent ? `snapshot-${accent}` : ""}">${value ?? "—"}</p>
    </div>`;

  // Light contextual coloring on a couple of tiles so the report doesn't
  // feel monotone.
  const packAccent: "good" | "warn" | "bad" | undefined =
    lp?.packVisibility == null
      ? undefined
      : lp.packVisibility >= 0.6
      ? "good"
      : lp.packVisibility >= 0.2
      ? "warn"
      : "bad";
  const ratingAccent: "good" | "warn" | "bad" | undefined =
    rep?.aggregateRating == null
      ? undefined
      : rep.aggregateRating >= 4.5
      ? "good"
      : rep.aggregateRating >= 3.5
      ? "warn"
      : "bad";

  return `
    <section class="section avoid-break snapshot-section">
      <p class="snapshot-section-label">At a Glance</p>
      <div class="snapshot-grid">
        ${tile("Est. monthly visits", visits)}
        ${tile("Local-pack visibility", packVis, packAccent)}
        ${tile("Aggregate rating", rating, ratingAccent)}
        ${tile("Link opportunities", gapCount != null ? String(gapCount) : null)}
      </div>
    </section>`;
}

/* ── New PDF sections (M6–M9) ───────────────────────────────────────────── */

interface LocalPackQueryRow {
  query: string;
  brandPosition: number | null;
  inLocalPack: boolean;
  topThreeCompetitors: Array<{ position: number; name: string; rating: number | null; reviewCount: number | null }>;
  error?: string;
}
interface LocalPackRaw {
  queries?: LocalPackQueryRow[];
  packVisibility?: number;
  queriesAttempted?: number;
  queriesInPack?: number;
}

function renderLocalPackSection(result: AuditRunResult): string {
  if (!result.localPack.available) return "";
  const raw = result.localPack.rawData as LocalPackRaw | null;
  const queries = raw?.queries ?? [];
  if (queries.length === 0) return "";
  const visibility = Math.round(((raw?.packVisibility ?? 0) * 100));

  return `
    <section class="section avoid-break">
      <h2>Where You Show Up (and Don't)</h2>
      <p class="section-lead">
        ${visibility}% local-pack visibility across ${queries.length} core service queries.
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th>Search Query</th>
            <th>Position</th>
            <th>Top 3 in the Pack</th>
          </tr>
        </thead>
        <tbody>
          ${queries
            .map((q) => {
              const positionCell = q.error
                ? `<span class="pos-error">—</span>`
                : q.brandPosition === null
                ? `<span class="pos-miss">Not in top 20</span>`
                : q.inLocalPack
                ? `<span class="pos-pack">#${q.brandPosition} (in pack)</span>`
                : `<span class="pos-far">#${q.brandPosition}</span>`;
              const top = q.topThreeCompetitors
                .map(
                  (c) =>
                    `${c.position}. ${escapeHtml(c.name)}${c.rating != null ? ` (${c.rating.toFixed(1)}★)` : ""}`
                )
                .join("<br/>");
              return `
                <tr>
                  <td>${escapeHtml(q.query)}</td>
                  <td>${positionCell}</td>
                  <td class="comp-cell">${top || "—"}</td>
                </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </section>`;
}

interface PlatformReviewSummaryRow {
  platform: string;
  status: string;
  avgRating: number | null;
  totalReviews: number | null;
  recentNegative: number;
}
interface ReputationRaw {
  google?: PlatformReviewSummaryRow;
  yelp?: PlatformReviewSummaryRow;
  trustpilot?: PlatformReviewSummaryRow;
  aggregateRating?: number | null;
  totalRecentNegative?: number;
}

function renderReputationSection(result: AuditRunResult): string {
  if (!result.reputation.available) return "";
  const raw = result.reputation.rawData as ReputationRaw | null;
  if (!raw) return "";
  const platforms = [raw.google, raw.yelp, raw.trustpilot].filter(
    (p): p is PlatformReviewSummaryRow => !!p
  );

  return `
    <section class="section avoid-break">
      <h2>Reputation Snapshot</h2>
      ${
        raw.aggregateRating != null
          ? `<p class="section-lead">Aggregate ${raw.aggregateRating.toFixed(1)}★ across ${platforms
              .map((p) => p.totalReviews ?? 0)
              .reduce((a, b) => a + b, 0)
              .toLocaleString()} reviews.</p>`
          : ""
      }
      <div class="rep-tiles">
        ${platforms
          .map(
            (p) => `
          <div class="rep-tile">
            <p class="rep-platform">${platformLabel(p.platform)}</p>
            ${
              p.status === "ok" && p.avgRating != null
                ? `<p class="rep-rating">${p.avgRating.toFixed(1)}<span class="rep-star">★</span></p>
                   <p class="rep-count">${(p.totalReviews ?? 0).toLocaleString()} reviews</p>
                   ${p.recentNegative > 0 ? `<p class="rep-warn">${p.recentNegative} negative in last 90d</p>` : ""}`
                : `<p class="rep-na">No listing found</p>`
            }
          </div>`
          )
          .join("")}
      </div>
    </section>`;
}

function platformLabel(p: string): string {
  if (p === "google") return "Google";
  if (p === "yelp") return "Yelp";
  if (p === "trustpilot") return "Trustpilot";
  return p;
}

interface KeywordGapRow {
  keyword: string;
  searchVolume: number | null;
  competitorWithBest: string;
}
interface BacklinkGapRow {
  referringDomain: string;
  rank: number | null;
}

function renderCompetitivePositionSection(result: AuditRunResult): string {
  const da = result.domainAnalytics.rawData as
    | { keywordGap?: KeywordGapRow[] }
    | null;
  const bl = result.backlinks.rawData as
    | { backlinkGap?: BacklinkGapRow[] }
    | null;
  const keywords = da?.keywordGap ?? [];
  const links = bl?.backlinkGap ?? [];

  if (keywords.length === 0 && links.length === 0) return "";

  const kwRows = keywords.slice(0, 10);
  const blRows = links.slice(0, 10);

  return `
    <section class="section avoid-break">
      <h2>Competitive Position</h2>
      <div class="comp-grid">
        <div class="comp-col">
          <p class="comp-col-h">Keywords competitors rank for that you don't</p>
          ${
            kwRows.length === 0
              ? `<p class="empty-state">No data available.</p>`
              : `<ul class="comp-list">
                   ${kwRows
                     .map(
                       (k) => `
                     <li class="comp-item">
                       <span class="comp-kw">${escapeHtml(k.keyword)}</span>
                       <span class="comp-meta">${k.searchVolume?.toLocaleString() ?? "—"} / mo</span>
                     </li>`
                     )
                     .join("")}
                 </ul>`
          }
        </div>
        <div class="comp-col">
          <p class="comp-col-h">Sites linking to competitors that don't link to you</p>
          ${
            blRows.length === 0
              ? `<p class="empty-state">No data available.</p>`
              : `<ul class="comp-list">
                   ${blRows
                     .map(
                       (l) => `
                     <li class="comp-item">
                       <span class="comp-kw">${escapeHtml(l.referringDomain)}</span>
                       <span class="comp-meta">${l.rank != null ? `rank ${l.rank}` : "—"}</span>
                     </li>`
                     )
                     .join("")}
                 </ul>`
          }
        </div>
      </div>
    </section>`;
}

interface TrendPoint {
  month: string;
  value: number | null;
}

function renderTrendLinesSection(result: AuditRunResult): string {
  const da = result.domainAnalytics.rawData as
    | { historicalTraffic?: Array<{ month: string; organicEtv: number | null }> }
    | null;
  const bl = result.backlinks.rawData as
    | { backlinkHistory?: Array<{ month: string; referringDomains: number | null }> }
    | null;

  const trafficPoints: TrendPoint[] =
    da?.historicalTraffic?.map((p) => ({ month: p.month, value: p.organicEtv })) ?? [];
  const rdPoints: TrendPoint[] =
    bl?.backlinkHistory?.map((p) => ({ month: p.month, value: p.referringDomains })) ?? [];

  // Hide the trend section entirely when there isn't a meaningful signal in
  // either series. "Meaningful" = at least one point above a per-metric
  // measurement floor: 1 visit/month for traffic, 1 RD for backlinks. Below
  // those, the sparkline visualises noise as if it were growth ("0.105 →
  // 0.693" looked like a real trend in the previous PDF).
  const trafficHasSignal = trafficPoints.some(
    (p) => typeof p.value === "number" && p.value >= 1
  );
  const rdHasSignal = rdPoints.some(
    (p) => typeof p.value === "number" && p.value >= 1
  );

  if (!trafficHasSignal && !rdHasSignal) return "";

  return `
    <section class="section avoid-break">
      <h2>12-Month Trend Lines</h2>
      <div class="trend-grid">
        ${
          trafficHasSignal
            ? `<div class="trend-col">
                 <p class="trend-h">Estimated organic traffic (visits / mo)</p>
                 ${renderSparkline(trafficPoints, "integer")}
                 <p class="trend-meta">${trafficPoints[0].month} → ${trafficPoints[trafficPoints.length - 1].month}</p>
               </div>`
            : trafficPoints.length > 0
            ? `<div class="trend-col">
                 <p class="trend-h">Estimated organic traffic</p>
                 <p class="empty-state">Below measurement threshold (&lt; 1 visit / month).</p>
               </div>`
            : ""
        }
        ${
          rdHasSignal
            ? `<div class="trend-col">
                 <p class="trend-h">Referring domains</p>
                 ${renderSparkline(rdPoints, "integer")}
                 <p class="trend-meta">${rdPoints[0].month} → ${rdPoints[rdPoints.length - 1].month}</p>
               </div>`
            : rdPoints.length > 0
            ? `<div class="trend-col">
                 <p class="trend-h">Referring domains</p>
                 <p class="empty-state">No referring-domain history recorded.</p>
               </div>`
            : ""
        }
      </div>
    </section>`;
}

/**
 * Hand-rolled inline-SVG sparkline. No external deps — keeps the PDF
 * generator self-contained.
 *
 * `format`:
 *   - "integer" → labels as 0, 1, 12, 1.2k (no decimals on small numbers)
 *   - "decimal" → labels as 0.10, 0.69 (legacy)
 */
function renderSparkline(
  points: TrendPoint[],
  format: "integer" | "decimal" = "decimal"
): string {
  const W = 280;
  const H = 80;
  const pad = 10;
  const labelGutter = 14; // reserve vertical space at the bottom for labels

  const values = points
    .map((p) => p.value)
    .filter((v): v is number => typeof v === "number");
  if (values.length < 2) return `<p class="empty-state">Insufficient data.</p>`;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);

  const xStep = (W - pad * 2) / (points.length - 1);
  // Plot inside the area above the labelGutter so values and labels never
  // overlap (the previous version drew the path through the labels).
  const plotBottom = H - labelGutter;
  const plotTop = pad;
  const path = points
    .map((p, i) => {
      const x = pad + i * xStep;
      const y =
        p.value == null
          ? plotBottom
          : plotBottom - ((p.value - min) / range) * (plotBottom - plotTop);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const last = values[values.length - 1];
  const first = values[0];
  const trendColor =
    last > first ? "#059669" : last < first ? "#dc2626" : "#6b7280";

  const fmt = (n: number): string => {
    if (format === "integer") return formatCompactNumber(n);
    return n.toLocaleString();
  };

  return `
    <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" class="sparkline">
      <path d="${path}" fill="none" stroke="${trendColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="${pad}" y="${H - 2}" font-size="9" fill="#9ca3af">${fmt(first)}</text>
      <text x="${W - pad}" y="${H - 2}" font-size="9" fill="#9ca3af" text-anchor="end">${fmt(last)}</text>
    </svg>`;
}

interface CitationRow {
  source: string;
  listed: boolean;
  napMatch: boolean;
  mismatchFields: string[];
}

function renderCitationHealthSection(result: AuditRunResult): string {
  if (!result.localSeo.available) return "";
  const raw = result.localSeo.rawData as { citations?: CitationRow[] } | null;
  const citations = raw?.citations ?? [];
  if (citations.length === 0) return "";

  return `
    <section class="section avoid-break">
      <h2>Citation Health</h2>
      <p class="section-lead">
        NAP consistency across major business directories.
      </p>
      <table class="data-table">
        <thead>
          <tr><th>Directory</th><th>Listed</th><th>NAP Match</th></tr>
        </thead>
        <tbody>
          ${citations
            .map((c) => {
              const listedCell = c.listed
                ? `<span class="ok">Yes</span>`
                : `<span class="muted">Not listed</span>`;
              const napCell = !c.listed
                ? `<span class="muted">—</span>`
                : c.napMatch
                ? `<span class="ok">Match</span>`
                : `<span class="warn">Mismatch (${c.mismatchFields.join(", ")})</span>`;
              return `<tr><td>${escapeHtml(c.source)}</td><td>${listedCell}</td><td>${napCell}</td></tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </section>`;
}

interface BacklinkGapRowFull {
  referringDomain: string;
  rank: number | null;
  examplePageUrl: string | null;
  refDomainEtv: number | null;
}

function renderLinkOpportunitiesSection(result: AuditRunResult): string {
  const raw = result.backlinks.rawData as
    | { backlinkGap?: BacklinkGapRowFull[] }
    | null;
  const rows = (raw?.backlinkGap ?? []).slice(0, 10);
  if (rows.length === 0) return "";

  return `
    <section class="section avoid-break">
      <h2>Link Opportunities</h2>
      <p class="section-lead">
        Sites linking to your competitors that aren't linking to you yet —
        ordered by domain authority. Each row is a concrete outreach target.
      </p>
      <table class="data-table">
        <thead>
          <tr><th>Domain</th><th>Rank</th><th>Example Page</th></tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (r) => `
            <tr>
              <td>${escapeHtml(r.referringDomain)}</td>
              <td>${r.rank ?? "—"}</td>
              <td class="comp-cell">${
                r.examplePageUrl
                  ? escapeHtml(truncate(r.examplePageUrl, 60))
                  : "—"
              }</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </section>`;
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function scoreClass(score: number): string {
  if (score >= 80) return "score-good";
  if (score >= 60) return "score-ok";
  return "score-poor";
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

  // Grade should reflect both the score AND the critical-issue count. A site
  // with a score of 87 but 5 criticals isn't "in good shape" — it has serious
  // problems being arithmetically masked by an over-generous deduction model.
  // Floor the grade by criticalCount: 1 critical caps it at "workable", 3+
  // caps at "underperforming".
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

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a number compactly with k / M / B suffixes. Used by the sparkline
 * labels and the At-a-Glance "Est. monthly visits" tile.
 *
 * 850 → "850"
 * 12,500 → "12.5k"
 * 2,400,000 → "2.4M"
 * 2,400,000,000 → "2.4B"
 */
function formatCompactNumber(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return Math.round(n).toLocaleString();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Inline stylesheet — sized for A4 / Letter at 96dpi. Page-break hints help
 * Puppeteer's PDF engine avoid splitting cards/sections across pages.
 */
function baseCss(): string {
  return `
    @page { size: A4; margin: 18mm 18mm 22mm 18mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                   "Helvetica Neue", Arial, sans-serif;
      color: #111827;
      margin: 0;
      padding: 0;
      font-size: 11pt;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .report { max-width: 100%; }
    h1 { font-size: 32pt; font-weight: 800; margin: 0 0 4pt 0; letter-spacing: -0.02em; }
    h2 {
      font-size: 14pt;
      font-weight: 700;
      margin: 0 0 8pt 0;
      padding-bottom: 4pt;
      border-bottom: 1px solid #e5e7eb;
    }
    p { margin: 4pt 0; }
    .accent { color: #7c3aed; }
    .avoid-break { page-break-inside: avoid; }

    /* Cover */
    .cover { padding-bottom: 18pt; border-bottom: 1px solid #e5e7eb; margin-bottom: 18pt; }
    .brand { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30pt; }
    .brand-name { font-size: 16pt; font-weight: 800; letter-spacing: -0.02em; }
    .brand-meta { font-size: 9pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #9ca3af; }
    .client-name { color: #111827; }
    .client-url { color: #4b5563; font-size: 12pt; word-break: break-all; }
    .audit-date { color: #9ca3af; font-size: 10pt; margin-top: 2pt; }
    .overall-score { margin-top: 24pt; }
    .overall-label { font-size: 9pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin: 0; }
    .overall-value { font-size: 56pt; font-weight: 800; margin: 4pt 0 0 0; line-height: 1; }
    .overall-of { font-size: 14pt; color: #9ca3af; margin-left: 4pt; }
    .overall-na { font-size: 28pt; font-weight: 700; color: #6b7280; margin: 4pt 0 0 0; }
    .overall-note { font-size: 9pt; color: #6b7280; margin-top: 6pt; font-style: italic; }

    /* Sections */
    .section { margin-bottom: 18pt; }
    .summary-prose { font-size: 10.5pt; color: #374151; }
    /* 4-column grid wraps to 2 rows for 8 modules — labels no longer
       wrap to 3 lines like they did when this was a single flex row. */
    .module-scores {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6pt;
      margin-top: 14pt;
    }
    .module-score {
      border: 1px solid #e5e7eb;
      border-radius: 6pt;
      padding: 7pt 6pt;
      text-align: center;
      min-height: 58pt;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .module-label {
      font-size: 7.5pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #9ca3af;
      margin: 0;
      line-height: 1.2;
    }
    .module-value { font-size: 20pt; font-weight: 800; margin: 3pt 0 0 0; line-height: 1; }
    .module-value-na { font-size: 12pt; font-weight: 700; color: #9ca3af; margin: 6pt 0 0 0; }

    /* Score colors */
    .score-good { color: #059669; }
    .score-ok   { color: #d97706; }
    .score-poor { color: #dc2626; }

    /* Critical issues */
    .critical-list { padding-left: 0; list-style: none; margin: 0; }
    .critical-item {
      border-left: 3pt solid #dc2626;
      background: #fef2f2;
      padding: 8pt 12pt;
      margin-bottom: 8pt;
      border-radius: 0 4pt 4pt 0;
    }
    .critical-title { font-size: 11pt; font-weight: 700; margin: 0 0 4pt 0; }
    .critical-desc { font-size: 10pt; color: #374151; margin: 0 0 4pt 0; }
    .critical-fix { font-size: 10pt; color: #111827; margin: 0; }

    /* Module sections */
    .module-section { margin-bottom: 14pt; }
    .module-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4pt;
      margin-bottom: 8pt;
    }
    .module-header h2 { border: none; padding: 0; margin: 0; }
    .module-header-score { font-size: 18pt; font-weight: 800; }
    .module-header-score .of { font-size: 10pt; color: #9ca3af; margin-left: 2pt; }
    .module-header-na { font-size: 11pt; font-weight: 600; color: #9ca3af; }
    .module-issues { padding-left: 0; list-style: none; margin: 0; }
    .module-issue { margin-bottom: 8pt; font-size: 10pt; }
    .issue-title { font-weight: 600; margin: 0; }
    .issue-fix { color: #4b5563; margin: 2pt 0 0 14pt; font-size: 9.5pt; }
    .empty-state { color: #9ca3af; font-style: italic; font-size: 10pt; }

    .dot {
      display: inline-block;
      width: 7pt;
      height: 7pt;
      border-radius: 50%;
      margin-right: 6pt;
      vertical-align: middle;
    }
    .dot-critical { background: #dc2626; }
    .dot-warning  { background: #d97706; }
    .dot-info     { background: #9ca3af; }

    /* Backlinks table */
    .bl-error { font-size: 9pt; color: #b45309; background: #fffbeb; border: 1px solid #fde68a; border-radius: 4pt; padding: 5pt 8pt; margin-top: 8pt; }
    .bl-table-label { font-size: 9pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin: 10pt 0 4pt 0; }
    .bl-table { width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 4pt; }
    .bl-table th {
      background: #f3f4f6;
      text-align: left;
      padding: 4pt 6pt;
      font-size: 8pt;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      border-bottom: 1px solid #e5e7eb;
    }
    .bl-table td { padding: 3.5pt 6pt; border-bottom: 1px solid #f3f4f6; color: #374151; vertical-align: top; }
    .bl-table tr:last-child td { border-bottom: none; }
    .bl-domain { font-weight: 500; color: #1f2937; max-width: 160pt; word-break: break-all; }
    .bl-anchor { color: #4b5563; max-width: 120pt; word-break: break-word; font-style: italic; }
    .bl-rank { text-align: center; color: #6b7280; min-width: 30pt; }
    .bl-follow { text-align: center; min-width: 50pt; font-size: 7.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .follow-do { color: #059669; }
    .follow-no { color: #9ca3af; }

    /* Domain analytics / SERP visibility metric grids */
    .da-metrics { display: flex; gap: 8pt; margin: 10pt 0 6pt 0; flex-wrap: wrap; }
    .da-metric {
      flex: 1;
      min-width: 60pt;
      border: 1px solid #e5e7eb;
      border-radius: 5pt;
      padding: 6pt 8pt;
      text-align: center;
    }
    .da-val { display: block; font-size: 18pt; font-weight: 800; color: #111827; line-height: 1.1; }
    .da-lbl { display: block; font-size: 7pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-top: 2pt; }
    .da-features { margin: 4pt 0 8pt 0; }
    .da-feature-tag {
      display: inline-block;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 3pt;
      padding: 2pt 5pt;
      font-size: 7.5pt;
      font-weight: 600;
      color: #374151;
      margin: 2pt 3pt 2pt 0;
    }

    /* At-a-Glance snapshot tiles (right under the cover) */
    .snapshot-section { margin-top: 0; margin-bottom: 14pt; }
    .snapshot-section-label {
      font-size: 9pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #9ca3af;
      margin: 0 0 6pt 0;
    }
    .snapshot-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8pt;
    }
    .snapshot-tile {
      border: 1px solid #e5e7eb;
      border-radius: 6pt;
      padding: 9pt 10pt;
    }
    .snapshot-label {
      font-size: 8pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #6b7280;
      margin: 0 0 3pt 0;
    }
    .snapshot-value {
      font-size: 22pt;
      font-weight: 800;
      margin: 0;
      line-height: 1;
      color: #111827;
    }
    .snapshot-empty { color: #d1d5db; font-weight: 700; }
    .snapshot-good  { color: #059669; }
    .snapshot-warn  { color: #d97706; }
    .snapshot-bad   { color: #dc2626; }

    /* ── M6–M9 sections ───────────────────────────────────────────────── */
    .section-lead { font-size: 10pt; color: #4b5563; margin: 0 0 8pt 0; }

    /* Generic data table used by Local Pack, Citations, Link Opportunities */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      margin-top: 6pt;
    }
    .data-table th {
      text-align: left;
      padding: 5pt 6pt;
      font-size: 8pt;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      border-bottom: 1px solid #e5e7eb;
    }
    .data-table td { padding: 5pt 6pt; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
    .data-table tr:last-child td { border-bottom: none; }
    .comp-cell { color: #6b7280; max-width: 220pt; word-break: break-word; }
    .pos-pack { color: #059669; font-weight: 600; }
    .pos-far { color: #d97706; font-weight: 600; }
    .pos-miss { color: #dc2626; font-weight: 600; }
    .pos-error { color: #9ca3af; }
    .ok { color: #059669; font-weight: 600; }
    .warn { color: #d97706; font-weight: 600; }
    .muted { color: #9ca3af; }

    /* Reputation tiles */
    .rep-tiles { display: flex; gap: 8pt; margin-top: 8pt; }
    .rep-tile {
      flex: 1;
      border: 1px solid #e5e7eb;
      border-radius: 6pt;
      padding: 10pt;
      text-align: center;
    }
    .rep-platform {
      font-size: 9pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6b7280;
      margin: 0 0 6pt 0;
    }
    .rep-rating { font-size: 28pt; font-weight: 800; margin: 0; line-height: 1; color: #111827; }
    .rep-star { font-size: 14pt; color: #f59e0b; margin-left: 2pt; }
    .rep-count { font-size: 9pt; color: #9ca3af; margin: 4pt 0 0 0; }
    .rep-warn { font-size: 9pt; color: #d97706; font-weight: 600; margin: 4pt 0 0 0; }
    .rep-na { font-size: 11pt; color: #9ca3af; font-style: italic; margin: 14pt 0 0 0; }

    /* Competitive position 2-column layout */
    .comp-grid { display: flex; gap: 12pt; }
    .comp-col { flex: 1; }
    .comp-col-h {
      font-size: 9pt;
      font-weight: 600;
      color: #4b5563;
      margin: 0 0 6pt 0;
    }
    .comp-list { padding-left: 0; list-style: none; margin: 0; }
    .comp-item {
      display: flex;
      justify-content: space-between;
      gap: 8pt;
      padding: 4pt 0;
      border-bottom: 1px solid #f3f4f6;
      font-size: 9pt;
    }
    .comp-item:last-child { border-bottom: none; }
    .comp-kw { color: #1f2937; word-break: break-word; max-width: 70%; }
    .comp-meta { color: #9ca3af; white-space: nowrap; }

    /* Trend lines */
    .trend-grid { display: flex; gap: 14pt; margin-top: 8pt; }
    .trend-col { flex: 1; }
    .trend-h {
      font-size: 9pt;
      font-weight: 600;
      color: #4b5563;
      margin: 0 0 4pt 0;
    }
    .trend-meta {
      font-size: 8pt;
      color: #9ca3af;
      margin: 4pt 0 0 0;
      text-align: center;
    }
    .sparkline { width: 100%; height: 60pt; }

    /* Positives */
    .positives { padding-left: 0; list-style: none; margin: 0; }
    .positives li { font-size: 10pt; color: #374151; margin-bottom: 4pt; }
    .check { color: #059669; font-weight: 700; margin-right: 6pt; }

    /* AI-generated Content Plan */
    .content-plan { margin-top: 6pt; }
    .cp-list { padding-left: 0; list-style: none; margin: 0; }
    .cp-item {
      margin-bottom: 12pt;
      padding: 10pt 12pt;
      border: 1px solid #e5e7eb;
      border-radius: 6pt;
    }
    .cp-head {
      display: flex;
      align-items: flex-start;
      gap: 10pt;
      margin-bottom: 6pt;
    }
    .cp-num {
      flex-shrink: 0;
      width: 20pt;
      height: 20pt;
      border-radius: 50%;
      background: #ede9fe;
      color: #5b21b6;
      font-weight: 800;
      font-size: 11pt;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
    .cp-head-text {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8pt;
      flex-wrap: wrap;
    }
    .cp-title {
      font-size: 11pt;
      font-weight: 700;
      color: #111827;
      margin: 0;
      flex: 1;
      min-width: 60%;
    }
    .cp-chips { display: flex; gap: 4pt; flex-shrink: 0; }
    .cp-chip {
      display: inline-block;
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 2pt 5pt;
      border-radius: 3pt;
      border: 1px solid;
    }
    .cp-chip-high   { color: #b91c1c; background: #fef2f2; border-color: #fecaca; }
    .cp-chip-medium { color: #b45309; background: #fffbeb; border-color: #fde68a; }
    .cp-chip-low    { color: #4b5563; background: #f3f4f6; border-color: #e5e7eb; }
    .cp-chip-type   { color: #5b21b6; background: #f5f3ff; border-color: #ddd6fe; }
    .cp-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8pt 14pt;
      font-size: 9pt;
      color: #4b5563;
      margin: 4pt 0 8pt 30pt;
    }
    .cp-meta-item strong { font-weight: 600; color: #374151; margin-right: 3pt; }
    .cp-url { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 8.5pt; color: #6b7280; }
    .cp-reasoning {
      font-size: 10pt;
      color: #374151;
      margin: 0 0 8pt 30pt;
      line-height: 1.5;
    }
    .cp-outline {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 4pt;
      padding: 6pt 10pt;
      margin-left: 30pt;
    }
    .cp-outline-h {
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #6b7280;
      margin: 0 0 3pt 0;
    }
    .cp-outline-list {
      padding-left: 14pt;
      margin: 0;
      list-style: decimal;
    }
    .cp-outline-list li { font-size: 9.5pt; color: #374151; margin-bottom: 1pt; }
    .cp-link-note {
      margin: 6pt 0 0 30pt;
      font-size: 9pt;
      color: #6b7280;
    }
    .cp-link-note strong { font-weight: 600; color: #4b5563; }

    /* CTA */
    .cta {
      background: #f5f3ff;
      border: 1px solid #ede9fe;
      border-radius: 8pt;
      padding: 14pt 16pt;
      margin-top: 18pt;
    }
    .cta h2 { color: #5b21b6; border: none; padding: 0; margin: 0 0 6pt 0; }
    .cta p { color: #4c1d95; font-size: 10pt; margin: 0; }
    .cta-contact {
      margin-top: 8pt !important;
      padding-top: 8pt;
      border-top: 1px solid #ddd6fe;
      font-size: 10pt;
      font-weight: 600;
      color: #5b21b6;
    }
    .cta-link { color: #5b21b6; text-decoration: none; border-bottom: 1px solid currentColor; }

    .footer {
      margin-top: 18pt;
      padding-top: 8pt;
      border-top: 1px solid #f3f4f6;
      text-align: center;
      font-size: 8pt;
      color: #9ca3af;
    }
  `;
}
