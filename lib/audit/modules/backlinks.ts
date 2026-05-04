import { scoreModule } from "../scorer";
import type { AuditInput, AuditIssue, AuditModuleResult } from "../types";

/**
 * Backlink Profile module.
 *
 * STATUS: Scaffolding stub.
 *
 * Production implementation (per plan section 3.3) will check:
 *   - Domain Rating / Authority
 *   - Total referring domains
 *   - Total backlinks
 *   - Top 10 linking domains (with their DR)
 *   - Anchor text distribution
 *   - Toxic / spammy link flags
 *
 * Data source: DataForSEO API. One `/dataforseo_labs/google/domain_rank_overview`
 * style call returns most metrics. Cost ~$0.003-0.01 per audit.
 *
 * Required env: DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD
 */

const DATAFORSEO_BASE_URL = "https://api.dataforseo.com/v3";

interface BacklinkRawData {
  domainRank: number | null;
  referringDomains: number | null;
  totalBacklinks: number | null;
  topLinkingDomains: Array<{ domain: string; rank: number | null }>;
  anchorTextDistribution: Array<{ anchor: string; count: number }>;
}

export async function runBacklinkAudit(
  input: AuditInput
): Promise<AuditModuleResult> {
  const issues: AuditIssue[] = [];
  const positives: string[] = [];

  const data = await fetchBacklinkProfile(input.url).catch((err: unknown) => {
    issues.push({
      module: "backlinks",
      severity: "warning",
      check: "dataforseo_api_unavailable",
      title: "Could not retrieve backlink data",
      description:
        "The DataForSEO API call failed. Backlink metrics were not captured.",
      recommendation:
        "Verify DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD are set in the " +
        "environment, and that the account has sufficient credit.",
      docsUrl: "https://docs.dataforseo.com/v3/backlinks/",
    });
    return {
      domainRank: null,
      referringDomains: null,
      totalBacklinks: null,
      topLinkingDomains: [],
      anchorTextDistribution: [],
      _error: err instanceof Error ? err.message : String(err),
    } as BacklinkRawData & { _error: string };
  });

  // TODO(milestone-3): convert backlink metrics into severity-tagged issues.
  //   - Domain rank < 10 -> critical
  //   - Referring domains < 10 -> warning
  //   - > 30% of anchors are exact-match commercial keywords -> warning
  //   - Toxic link percentage > X% -> critical

  return {
    module: "backlinks",
    score: scoreModule(issues),
    issues,
    rawData: data,
    positives,
  };
}

/**
 * STUB: Call DataForSEO and return normalised backlink metrics.
 */
async function fetchBacklinkProfile(url: string): Promise<BacklinkRawData> {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;

  if (!login || !password) {
    throw new Error("DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD are not set");
  }

  // TODO(milestone-3): real implementation.
  //   - Basic auth: btoa(`${login}:${password}`)
  //   - POST /backlinks/summary/live with target domain extracted from url
  //   - Parse `tasks[0].result[0]` for the metrics above
  void url;
  void DATAFORSEO_BASE_URL;

  return {
    domainRank: null,
    referringDomains: null,
    totalBacklinks: null,
    topLinkingDomains: [],
    anchorTextDistribution: [],
  };
}
