/**
 * AI-generated Content Plan.
 *
 * Takes the audit findings + DataForSEO context and asks gpt-4o (via Vercel
 * AI Gateway) to produce a structured Content Plan: 5–10 specific page
 * recommendations with titles, target keywords, outlines, priority, and
 * reasoning. Replaces the rule-based 90-day roadmap in the report.
 *
 * Uses `generateObject` so the AI returns a Zod-validated object — no
 * free-form parsing on our side, no risk of malformed JSON breaking the
 * report render.
 */

import { generateObject } from "ai";
import { z } from "zod";
import type { AuditRunResult } from "../types";

// ── Output schema ────────────────────────────────────────────────────────

const ContentRecommendationSchema = z.object({
  type: z
    .enum(["blog_post", "service_page", "landing_page", "improvement"])
    .describe(
      "blog_post = informational article targeting an info-intent keyword. " +
        "service_page = commercial page targeting a service/product keyword. " +
        "landing_page = focused conversion page (location, comparison, etc.). " +
        "improvement = upgrade an existing page rather than create new."
    ),
  title: z
    .string()
    .describe("Working title / H1 for the page. 30–70 characters."),
  targetKeyword: z
    .string()
    .describe("Primary keyword this page should rank for."),
  searchVolumePerMonth: z
    .number()
    .nullable()
    .describe(
      "Estimated monthly search volume from the audit data (DataForSEO). " +
        "Null when not derivable from the provided context."
    ),
  priority: z
    .enum(["high", "medium", "low"])
    .describe(
      "high = immediate revenue/visibility impact. medium = solid value " +
        "but not a top priority. low = useful for completeness but optional."
    ),
  reasoning: z
    .string()
    .describe(
      "2–3 sentences explaining WHY this page matters for THIS specific " +
        "site, citing the actual audit data (a competitor that ranks for it, " +
        "a gap from the keyword data, an issue this would address). No fluff."
    ),
  outline: z
    .array(z.string())
    .min(3)
    .max(8)
    .describe("3–8 H2 section headings the page should cover, in order."),
  internalLinkingNote: z
    .string()
    .nullable()
    .describe(
      "Optional one-sentence note on which existing pages this should link " +
        "from / to. Null when nothing obvious applies."
    ),
  /** Existing URL when type === 'improvement', null otherwise. */
  improvementTargetUrl: z
    .string()
    .nullable()
    .describe(
      "When type === 'improvement', the URL of the existing page to upgrade. " +
        "Null for all other types."
    ),
});

const ContentPlanSchema = z.object({
  /**
   * 1–2 sentence headline summary of the strategy. Used as the section
   * intro in the report.
   */
  strategySummary: z
    .string()
    .describe(
      "1–2 sentences naming the core content strategy for this site (e.g. " +
        "'Build out service-page coverage for the high-volume commercial " +
        "keywords competitors dominate, then layer informational blog posts " +
        "around the keyword gap to widen topical authority.')."
    ),
  recommendations: z
    .array(ContentRecommendationSchema)
    .min(5)
    .max(10)
    .describe(
      "5–10 specific page recommendations, ordered with highest priority " +
        "first. Mix blog_post / service_page / landing_page / improvement " +
        "as the situation warrants — don't force a fixed ratio."
    ),
});

export type ContentRecommendation = z.infer<typeof ContentRecommendationSchema>;
export type ContentPlan = z.infer<typeof ContentPlanSchema>;

// ── Generation entry point ───────────────────────────────────────────────

export interface GenerateContentPlanInput {
  clientName: string;
  url: string;
  result: AuditRunResult;
}

export interface ContentPlanWithMeta extends ContentPlan {
  /** ISO timestamp the plan was generated at. */
  generatedAt: string;
  /** Model used — useful when we eventually switch and want to know which audits were on which. */
  model: string;
}

const MODEL = "openai/gpt-4o";

export async function generateContentPlan(
  input: GenerateContentPlanInput
): Promise<ContentPlanWithMeta> {
  const context = buildAuditContext(input);

  const { object } = await generateObject({
    model: MODEL,
    schema: ContentPlanSchema,
    system: SYSTEM_PROMPT,
    prompt: context,
    // Lower temperature keeps recommendations grounded in the provided data
    // rather than drifting into generic SEO advice.
    temperature: 0.4,
  });

  return {
    ...object,
    generatedAt: new Date().toISOString(),
    model: MODEL,
  };
}

// ── Prompt construction ─────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an SEO strategist working at Macrolight Builder, a web development studio that rebuilds client sites with SEO baked in. You write content plans that go into a client-facing audit report.

