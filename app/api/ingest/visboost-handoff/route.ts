import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Server-to-server ingestion for VisBoost audit handoffs.
 *
 * POST /api/ingest/visboost-handoff — receive a durable handoff record from
 * VisBoost (forwarded via webhook) and land it in the Builder CRM so ops/sales
 * have an actionable record. Designed to be called by VisBoost's backend, never
 * by the browser.
 *
 * Auth: VISBOOST_INGEST_SECRET (falls back to LEAD_INGEST_SECRET), sent as the
 * x-ingest-secret request header — same pattern as POST /api/ingest/lead.
 *
 * Idempotency: keyed on `handoffId`. A retry of the same handoff returns the
 * already-linked record IDs without creating duplicates. Repeat handoffs for the
 * same `clientId` attach to the existing Lead instead of spawning a new one.
 *
 * On a new handoff this creates/links a Lead and creates a Note (full audit
 * context) + an actionable follow-up Activity (a TASK), then records a
 * VisboostHandoff marker linking them.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const secret = process.env.VISBOOST_INGEST_SECRET || process.env.LEAD_INGEST_SECRET;
  if (!secret) return false;
  return req.headers.get("x-ingest-secret") === secret;
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function int(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

const SERVICE_LABELS: Record<string, string> = {
  rebuild: "Website Rebuild",
  remediation: "SEO Remediation",
  technical_seo: "Technical SEO",
  local_seo: "Local SEO",
};

function normalizeServiceType(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return normalized;
}

type TopFinding = {
  id: string;
  category: string;
  title: string;
  recommendation: string;
};

function parseFindings(value: unknown): TopFinding[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((f) => {
      const item = (f ?? {}) as Record<string, unknown>;
      return {
        id: str(item.id),
        category: str(item.category),
        title: str(item.title),
        recommendation: str(item.recommendation),
      };
    })
    .filter((f) => f.title || f.recommendation);
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const handoffId = str(body.handoffId);
  const auditId = str(body.auditId);
  const clientId = str(body.clientId);
  const clientName = str(body.clientName);
  const url = str(body.url);
  const serviceType = str(body.serviceType);
  const normalizedServiceType = normalizeServiceType(serviceType);
  const overallScore = num(body.overallScore);
  const notes = str(body.notes);

  const issue = (body.issueSummary ?? {}) as Record<string, unknown>;
  const issueSummary = {
    critical: int(issue.critical),
    warning: int(issue.warning),
    info: int(issue.info),
    total: int(issue.total),
  };

  const topFindings = parseFindings(body.topFindings);

  if (!handoffId || !clientId || !clientName) {
    return NextResponse.json(
      { error: "handoffId, clientId and clientName are required." },
      { status: 422 }
    );
  }

  const serviceLabel = SERVICE_LABELS[normalizedServiceType] || serviceType || "Audit Handoff";
  // Deterministic synthetic email: VisBoost handoffs carry no contact email, and
  // Lead.email is required. Keying it on clientId also lets repeat handoffs find
  // the same Lead even if the marker table is ever wiped.
  const syntheticEmail = `handoff+${clientId}@clients.visboost`;

  try {
    // Idempotency: a retry of the same handoff short-circuits to the linked IDs.
    const existing = await prisma.visboostHandoff.findUnique({
      where: { handoffId },
    });
    if (existing) {
      return NextResponse.json(
        {
          ok: true,
          idempotent: true,
          handoffId,
          leadId: existing.leadId,
          noteId: existing.noteId,
          activityId: existing.activityId,
        },
        { status: 200 }
      );
    }

    // Build the human-readable audit context preserved on the Note + Lead.
    const scoreText = overallScore === null ? "N/A" : String(overallScore);
    const findingsText = topFindings.length
      ? topFindings
          .map(
            (f, i) =>
              `${i + 1}. [${f.category || "general"}] ${f.title}\n   → ${f.recommendation}`
          )
          .join("\n")
      : "(none provided)";

    const summaryLine =
      `VisBoost audit handoff — ${serviceLabel}. ` +
      `Score: ${scoreText}. ` +
      `Issues: ${issueSummary.critical} critical / ${issueSummary.warning} warning / ` +
      `${issueSummary.info} info (${issueSummary.total} total).`;

    const noteBody = [
      `VisBoost Audit Handoff`,
      ``,
      `Client: ${clientName}`,
      url ? `URL: ${url}` : null,
      `Service type: ${serviceLabel}`,
      `Overall score: ${scoreText}`,
      `Issues: ${issueSummary.critical} critical, ${issueSummary.warning} warning, ` +
        `${issueSummary.info} info (${issueSummary.total} total)`,
      ``,
      `Top findings:`,
      findingsText,
      ``,
      notes ? `Analyst notes: ${notes}` : null,
      ``,
      `— Source IDs —`,
      `handoffId: ${handoffId}`,
      auditId ? `auditId: ${auditId}` : null,
      `clientId: ${clientId}`,
    ]
      .filter((line) => line !== null)
      .join("\n");

    const result = await prisma.$transaction(async (tx) => {
      // Attach to an existing Lead for this client when one exists (prior
      // handoff, or a Lead carrying our synthetic email); otherwise create one.
      const priorHandoff = await tx.visboostHandoff.findFirst({
        where: { clientId, leadId: { not: null } },
        orderBy: { createdAt: "desc" },
        select: { leadId: true },
      });

      let lead =
        (priorHandoff?.leadId
          ? await tx.lead.findUnique({ where: { id: priorHandoff.leadId } })
          : null) ?? (await tx.lead.findFirst({ where: { email: syntheticEmail } }));

      if (!lead) {
        lead = await tx.lead.create({
          data: {
            name: clientName,
            email: syntheticEmail,
            website: url || null,
            source: "VisBoost Audit Handoff",
            status: "NEW",
            description: summaryLine,
          },
        });
      } else {
        // Keep the existing Lead fresh and reflect the latest handoff context.
        lead = await tx.lead.update({
          where: { id: lead.id },
          data: {
            website: url || lead.website,
            description: summaryLine,
            lastContactedAt: new Date(),
          },
        });
      }

      const note = await tx.note.create({
        data: { body: noteBody, leadId: lead.id },
      });

      const activity = await tx.activity.create({
        data: {
          type: "TASK",
          subject: `Review VisBoost audit handoff: ${clientName} (${serviceLabel})`,
          description: summaryLine,
          leadId: lead.id,
          ownerId: lead.ownerId,
        },
      });

      const marker = await tx.visboostHandoff.create({
        data: {
          handoffId,
          auditId: auditId || null,
          clientId,
          serviceType: normalizedServiceType || null,
          overallScore: overallScore === null ? null : Math.round(overallScore),
          leadId: lead.id,
          noteId: note.id,
          activityId: activity.id,
        },
      });

      return { leadId: lead.id, noteId: note.id, activityId: activity.id, markerId: marker.id };
    });

    return NextResponse.json(
      {
        ok: true,
        idempotent: false,
        handoffId,
        leadId: result.leadId,
        noteId: result.noteId,
        activityId: result.activityId,
        handoffRecordId: result.markerId,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/ingest/visboost-handoff failed:", err);
    return NextResponse.json(
      { error: "Failed to ingest VisBoost handoff." },
      { status: 500 }
    );
  }
}
