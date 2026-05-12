import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const VALID_STAGES = [
  "PROSPECT",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get("stage");
    const leadId = searchParams.get("leadId");

    const where: Prisma.DealWhereInput = {};
    if (stage && (VALID_STAGES as readonly string[]).includes(stage)) {
      where.stage = stage as (typeof VALID_STAGES)[number];
    }
    if (leadId) where.leadId = leadId;

    const deals = await prisma.deal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        lead: { select: { id: true, name: true, company: true, email: true } },
        owner: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(deals);
  } catch (err) {
    console.error("GET /api/admin/crm/deals failed:", err);
    return NextResponse.json({ error: "Failed to load deals." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      value,
      currency,
      stage,
      probability,
      expectedCloseDate,
      leadId,
      ownerId,
    } = body;

    if (!title || typeof value !== "number") {
      return NextResponse.json(
        { error: "title and numeric value are required." },
        { status: 400 }
      );
    }

    if (stage && !(VALID_STAGES as readonly string[]).includes(stage)) {
      return NextResponse.json({ error: "Invalid stage." }, { status: 400 });
    }

    const deal = await prisma.deal.create({
      data: {
        title,
        value,
        currency: currency || "usd",
        stage: stage || "PROSPECT",
        probability: typeof probability === "number" ? probability : 10,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        leadId: leadId || null,
        ownerId: ownerId || null,
      },
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/crm/deals failed:", err);
    return NextResponse.json({ error: "Failed to create deal." }, { status: 500 });
  }
}
