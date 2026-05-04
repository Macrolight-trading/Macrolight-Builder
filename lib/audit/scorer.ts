import type {
  AuditIssue,
  AuditModule,
  AuditModuleResult,
  AuditRunResult,
} from "./types";

/**
 * Scoring rules per the implementation plan section 4.
 *
 * Each issue deducts points from a 100-point starting score:
 *   - Critical: -10
 *   - Warning:  -3
 *   - Info:      0  (informational only, doesn't dock the score)
 *
 * Scores are floored at 0 and capped at 100.
 */
const SEVERITY_DEDUCTIONS = {
  critical: 10,
  warning: 3,
  info: 0,
} as const;

/**
 * Module weights used to compute the overall audit score.
 * Must sum to 1.0.
 */
export const MODULE_WEIGHTS: Record<AuditModule, number> = {
  technical: 0.35,
  onpage: 0.30,
  backlinks: 0.20,
  localSeo: 0.15,
};

/**
 * Compute a 0-100 score for a single module from its issue list.
 */
export function scoreModule(issues: AuditIssue[]): number {
  const deduction = issues.reduce(
    (sum, issue) => sum + SEVERITY_DEDUCTIONS[issue.severity],
    0
  );
  return clamp(100 - deduction, 0, 100);
}

/**
 * Compute the weighted overall audit score from four module results.
 */
export function scoreOverall(modules: {
  technical: AuditModuleResult;
  onpage: AuditModuleResult;
  backlinks: AuditModuleResult;
  localSeo: AuditModuleResult;
}): number {
  const weighted =
    modules.technical.score * MODULE_WEIGHTS.technical +
    modules.onpage.score * MODULE_WEIGHTS.onpage +
    modules.backlinks.score * MODULE_WEIGHTS.backlinks +
    modules.localSeo.score * MODULE_WEIGHTS.localSeo;

  return Math.round(clamp(weighted, 0, 100));
}

/**
 * Sort issues by severity (critical first) for display purposes.
 */
export function sortIssuesBySeverity(issues: AuditIssue[]): AuditIssue[] {
  const order: Record<AuditIssue["severity"], number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };
  return [...issues].sort((a, b) => order[a.severity] - order[b.severity]);
}

/**
 * Bundle four module results into a single AuditRunResult.
 */
export function buildRunResult(modules: {
  technical: AuditModuleResult;
  onpage: AuditModuleResult;
  backlinks: AuditModuleResult;
  localSeo: AuditModuleResult;
}): AuditRunResult {
  const allIssues = [
    ...modules.technical.issues,
    ...modules.onpage.issues,
    ...modules.backlinks.issues,
    ...modules.localSeo.issues,
  ];

  return {
    overallScore: scoreOverall(modules),
    technical: modules.technical,
    onpage: modules.onpage,
    backlinks: modules.backlinks,
    localSeo: modules.localSeo,
    issues: sortIssuesBySeverity(allIssues),
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
