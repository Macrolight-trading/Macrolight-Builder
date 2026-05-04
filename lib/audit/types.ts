/**
 * Shared types for the SEO audit pipeline.
 *
 * The shape of `AuditIssue` is also persisted as JSON on `AuditResult.issues`,
 * so any change here should be coordinated with the database / dashboard.
 */

export type AuditModule = "technical" | "onpage" | "backlinks" | "localSeo";

export type AuditSeverity = "critical" | "warning" | "info";

/**
 * One finding from a single check inside one of the audit modules.
 *
 * `check` is a stable machine-readable identifier (e.g. "noindex_on_homepage")
 * so we can group / dedupe / link to docs without relying on the prose title.
 */
export interface AuditIssue {
  module: AuditModule;
  severity: AuditSeverity;
  check: string;
  title: string;
  description: string;
  recommendation: string;
  /** Optional link to vendor documentation explaining the issue. */
  docsUrl?: string;
  /** Optional URL on the audited site where the issue was found. */
  affectedUrl?: string;
}

/**
 * The result of running a single audit module. The orchestrator collects four
 * of these and hands them to the scorer.
 */
export interface AuditModuleResult {
  module: AuditModule;
  /** 0-100, computed by the scorer from the issues list. */
  score: number;
  issues: AuditIssue[];
  /**
   * Raw payload from the underlying data source (PageSpeed JSON, DataForSEO
   * response, etc.). Persisted to `AuditResult.rawData` for later display
   * without re-running external API calls.
   */
  rawData: unknown;
  /** Positive findings worth surfacing in the "What's working" section. */
  positives?: string[];
}

/**
 * Aggregate result returned by the orchestrator and persisted to the DB.
 */
export interface AuditRunResult {
  overallScore: number;
  technical: AuditModuleResult;
  onpage: AuditModuleResult;
  backlinks: AuditModuleResult;
  localSeo: AuditModuleResult;
  /** Flat issue list across all modules, sorted by severity. */
  issues: AuditIssue[];
}

/**
 * Input handed to the orchestrator and to each module.
 */
export interface AuditInput {
  url: string;
  clientName: string;
  /** Optional cap on pages crawled (defaults applied per module). */
  crawlLimit?: number;
}
