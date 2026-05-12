import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const VALID_TYPES = ["CALL", "EMAIL", "MEETING", "TASK", "NOTE"] as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");
    const dealId = searchParams.get("dealId");
    const open = searchParams.get("open"); // "true" -> only uncompleted

    const where: Prisma.ActivityWhereInput = {};
    if (leadId) where.leadId = leadId;
    if (dealId) where.dealId = dealId;
    if (open === "true") where.completedAt = null;

    const activities = await prisma.activity.findMany({
      where,
      orderBy: [{ completedAt: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
      include: {
        lead: { select: { id: true, name: true, company: true } },
        deal: { select: { id: true, title: true } },
        owner: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(activities);
  } catch (err) {
    console.error("GET /api/admin/crm/activities failed:", err);
    return NextResponse.json({ error: "Failed to load activities." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, subject, description, dueDate, leadId, dealId, ownerId } = body;

    if (!type || !(VALID_TYPES as readonly string[]).includes(type)) {
      return NextResponse.json({ error: "Invalid activity type." }, { status: 400 });
    }

    if (!subject) {
      return NextResponse.json({ error: "subject is required." }, { status: 400 });
    }

    const activity = await prisma.activity.create({
      data: {
        type,
        subject,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        leadId: leadId || null,
        dealId: dealId || null,
        ownerId: ownerId || null,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/crm/activities failed:", err);
    return NextResponse.json({ error: "Failed to create activity." }, { status: 500 });
  }
}
