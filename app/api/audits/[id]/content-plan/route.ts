import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { generateContentPlan, type ContentPlanWithMeta } from "@/lib/audit/ai/content-plan";
import type { AuditIssue, AuditRunResult } from "@/lib/audit/types";

/**
 * POST /api/audits/:id/content-plan
 *
 * Generates the AI Content Plan for the given audit, persists it to
 * AuditResult.aiContentPlan, returns the plan. Idempotent: if a plan
 * already exists, returns it without regenerating unless ?regenerate=1
 * is passed.
 *
 * Admin-only. AI generation typically takes 5–15s for gpt-4o.
 */

export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if ((session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const url = new URL(request.url);
  const force = url.searchParams.get("regenerate") === "1";

  const job = await prisma.auditJob.findUnique({
    where: { id },
    include: { result: true },
  });

  if (!job || !job.result) {
    return NextResponse.json(
      { error: "Audit not found or not yet complete." },
      { status: 404 }
    );
  }

  // Return existing plan if present and not forcing a regenerate. Avoids
  // burning AI credits on accidental double-clicks.
  const existing = (job.result as { aiContentPlan?: unknown }).aiContentPlan;
  if (!force && existing && typeof existing === "object") {
    return NextResponse.json({
      plan: existing,
      cached: true,
    });
  }

  // Hydrate the persisted row into the in-memory AuditRunResult shape the
  // generator expects.
  const auditRunResult = hydrateRunResult(job.result);

  let plan: ContentPlanWithMeta;
  try {
    plan = await generateContentPlan({
      clientName: job.clientName,
      url: job.url,
      result: auditRunResult,
    });
  } catch (err) {
    console.error("[content-plan] generation failed:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "AI generation failed.",
      },
      { status: 500 }
    );
  }

  await prisma.auditResult.update({
    where: { id: job.result.id },
    data: {
      aiContentPlan: plan as unknown as object,
      aiContentPlanAt: new Date(),
    },
  });

  return NextResponse.json({ plan, cached: false });
}

/**
 * Reconstruct an in-memory AuditRunResult from the persisted DB row + JSON.
 * Mirrors the structuredAuditFromRow helper in the PDF route — we only need
 * the fields the content-plan prompt builder actually reads.
 */
function hydrateRunResult(row: {
  overallScore: number;
  technicalScore: number;
  onPageScore: number;
  backlinkScore: number;
  localSeoScore: number;
  domainAnalyticsScore: number;
  serpScore: number;
  localPackScore: number | null;
  reputationScore: number | null;
  issues: unknown;
  rawData: unknown;
}): AuditRunResult {
  const issues: AuditIssue[] = Array.isArray(row.issues)
    ? (row.issues as AuditIssue[])
    : [];

  const raw = (row.rawData ?? {}) as Record<string, unknown>;
  const a = (raw.availability ?? {}) as Record<string, unknown>;
  const isAvail = (key: string) => {
    const moduleAvailability = a[key] as { available?: boolean } | undefined;
    return moduleAvailability?.available !== false;
  };
  const overallAvailable = a.overallAvailable as boolean | undefined;

  return {
    overallScore: overallAvailable !== false ? row.overallScore : null,
    technical: makeModule("technical", isAvail("technical"), row.technicalScore, raw.technical, issues),
    onpage: makeModule("onpage", isAvail("onpage"), row.onPageScore, raw.onpage, issues),
    backlinks: makeModule("backlinks", isAvail("backlinks"), row.backlinkScore, raw.backlinks, issues),
    localSeo: makeModule("localSeo", isAvail("localSeo"), row.localSeoScore, raw.localSeo, issues),
    domainAnalytics: makeModule(
      "domainAnalytics",
      isAvail("domainAnalytics"),
      row.domainAnalyticsScore,
      raw.domainAnalytics,
      issues
    ),
    serpVisibility: makeModule(
      "serpVisibility",
      isAvail("serpVisibility"),
      row.serpScore,
      raw.serpVisibility,
      issues
    ),
    localPack: makeModule(
      "localPack",
      isAvail("localPack"),
      row.localPackScore ?? 0,
      raw.localPack,
      issues
    ),
    reputation: makeModule(
      "reputation",
      isAvail("reputation"),
      row.reputationScore ?? 0,
      raw.reputation,
      issues
    ),
    issues,
  };
}

function makeModule(
  module: AuditIssue["module"],
  available: boolean,
  score: number,
  rawData: unknown,
  allIssues: AuditIssue[]
) {
  return {
    module,
    available,
    score,
    issues: allIssues.filter((i) => i.module === module),
    rawData: rawData ?? null,
  };
}
