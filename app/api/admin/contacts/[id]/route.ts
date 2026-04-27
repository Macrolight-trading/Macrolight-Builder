import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const VALID_STATUSES = ["NEW", "READ", "REPLIED", "ARCHIVED"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: NEW, READ, REPLIED, ARCHIVED." },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(contact);
  } catch {
    return NextResponse.json(
      { error: "Failed to update contact." },
      { status: 500 }
    );
  }
}
