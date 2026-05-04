import prisma from "@/lib/prisma";
import { runTechnicalAudit } from "./modules/technical";
import { runOnPageAudit } from "./modules/onpage";
import { runBacklinkAudit } from "./modules/backlinks";
import { runLocalSeoAudit } from "./modules/local-seo";
import { buildRunResult } from "./scorer";
import type { AuditInput, AuditRunResult } from "./types";

/**
 * Audit orchestrator.
 *
 * Runs the four audit modules in parallel, scores them, persists the
 * AuditResult, and updates the AuditJob status.
 *
 * Architecture matches plan section 2: technical + on-page share the crawler,
 * backlinks + local SEO hit external APIs concurrently. Total runtime target
 * < 90s on a typical site.
 *
 * The orchestrator is designed to never throw to the caller — module failures
 * are captured as issues / null fields in `rawData`. The only failure mode
 * that bubbles up is database write errors.
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
    // Run all four modules concurrently. Each module is responsible for its
    // own error handling and will return an AuditModuleResult with a
    // degraded score rather than throwing.
    const [technical, onpage, backlinks, localSeo] = await Promise.all([
      runTechnicalAudit(input),
      runOnPageAudit(input),
      runBacklinkAudit(input),
      runLocalSeoAudit(input),
    ]);

    const result = buildRunResult({ technical, onpage, backlinks, localSeo });

    await prisma.$transaction([
      prisma.auditResult.create({
        data: {
          jobId,
          overallScore: result.overallScore,
          technicalScore: result.technical.score,
          onPageScore: result.onpage.score,
          backlinkScore: result.backlinks.score,
          localSeoScore: result.localSeo.score,
          issues: result.issues as object,
          rawData: {
            technical: result.technical.rawData,
            onpage: result.onpage.rawData,
            backlinks: result.backlinks.rawData,
            localSeo: result.localSeo.rawData,
            positives: {
              technical: result.technical.positives ?? [],
              onpage: result.onpage.positives ?? [],
              backlinks: result.backlinks.positives ?? [],
              localSeo: result.localSeo.positives ?? [],
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