Your job: take the audit data below and produce 5–10 SPECIFIC page recommendations the client should ship in the next 90 days.

Rules you must follow:

1. EVERY recommendation must be grounded in the data provided. If you suggest a blog post about "best plumbers in Springfield", point to the keyword from the gap analysis or the ranked-keywords list that justifies it. Generic suggestions without data citations will be rejected.

2. Pick keywords with measurable opportunity. Prefer keywords with search volume data attached (the audit data shows volume_per_month) over speculative ones.

3. The MIX of recommendation types should reflect the site's actual situation:
   - Site already ranks for many keywords → bias toward 'improvement' (upgrade existing pages)
   - Site has competitors who outrank them on commercial terms → bias toward 'service_page'
   - Site has thin informational coverage → bias toward 'blog_post'
   - Site has no commercial pages targeting key services → bias toward 'landing_page'

4. Reasoning must be 2–3 sentences. Cite specific data (keyword names, competitor domains, search volumes, current rankings). Do not write generic SEO platitudes.

5. Outlines should be 3–8 H2 headings that a writer could turn directly into a brief. Concrete sections, not "Introduction" / "Conclusion".

6. Priority order: highest priority first in the array. Use 'high' for items with clear immediate impact, 'medium' for solid value, 'low' sparingly.

7. Strategy summary is 1–2 sentences. Say what the overall play is, not what SEO is.`;

function buildAuditContext(input: GenerateContentPlanInput): string {
  const { clientName, url, result } = input;
  const lines: string[] = [];

  lines.push(`# Audit Context\n`);
  lines.push(`**Client:** ${clientName}`);
  lines.push(`**Site:** ${url}`);
  lines.push("");

  // Module availability + overall posture.
  lines.push(`## Overall posture`);
  lines.push(`Overall score: ${result.overallScore ?? "N/A"}/100`);
  const criticalCount = result.issues.filter((i) => i.severity === "critical").length;
  const warningCount = result.issues.filter((i) => i.severity === "warning").length;
  lines.push(`Critical findings: ${criticalCount}`);
  lines.push(`Warning findings: ${warningCount}`);
  lines.push("");

  // Top issues (criticals + first 5 warnings) — gives the AI signal on what's
  // broken so its recommendations can address those gaps.
  const topIssues = result.issues
    .filter((i) => i.severity === "critical" || i.severity === "warning")
    .slice(0, 12);
  if (topIssues.length > 0) {
    lines.push(`## Top findings`);
    for (const issue of topIssues) {
      lines.push(`- [${issue.severity}/${issue.module}] ${issue.title}`);
    }
    lines.push("");
  }

  // Domain Analytics: ranked keywords, keyword gap, top traffic pages.
  const da = result.domainAnalytics.rawData as
    | {
        overview?: {
          organicEtv?: number | null;
          organicCount?: number | null;
          pos1to10?: number | null;
        };
        rankedKeywords?: Array<{
          keyword: string;
          position: number;
          searchVolume: number | null;
          url: string;
        }>;
        keywordGap?: Array<{
          keyword: string;
          searchVolume: number | null;
          competitorWithBest: string;
          competitorBestPosition: number | null;
        }>;
        topTrafficPages?: Array<{
          url: string;
          etv: number | null;
          topKeyword: string | null;
          topKeywordPosition: number | null;
        }>;
        competitors?: Array<{
          domain: string;
          intersections: number | null;
          organicEtv: number | null;
        }>;
      }
    | null;

  if (result.domainAnalytics.available && da) {
    const ov = da.overview;
    if (ov) {
      lines.push(`## Domain Analytics overview`);
      lines.push(
        `- Estimated monthly organic visits: ${formatNumber(ov.organicEtv)}`
      );
      lines.push(`- Organic keyword count: ${formatNumber(ov.organicCount)}`);
      lines.push(`- Keywords ranking in top 10: ${formatNumber(ov.pos1to10)}`);
      lines.push("");
    }

    const ranked = da.rankedKeywords ?? [];
    if (ranked.length > 0) {
      lines.push(`## Currently ranking keywords (${ranked.length} shown)`);
      for (const k of ranked.slice(0, 15)) {
        lines.push(
          `- "${k.keyword}" → position ${k.position}` +
            (k.searchVolume != null ? `, ${k.searchVolume}/mo searches` : "") +
            (k.url ? ` (page: ${k.url})` : "")
        );
      }
      lines.push("");
    }

    const gap = da.keywordGap ?? [];
    if (gap.length > 0) {
      lines.push(`## Keyword gap (competitors rank, this site doesn't)`);
      for (const k of gap.slice(0, 15)) {
        lines.push(
          `- "${k.keyword}" — best competitor: ${k.competitorWithBest}` +
            (k.competitorBestPosition != null
              ? ` at position ${k.competitorBestPosition}`
              : "") +
            (k.searchVolume != null ? `, ${k.searchVolume}/mo searches` : "")
        );
      }
      lines.push("");
    }

    const topPages = da.topTrafficPages ?? [];
    if (topPages.length > 0) {
      lines.push(`## Top pages on this site by estimated traffic`);
      for (const p of topPages.slice(0, 10)) {
        lines.push(
          `- ${p.url} — ETV ${formatNumber(p.etv)}` +
            (p.topKeyword
              ? `, top keyword: "${p.topKeyword}" at #${p.topKeywordPosition ?? "?"}`
              : "")
        );
      }
      lines.push("");
    }

    const competitors = da.competitors ?? [];
    if (competitors.length > 0) {
      lines.push(`## Top organic competitors`);
      for (const c of competitors.slice(0, 5)) {
        lines.push(
          `- ${c.domain} — ETV ${formatNumber(c.organicEtv)}, ` +
            `${formatNumber(c.intersections)} shared keywords`
        );
      }
      lines.push("");
    }
  }

  // SERP Visibility — brand SERP context + commercial-keyword context.
  const sv = result.serpVisibility.rawData as
    | {
        keyword?: string;
        brandPosition?: number | null;
        commercialQueries?: Array<{
          keyword: string;
          brandPosition: number | null;
        }>;
      }
    | null;
  if (result.serpVisibility.available && sv) {
    lines.push(`## SERP visibility`);
    if (sv.keyword) {
      lines.push(
        `- Brand SERP "${sv.keyword}": ranking at position ${sv.brandPosition ?? "not in top 20"}`
      );
    }
    if (sv.commercialQueries && sv.commercialQueries.length > 0) {
      lines.push(`- Commercial-intent SERPs:`);
      for (const q of sv.commercialQueries) {
        lines.push(
          `  - "${q.keyword}": ${q.brandPosition != null ? `position ${q.brandPosition}` : "not in top 20"}`
        );
      }
    }
    lines.push("");
  }

  // Local context — only when relevant (the modules are available).
  if (result.localPack.available) {
    const lp = result.localPack.rawData as
      | { packVisibility?: number; queries?: Array<{ query: string; brandPosition: number | null }> }
      | null;
    if (lp) {
      lines.push(`## Local Pack visibility`);
      lines.push(
        `- ${Math.round((lp.packVisibility ?? 0) * 100)}% pack presence across audited service queries`
      );
      if (lp.queries && lp.queries.length > 0) {
        for (const q of lp.queries) {
          lines.push(
            `  - "${q.query}": ${q.brandPosition != null ? `position ${q.brandPosition}` : "not in pack"}`
          );
        }
      }
      lines.push("");
    }
  }

  // Backlinks summary — gives the AI signal on link authority.
  const bl = result.backlinks.rawData as
    | {
        summary?: { rank?: number | null; referringDomains?: number | null; backlinks?: number | null };
        backlinkGap?: Array<{ referringDomain: string; rank: number | null }>;
      }
    | null;
  if (result.backlinks.available && bl?.summary) {
    lines.push(`## Backlink profile`);
    lines.push(
      `- Domain rank: ${formatNumber(bl.summary.rank)}, ` +
        `${formatNumber(bl.summary.referringDomains)} referring domains, ` +
        `${formatNumber(bl.summary.backlinks)} total backlinks`
    );
    if (bl.backlinkGap && bl.backlinkGap.length > 0) {
      lines.push(`- Top backlink-gap opportunities (linking to competitors, not this site):`);
      for (const g of bl.backlinkGap.slice(0, 5)) {
        lines.push(`  - ${g.referringDomain}${g.rank != null ? ` (rank ${g.rank})` : ""}`);
      }
    }
    lines.push("");
  }

  lines.push(`---`);
  lines.push(
    `Now produce a Content Plan: 5–10 specific page recommendations grounded in the data above. Order by priority, highest first.`
  );

  return lines.join("\n");
}

function formatNumber(n: number | null | undefined): string {
  if (n == null) return "—";
  if (!Number.isFinite(n)) return "—";
  return Math.round(n).toLocaleString();
}
