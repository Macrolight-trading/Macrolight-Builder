import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Convert a Contact submission into a CRM Lead. Idempotent — if a lead
// already exists for the contact, returns the existing lead.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact) {
      return NextResponse.json({ error: "Contact not found." }, { status: 404 });
    }

    const existing = await prisma.lead.findUnique({ where: { contactId: id } });
    if (existing) {
      return NextResponse.json(existing);
    }

    const lead = await prisma.lead.create({
      data: {
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        industry: contact.industry,
        description: contact.message,
        source: "website",
        status: "NEW",
        contactId: contact.id,
      },
    });

    // Mark contact as read so it doesn't keep showing up as NEW.
    if (contact.status === "NEW") {
      await prisma.contact.update({
        where: { id: contact.id },
        data: { status: "READ" },
      });
    }

    return NextResponse.json(lead, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/crm/contacts/[id]/convert failed:", err);
    return NextResponse.json(
      { error: "Failed to convert contact." },
      { status: 500 }
    );
  }
}
