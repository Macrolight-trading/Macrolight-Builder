import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { generateAuditPdf } from "@/lib/audit/pdf";
import type { AuditRunResult } from "@/lib/audit/types";

/**
 * GET /api/audits/:id/pdf  — generate (if missing) and return the report PDF.
 *
 * STATUS: Scaffolding stub.
 *
 * On success the PDF is uploaded to blob storage and `pdfUrl` is persisted to
 * AuditResult. We then 302 to that URL. PDF generation itself lives in
 * lib/audit/pdf.ts and currently throws — wire up Puppeteer in Milestone 4.
 */
export const maxDuration = 60;

export async function GET(
  _request: Request,
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

  // Cached: redirect to the existing PDF.
  if (job.result.pdfUrl) {
    return NextResponse.redirect(job.result.pdfUrl, 302);
  }

  // Otherwise: generate, persist, redirect.
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const { pdfUrl } = await generateAuditPdf({
      jobId: job.id,
      result: structuredAuditFromRow(job.result),
      clientName: job.clientName,
      url: job.url,
      appBaseUrl: baseUrl,
    });

    await prisma.auditResult.update({
      where: { id: job.result.id },
      data: { pdfUrl },
    });

    return NextResponse.redirect(pdfUrl, 302);
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "PDF generation failed.",
      },
      { status: 501 }
    );
  }
}

/**
 * Re-shape the persisted AuditResult row into the in-memory AuditRunResult
 * the PDF generator expects. The `issues` and `rawData` columns are JSON.
 */
function structuredAuditFromRow(row: {
  overallScore: number;
  technicalScore: number;
  onPageScore: number;
  backlinkScore: number;
  localSeoScore: number;
  issues: unknown;
  rawData: unknown;
}): AuditRunResult {
  const issues = Array.isArray(row.issues)
    ? (row.issues as AuditRunResult["issues"])
    : [];

  const raw = (row.rawData ?? {}) as Record<string, unknown>;

  return {
    overallScore: row.overallScore,
    technical: {
      module: "technical",
      score: row.technicalScore,
      issues: issues.filter((i) => i.module === "technical"),
      rawData: raw.technical ?? null,
    },
    onpage: {
      module: "onpage",
      score: row.onPageScore,
      issues: issues.filter((i) => i.module === "onpage"),
      rawData: raw.onpage ?? null,
    },
    backlinks: {
      module: "backlinks",
      score: row.backlinkScore,
      issues: issues.filter((i) => i.module === "backlinks"),
      rawData: raw.backlinks ?? null,
    },
    localSeo: {
      module: "localSeo",
      score: row.localSeoScore,
      issues: issues.filter((i) => i.module === "localSeo"),
      rawData: raw.localSeo ?? null,
    },
    issues,
  };
}
