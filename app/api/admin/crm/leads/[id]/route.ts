import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const VALID_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "UNQUALIFIED",
  "CONVERTED",
  "LOST",
] as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        contact: true,
        owner: { select: { id: true, name: true, email: true } },
        deals: { orderBy: { createdAt: "desc" } },
        activities: {
          orderBy: { createdAt: "desc" },
          include: { owner: { select: { name: true, email: true } } },
        },
        noteRecords: {
          orderBy: { createdAt: "desc" },
          include: { author: { select: { name: true, email: true } } },
        },
        tags: { include: { tag: true } },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (err) {
    console.error("GET /api/admin/crm/leads/[id] failed:", err);
    return NextResponse.json({ error: "Failed to load lead." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.status && !(VALID_STATUSES as readonly string[]).includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const allowed = [
      "name",
      "email",
      "phone",
      "company",
      "jobTitle",
      "industry",
      "website",
      "source",
      "status",
      "value",
      "description",
      "ownerId",
      "lastContactedAt",
    ] as const;

    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) data[key] = body[key];
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    const lead = await prisma.lead.update({
      where: { id },
      data,
    });

    return NextResponse.json(lead);
  } catch (err) {
    console.error("PATCH /api/admin/crm/leads/[id] failed:", err);
    return NextResponse.json({ error: "Failed to update lead." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/crm/leads/[id] failed:", err);
    return NextResponse.json({ error: "Failed to delete lead." }, { status: 500 });
  }
}
