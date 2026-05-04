import prisma from "@/lib/prisma";
import { crawl } from "./crawler";
import { runTechnicalAudit } from "./modules/technical";
import { runOnPageAudit } from "./modules/onpage";
import { runBacklinkAudit } from "./modules/backlinks";
import { runLocalSeoAudit } from "./modules/local-seo";
import { runDomainAnalyticsAudit } from "./modules/domain-analytics";
import { runSerpVisibilityAudit } from "./modules/serp-visibility";
import { runLocalPackAudit } from "./modules/local-pack";
import { runReputationAudit } from "./modules/reputation";
import { buildRunResult } from "./scorer";
import type { AuditInput, AuditModuleResult, AuditRunResult } from "./types";

/** Persisted availability metadata. Read by the UI / PDF layer. */
function moduleAvailability(m: AuditModuleResult): {
  available: boolean;
  reason: string | null;
} {
  return {
    available: m.available,
    reason: m.available ? null : m.unavailableReason ?? "Not available",
  };
}

/**
 * Audit orchestrator.
 *
 * All six modules run concurrently (crawl-dependent ones after the crawl
 * resolves). Total runtime target < 90s.
 */
export async function runAudit(
  jobId: string,
  input: AuditInput
): Promise<AuditRunResult> {
  await prisma.auditJob.update({
    where: { id: jobId },
    data: { status: "RUNNING", startedAt: new Date() },
  });

  try {
    // Crawl + all API-only modules fire concurrently.
    const crawlPromise           = crawl(input.url, { maxPages: input.crawlLimit });
    const backlinksPromise       = runBacklinkAudit(input);
    const localSeoPromise        = runLocalSeoAudit(input);
    const domainAnalyticsPromise = runDomainAnalyticsAudit(input);
    const serpPromise            = runSerpVisibilityAudit(input);
    const localPackPromise       = runLocalPackAudit(input);
    const reputationPromise      = runReputationAudit(input);

    const crawlResult = await crawlPromise;

    const [
      technical,
      onpage,
      backlinks,
      localSeo,
      domainAnalytics,
      serpVisibility,
      localPack,
      reputation,
    ] = await Promise.all([
      runTechnicalAudit(input, crawlResult),
      runOnPageAudit(input, crawlResult),
      backlinksPromise,
      localSeoPromise,
      domainAnalyticsPromise,
      serpPromise,
      localPackPromise,
      reputationPromise,
    ]);

    const result = buildRunResult({
      technical, onpage, backlinks, localSeo, domainAnalytics, serpVisibility,
      localPack, reputation,
    });

    // Debug trace.
    const blRaw = result.backlinks.rawData as { topBacklinks?: unknown[] } | null;
    console.log(
      "[audit index] backlinks available:", result.backlinks.available,
      "| topBacklinks:", blRaw?.topBacklinks?.length ?? 0,
      "| domainAnalytics available:", result.domainAnalytics.available,
      "| serpVisibility available:", result.serpVisibility.available
    );

    const availability = {
      technical:       moduleAvailability(result.technical),
      onpage:          moduleAvailability(result.onpage),
      backlinks:       moduleAvailability(result.backlinks),
      localSeo:        moduleAvailability(result.localSeo),
      domainAnalytics: moduleAvailability(result.domainAnalytics),
      serpVisibility:  moduleAvailability(result.serpVisibility),
      localPack:       moduleAvailability(result.localPack),
      reputation:      moduleAvailability(result.reputation),
    };

    const overallAvailable = result.overallScore != null;

    await prisma.$transaction([
      prisma.auditResult.create({
        data: {
          jobId,
          overallScore:         result.overallScore ?? 0,
          technicalScore:       result.technical.score,
          onPageScore:          result.onpage.score,
          backlinkScore:        result.backlinks.score,
          localSeoScore:        result.localSeo.score,
          domainAnalyticsScore: result.domainAnalytics.score,
          serpScore:            result.serpVisibility.score,
          // Nullable Int columns — only populate when the module ran. Stored
          // null for unavailable, otherwise the real score.
          localPackScore:       result.localPack.available ? result.localPack.score : null,
          reputationScore:      result.reputation.available ? result.reputation.score : null,
          issues: result.issues as object,
          rawData: {
            availability: { ...availability, overallAvailable },
            technical:       result.technical.rawData,
            onpage:          result.onpage.rawData,
            backlinks:       result.backlinks.rawData,
            localSeo:        result.localSeo.rawData,
            domainAnalytics: result.domainAnalytics.rawData,
            serpVisibility:  result.serpVisibility.rawData,
            localPack:       result.localPack.rawData,
            reputation:      result.reputation.rawData,
            positives: {
              technical:       result.technical.available       ? result.technical.positives       ?? [] : [],
              onpage:          result.onpage.available          ? result.onpage.positives          ?? [] : [],
              backlinks:       result.backlinks.available       ? result.backlinks.positives       ?? [] : [],
              localSeo:        result.localSeo.available        ? result.localSeo.positives        ?? [] : [],
              domainAnalytics: result.domainAnalytics.available ? result.domainAnalytics.positives ?? [] : [],
              serpVisibility:  result.serpVisibility.available  ? result.serpVisibility.positives  ?? [] : [],
              localPack:       result.localPack.available       ? result.localPack.positives       ?? [] : [],
              reputation:      result.reputation.available      ? result.reputation.positives      ?? [] : [],
            },
          } as object,
        },
      }),
      prisma.auditJob.update({
        where: { id: jobId },
        data: { status: "COMPLETED", completedAt: new Date() },
      }),
    ]);

    return result;
  } catch (err) {
    await prisma.auditJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        error: err instanceof Error ? err.message : String(err),
      },
    });
    throw err;
  }
}

export type { AuditInput, AuditRunResult } from "./types";
