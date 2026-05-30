import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Internal Hermes event queue API.
 *
 * GET  /api/hermes/events          — poll up to 10 PENDING events
 * POST /api/hermes/events          — ack/fail a processed event
 *
 * Auth: HERMES_API_SECRET header (set in .env as HERMES_API_SECRET)
 * This endpoint is never called by the browser — only by the local Hermes agent.
 */

function authorized(req: NextRequest): boolean {
  const secret = process.env.HERMES_API_SECRET;
  if (!secret) return false;
  return req.headers.get("x-hermes-secret") === secret;
}

// GET — return pending events, mark them PROCESSING
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await prisma.hermesEvent.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 10,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          plan: true,
          stripeCustomerId: true,
        },
      },
    },
  });

  if (events.length === 0) {
    return NextResponse.json({ events: [] });
  }

  // Mark as PROCESSING so concurrent polls don't double-process
  await prisma.hermesEvent.updateMany({
    where: { id: { in: events.map((e) => e.id) } },
    data: { status: "PROCESSING" },
  });

  return NextResponse.json({ events });
}

// POST — ack (done or failed) a processed event
const ackSchema = {
  id: "string",
  status: "DONE | FAILED",
  error: "string (optional)",
};

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, status, error } = body as {
    id: string;
    status: "DONE" | "FAILED";
    error?: string;
  };

  if (!id || !["DONE", "FAILED"].includes(status)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
  }

  await prisma.hermesEvent.update({
    where: { id },
    data: {
      status,
      processedAt: new Date(),
      error: error ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
