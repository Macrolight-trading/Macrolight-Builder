import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { newLeadEmailHtml } from "@/lib/email-templates";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message, business } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        message,
        company: business || null,
      },
    });

    // Send notification email (non-blocking)
    sendEmail({
      to: "bbayley50@gmail.com",
      subject: `New lead: ${name} from ${business || "Unknown"}`,
      html: newLeadEmailHtml({ name, email, company: business, message, industry: "" }),
    }).catch(console.error);

    return NextResponse.json(contact, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create contact." },
      { status: 500 }
    );
  }
}
