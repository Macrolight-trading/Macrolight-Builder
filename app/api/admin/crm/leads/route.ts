import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const VALID_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "UNQUALIFIED",
  "CONVERTED",
  "LOST",
] as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q");

    const where: Prisma.LeadWhereInput = {};
    if (status && (VALID_STATUSES as readonly string[]).includes(status)) {
      where.status = status as (typeof VALID_STATUSES)[number];
    }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        tags: { include: { tag: true } },
        _count: { select: { deals: true, activities: true, noteRecords: true } },
      },
    });

    return NextResponse.json(leads);
  } catch (err) {
    console.error("GET /api/admin/crm/leads failed:", err);
    return NextResponse.json({ error: "Failed to load leads." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      company,
      jobTitle,
      industry,
      website,
      source,
      status,
      value,
      description,
      ownerId,
      contactId,
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "name and email are required." },
        { status: 400 }
      );
    }

    if (status && !(VALID_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone: phone || null,
        company: company || null,
        jobTitle: jobTitle || null,
        industry: industry || null,
        website: website || null,
        source: source || null,
        status: status || "NEW",
        value: typeof value === "number" ? value : null,
        description: description || null,
        ownerId: ownerId || null,
        contactId: contactId || null,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/crm/leads failed:", err);
    return NextResponse.json({ error: "Failed to create lead." }, { status: 500 });
  }
}
