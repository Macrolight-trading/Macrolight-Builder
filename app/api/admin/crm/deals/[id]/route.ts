import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const VALID_STAGES = [
  "PROSPECT",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        lead: true,
        owner: { select: { id: true, name: true, email: true } },
        activities: { orderBy: { createdAt: "desc" } },
        noteRecords: {
          orderBy: { createdAt: "desc" },
          include: { author: { select: { name: true, email: true } } },
        },
      },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found." }, { status: 404 });
    }

    return NextResponse.json(deal);
  } catch (err) {
    console.error("GET /api/admin/crm/deals/[id] failed:", err);
    return NextResponse.json({ error: "Failed to load deal." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.stage && !(VALID_STAGES as readonly string[]).includes(body.stage)) {
      return NextResponse.json({ error: "Invalid stage." }, { status: 400 });
    }

    const allowed = [
      "title",
      "value",
      "currency",
      "stage",
      "probability",
      "expectedCloseDate",
      "closedAt",
      "lostReason",
      "leadId",
      "ownerId",
    ] as const;

    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) {
        if (key === "expectedCloseDate" || key === "closedAt") {
          data[key] = body[key] ? new Date(body[key]) : null;
        } else {
          data[key] = body[key];
        }
      }
    }

    // Auto-set closedAt when moving to WON / LOST
    if (
      body.stage === "WON" || body.stage === "LOST"
    ) {
      if (!("closedAt" in data) || !data.closedAt) {
        data.closedAt = new Date();
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    const deal = await prisma.deal.update({
      where: { id },
      data,
    });

    return NextResponse.json(deal);
  } catch (err) {
    console.error("PATCH /api/admin/crm/deals/[id] failed:", err);
    return NextResponse.json({ error: "Failed to update deal." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.deal.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/crm/deals/[id] failed:", err);
    return NextResponse.json({ error: "Failed to delete deal." }, { status: 500 });
  }
}
