import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { runAudit } from "@/lib/audit";

/**
 * Audit jobs API.
 *
 *   POST /api/audits   — create a new AuditJob and trigger the runner
 *   GET  /api/audits   — list recent audits (admin only)
 *
 * The audit runs in the same request handler. We bump `maxDuration` to 300s
 * (Vercel's hard cap on Hobby/Pro is 300s for serverless functions) per the
 * decision in plan section 10.
 */
export const maxDuration = 300;

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "Unauthorized.", status: 401 as const };
  }
  if ((session.user as { role?: string }).role !== "ADMIN") {
    return { error: "Forbidden.", status: 403 as const };
  }
  return { session };
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  let body: { url?: string; clientName?: string; crawlLimit?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const url = (body.url ?? "").trim();
  const clientName = (body.clientName ?? "").trim();

  if (!url || !clientName) {
    return NextResponse.json(
      { error: "Both `url` and `clientName` are required." },
      { status: 400 }
    );
  }

  if (!isValidHttpUrl(url)) {
    return NextResponse.json(
      { error: "`url` must be a valid http:// or https:// URL." },
      { status: 400 }
    );
  }

  const userId = (guard.session.user as { id?: string }).id ?? null;

  const job = await prisma.auditJob.create({
    data: {
      url,
      clientName,
      status: "PENDING",
      createdBy: userId,
    },
  });

  // Run the audit in the same request. The runner updates job status to
  // RUNNING / COMPLETED / FAILED and persists the AuditResult itself.
  // We don't await — but we DO need to keep the function alive until it
  // resolves on serverless. Easiest correct option: await it. The route's
  // maxDuration covers the full audit window.
  try {
    await runAudit(job.id, {
      url,
      clientName,
      crawlLimit: body.crawlLimit,
    });
  } catch (err) {
    // The runner already marked the job FAILED. Surface the error to the
    // caller so the UI can show it without polling.
    return NextResponse.json(
      {
        jobId: job.id,
        status: "FAILED",
        error: err instanceof Error ? err.message : "Audit failed.",
      },
      { status: 500 }
    );
  }

  // Reload to include the result.
  const completed = await prisma.auditJob.findUnique({
    where: { id: job.id },
    include: { result: true },
  });

  return NextResponse.json(completed, { status: 201 });
}

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const jobs = await prisma.auditJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      result: {
        select: {
          overallScore: true,
          technicalScore: true,
          onPageScore: true,
          backlinkScore: true,
          localSeoScore: true,
        },
      },
    },
  });

  return NextResponse.json(jobs);
}

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
