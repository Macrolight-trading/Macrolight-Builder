import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { body: noteBody, leadId, dealId, authorId } = body;

    if (!noteBody || typeof noteBody !== "string") {
      return NextResponse.json({ error: "body is required." }, { status: 400 });
    }
    if (!leadId && !dealId) {
      return NextResponse.json(
        { error: "Either leadId or dealId is required." },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        body: noteBody,
        leadId: leadId || null,
        dealId: dealId || null,
        authorId: authorId || null,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/crm/notes failed:", err);
    return NextResponse.json({ error: "Failed to create note." }, { status: 500 });
  }
}
