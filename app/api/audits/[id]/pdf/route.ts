import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { generateAuditPdf } from "@/lib/audit/pdf";
import type { AuditIssue, AuditRunResult } from "@/lib/audit/types";

/**
 * GET /api/audits/:id/pdf
 *
 * Re-generates the audit report as a PDF and streams it directly. We don't
 * cache the PDF — audit reports are low-frequency and the source of truth
 * (issues + raw data) lives in the DB. This avoids a blob-storage dependency.
 *
 * The chromium-min Chromium binary download (~50MB) happens once per cold
 * start in serverless, so first PDF after a deploy is slow; subsequent ones
 * are fast.
 */

// Puppeteer launches need headroom — 60s is plenty for a single render.
export const maxDuration = 60;

// Force Node runtime — Puppeteer can't run in Edge.
export const runtime = "nodejs";

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

  try {
    const result = structuredAuditFromRow(job.result);
    const positives = extractPositives(job.result.rawData);

    const pdfBuffer = await generateAuditPdf({
      result,
      clientName: job.clientName,
      url: job.url,
      auditDate: job.completedAt ?? job.createdAt,
      positives,
    });

    const filename = sanitizeFilename(`${job.clientName}-seo-audit.pdf`);

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.byteLength),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "PDF generation failed.",
      },
      { status: 500 }
    );
  }
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function structuredAuditFromRow(row: {
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
  const avail = readAvailabilityFromRaw(raw);

  return {
    overallScore: avail.overallAvailable ? row.overallScore : null,
    technical: {
      module: "technical",
      available: avail.technical.available,
      unavailableReason: avail.technical.reason ?? undefined,
      score: row.technicalScore,
      issues: issues.filter((i) => i.module === "technical"),
      rawData: raw.technical ?? null,
    },
    onpage: {
      module: "onpage",
      available: avail.onpage.available,
      unavailableReason: avail.onpage.reason ?? undefined,
      score: row.onPageScore,
      issues: issues.filter((i) => i.module === "onpage"),
      rawData: raw.onpage ?? null,
    },
    backlinks: {
      module: "backlinks",
      available: avail.backlinks.available,
      unavailableReason: avail.backlinks.reason ?? undefined,
      score: row.backlinkScore,
      issues: issues.filter((i) => i.module === "backlinks"),
      rawData: raw.backlinks ?? null,
    },
    localSeo: {
      module: "localSeo",
      available: avail.localSeo.available,
      unavailableReason: avail.localSeo.reason ?? undefined,
      score: row.localSeoScore,
      issues: issues.filter((i) => i.module === "localSeo"),
      rawData: raw.localSeo ?? null,
    },
    domainAnalytics: {
      module: "domainAnalytics",
      available: avail.domainAnalytics.available,
      unavailableReason: avail.domainAnalytics.reason ?? undefined,
      score: row.domainAnalyticsScore,
      issues: issues.filter((i) => i.module === "domainAnalytics"),
      rawData: raw.domainAnalytics ?? null,
    },
    serpVisibility: {
      module: "serpVisibility",
      available: avail.serpVisibility.available,
      unavailableReason: avail.serpVisibility.reason ?? undefined,
      score: row.serpScore,
      issues: issues.filter((i) => i.module === "serpVisibility"),
      rawData: raw.serpVisibility ?? null,
    },
    localPack: {
      module: "localPack",
      available: avail.localPack.available,
      unavailableReason: avail.localPack.reason ?? undefined,
      score: row.localPackScore ?? 0,
      issues: issues.filter((i) => i.module === "localPack"),
      rawData: raw.localPack ?? null,
    },
    reputation: {
      module: "reputation",
      available: avail.reputation.available,
      unavailableReason: avail.reputation.reason ?? undefined,
      score: row.reputationScore ?? 0,
      issues: issues.filter((i) => i.module === "reputation"),
      rawData: raw.reputation ?? null,
    },
    issues,
  };
}

interface AvailabilityFromRaw {
  technical:       { available: boolean; reason: string | null };
  onpage:          { available: boolean; reason: string | null };
  backlinks:       { available: boolean; reason: string | null };
  localSeo:        { available: boolean; reason: string | null };
  domainAnalytics: { available: boolean; reason: string | null };
  serpVisibility:  { available: boolean; reason: string | null };
  localPack:       { available: boolean; reason: string | null };
  reputation:      { available: boolean; reason: string | null };
  overallAvailable: boolean;
}

function readAvailabilityFromRaw(raw: Record<string, unknown>): AvailabilityFromRaw {
  const a = raw.availability;
  const fallback = { available: true, reason: null };
  if (!a || typeof a !== "object") {
    return {
      technical: fallback, onpage: fallback, backlinks: fallback,
      localSeo: fallback, domainAnalytics: fallback, serpVisibility: fallback,
      localPack: fallback, reputation: fallback,
      overallAvailable: true,
    };
  }
  const get = (key: string) => {
    const node = (a as Record<string, unknown>)[key];
    if (!node || typeof node !== "object") return fallback;
    const obj = node as Record<string, unknown>;
    return {
      available: obj.available !== false,
      reason: typeof obj.reason === "string" ? obj.reason : null,
    };
  };
  return {
    technical:       get("technical"),
    onpage:          get("onpage"),
    backlinks:       get("backlinks"),
    localSeo:        get("localSeo"),
    domainAnalytics: get("domainAnalytics"),
    serpVisibility:  get("serpVisibility"),
    localPack:       get("localPack"),
    reputation:      get("reputation"),
    overallAvailable: (a as Record<string, unknown>).overallAvailable !== false,
  };
}

function extractPositives(rawData: unknown): {
  technical?: string[];
  onpage?: string[];
  backlinks?: string[];
  localSeo?: string[];
  domainAnalytics?: string[];
  serpVisibility?: string[];
  localPack?: string[];
  reputation?: string[];
} {
  if (!rawData || typeof rawData !== "object") return {};
  const positives = (rawData as Record<string, unknown>).positives;
  if (!positives || typeof positives !== "object") return {};
  const p = positives as Record<string, unknown>;
  const arr = (key: string): string[] | undefined => {
    const v = p[key];
    return Array.isArray(v) ? (v as string[]) : undefined;
  };
  return {
    technical:       arr("technical"),
    onpage:          arr("onpage"),
    backlinks:       arr("backlinks"),
    localSeo:        arr("localSeo"),
    domainAnalytics: arr("domainAnalytics"),
    serpVisibility:  arr("serpVisibility"),
    localPack:       arr("localPack"),
    reputation:      arr("reputation"),
  };
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
}
