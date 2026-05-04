/**
 * Shared types for the SEO audit pipeline.
 *
 * The shape of `AuditIssue` is also persisted as JSON on `AuditResult.issues`,
 * so any change here should be coordinated with the database / dashboard.
 */

export type AuditModule =
  | "technical"
  | "onpage"
  | "backlinks"
  | "localSeo"
  | "domainAnalytics"
  | "serpVisibility"
  | "localPack"
  | "reputation";

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
  /**
   * Catastrophic-state finding. Tagged on issues that represent the entire
   * module being effectively at zero (e.g. "no backlinks anywhere", "0%
   * local-pack visibility", "no GBP listing exists"). The scorer treats a
   * sentinel issue as a -50 deduction instead of -10, so a single one is
   * enough to flag the module score as failing rather than just nicked.
   *
   * Display layer ignores this flag — sentinel issues still render with the
   * normal "critical" red styling. The grading is a scoring concern only.
   */
  sentinel?: boolean;
}

/**
 * The result of running a single audit module. The orchestrator collects four
 * of these and hands them to the scorer.
 *
 * `available` is the honesty bit: when a module's data source is unusable
 * (missing API key, unreachable endpoint, site can't be crawled), the module
 * sets `available: false` and provides an `unavailableReason`. The scorer
 * then excludes the module from the overall calculation and the UI/PDF
 * render "Not available" instead of a misleading score.
 *
 * Modules MUST NOT push fake "API key missing" issues — those would inflate
 * the issue count and dock the score for a problem that isn't about the
 * audited site.
 */
export interface AuditModuleResult {
  module: AuditModule;
  /**
   * True when the module ran with usable data. False means no data source
   * was reachable; treat the module as N/A.
   */
  available: boolean;
  /**
   * Internal/admin-facing reason a module is unavailable (e.g. "Google
   * PageSpeed API key not configured"). Surfaced in the dashboard banner,
   * never in the client-facing PDF.
   */
  unavailableReason?: string;
  /**
   * 0-100. Only meaningful when `available` is true. When `available` is
   * false, callers should ignore this value (we keep it as 0 rather than
   * widening the type to `number | null` to avoid touching the DB schema).
   */
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
 *
 * `overallScore` is the weighted average across modules where `available` is
 * true. When NO modules are available it's null — the audit produced no
 * usable data at all.
 */
export interface AuditRunResult {
  overallScore: number | null;
  technical: AuditModuleResult;
  onpage: AuditModuleResult;
  backlinks: AuditModuleResult;
  localSeo: AuditModuleResult;
  domainAnalytics: AuditModuleResult;
  serpVisibility: AuditModuleResult;
  localPack: AuditModuleResult;
  reputation: AuditModuleResult;
  /** Flat issue list across only available modules, sorted by severity. */
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
  /**
   * Service keywords used by the Local Pack module to query the Maps SERP
   * (e.g. ["plumber", "drain cleaning", "water heater repair"]). When
   * empty/missing, the Local Pack module marks itself unavailable rather
   * than guessing — accuracy of the report depends on these being right.
   */
  serviceKeywords?: string[];
}
