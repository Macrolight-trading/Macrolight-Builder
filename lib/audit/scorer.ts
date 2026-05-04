import type {
  AuditIssue,
  AuditModule,
  AuditModuleResult,
  AuditRunResult,
} from "./types";

/**
 * Scoring rules.
 *
 * Each issue deducts points from a 100-point starting score:
 *   - Critical: -10
 *   - Warning:  -3
 *   - Info:      0  (informational only, doesn't dock the score)
 *
 * Sentinel issues — those tagged `sentinel: true` on the AuditIssue —
 * deduct -50 instead of the normal critical -10. They represent
 * catastrophic states (no backlinks anywhere, 0% local-pack visibility,
 * no GBP at all) that should drag the module score into failing territory
 * regardless of how many other findings the module has.
 *
 * Scores are floored at 0 and capped at 100.
 *
 * The overall score is the weighted average of *available* module scores.
 * When some modules can't run their weight is redistributed across the
 * remaining available modules.
 */
const SEVERITY_DEDUCTIONS = {
  critical: 10,
  warning: 3,
  info: 0,
} as const;

const SENTINEL_DEDUCTION = 50;

/**
 * Module weights used to compute the overall audit score when all modules
 * are available. Must sum to 1.0.
 */
export const MODULE_WEIGHTS: Record<AuditModule, number> = {
  technical:       0.15,
  onpage:          0.15,
  backlinks:       0.12,
  localSeo:        0.10,
  domainAnalytics: 0.15,
  serpVisibility:  0.12,
  localPack:       0.13,
  reputation:      0.08,
};

/** Compute a 0-100 score for a single module from its issue list. */
export function scoreModule(issues: AuditIssue[]): number {
  const deduction = issues.reduce((sum, issue) => {
    if (issue.sentinel) return sum + SENTINEL_DEDUCTION;
    return sum + SEVERITY_DEDUCTIONS[issue.severity];
  }, 0);
  return clamp(100 - deduction, 0, 100);
}

/** Compute the weighted overall audit score. Returns null when no modules are available. */
export function scoreOverall(modules: {
  technical: AuditModuleResult;
  onpage: AuditModuleResult;
  backlinks: AuditModuleResult;
  localSeo: AuditModuleResult;
  domainAnalytics: AuditModuleResult;
  serpVisibility: AuditModuleResult;
  localPack: AuditModuleResult;
  reputation: AuditModuleResult;
}): number | null {
  const entries: Array<{ module: AuditModule; score: number }> = [];

  for (const [key, m] of Object.entries(modules) as Array<[AuditModule, AuditModuleResult]>) {
    if (m.available) entries.push({ module: key, score: m.score });
  }

  if (entries.length === 0) return null;

  const availableWeightSum = entries.reduce(
    (sum, e) => sum + MODULE_WEIGHTS[e.module],
    0
  );
  if (availableWeightSum === 0) return null;

  const weighted = entries.reduce(
    (sum, e) => sum + e.score * (MODULE_WEIGHTS[e.module] / availableWeightSum),
    0
  );

  return Math.round(clamp(weighted, 0, 100));
}

/** Sort issues by severity (critical first) for display purposes. */
export function sortIssuesBySeverity(issues: AuditIssue[]): AuditIssue[] {
  const order: Record<AuditIssue["severity"], number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };
  return [...issues].sort((a, b) => order[a.severity] - order[b.severity]);
}

/** Bundle all module results into a single AuditRunResult. */
export function buildRunResult(modules: {
  technical: AuditModuleResult;
  onpage: AuditModuleResult;
  backlinks: AuditModuleResult;
  localSeo: AuditModuleResult;
  domainAnalytics: AuditModuleResult;
  serpVisibility: AuditModuleResult;
  localPack: AuditModuleResult;
  reputation: AuditModuleResult;
}): AuditRunResult {
  const allIssues = (
    Object.values(modules) as AuditModuleResult[]
  )
    .filter((m) => m.available)
    .flatMap((m) => m.issues);

  return {
    overallScore: scoreOverall(modules),
    technical: modules.technical,
    onpage: modules.onpage,
    backlinks: modules.backlinks,
    localSeo: modules.localSeo,
    domainAnalytics: modules.domainAnalytics,
    serpVisibility: modules.serpVisibility,
    localPack: modules.localPack,
    reputation: modules.reputation,
    issues: sortIssuesBySeverity(allIssues),
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
