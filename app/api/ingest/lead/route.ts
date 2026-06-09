import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Server-to-server lead ingestion for Macrolight-built client websites.
 *
 * POST /api/ingest/lead — create a CRM Contact + Lead from a website
 * contact-form submission. Designed to be called by client sites (e.g. the
 * Kamm 2 Merchant Services site), never by the browser.
 *
 * Auth: LEAD_INGEST_SECRET, sent as the x-ingest-secret request header.
 *
 * Owner assignment: pass `ownerEmail` to scope the resulting Lead to a portal
 * user (so it appears on that user's /portal/leads page). If the email doesn't
 * match a user, the Lead is still created but left unassigned (ownerId = null),
 * so submissions are never lost.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const secret = process.env.LEAD_INGEST_SECRET;
  if (!secret) return false;
  return req.headers.get("x-ingest-secret") === secret;
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
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

  const name = str(body.name);
  const email = str(body.email);
  const message = str(body.message);
  const phone = str(body.phone);
  const company = str(body.company);
  const industry = str(body.industry);
  const website = str(body.website);
  const source = str(body.source) || "website";
  const ownerEmail = str(body.ownerEmail);

  if (!name || !email) {
    return NextResponse.json(
      { error: "name and email are required." },
      { status: 422 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 422 });
  }

  try {
    // Resolve the portal user that should own this lead, if provided.
    let ownerId: string | null = null;
    if (ownerEmail) {
      const owner = await prisma.user.findUnique({
        where: { email: ownerEmail },
        select: { id: true },
      });
      ownerId = owner?.id ?? null;
    }

    // Create the Contact + linked Lead atomically so the CRM stays consistent.
    const lead = await prisma.$transaction(async (tx) => {
      const contact = await tx.contact.create({
        data: {
          name,
          email,
          phone: phone || null,
          company: company || null,
          industry: industry || null,
          message: message || "(no message provided)",
        },
      });

      const created = await tx.lead.create({
        data: {
          name,
          email,
          phone: phone || null,
          company: company || null,
          industry: industry || null,
          website: website || null,
          description: message || null,
          source,
          status: "NEW",
          contactId: contact.id,
          ownerId,
        },
      });

      // Log the inbound submission as an activity so it surfaces on the
      // portal leads page and gives the owner an immediate follow-up record.
      await tx.activity.create({
        data: {
          type: "NOTE",
          subject: `New ${source} submission from ${name}`,
          description: message || null,
          leadId: created.id,
          ownerId,
        },
      });

      return created;
    });

    return NextResponse.json(
      { ok: true, leadId: lead.id, contactId: lead.contactId, assigned: ownerId !== null },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/ingest/lead failed:", err);
    return NextResponse.json(
      { error: "Failed to ingest lead." },
      { status: 500 }
    );
  }
}
