import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { newLeadEmailHtml } from "@/lib/email-templates";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message, company, industry } = body;

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
        company: company || null,
        industry: industry || null,
      },
    });

    // Send notification email and track delivery
    const notificationEmail = process.env.LEAD_NOTIFICATION_EMAIL;
    if (notificationEmail) {
      try {
        const result = await sendEmail({
          to: notificationEmail,
          subject: `New lead: ${name} from ${company || "Unknown"}`,
          html: newLeadEmailHtml({ name, email, company, message, industry: industry || "" }),
          replyTo: email,
        });
        if (result) {
          await prisma.contact.update({
            where: { id: contact.id },
            data: { emailSentAt: new Date() },
          });
        }
      } catch (err) {
        console.error("Failed to send lead notification email:", err);
      }
    }

    return NextResponse.json(contact, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create contact." },
      { status: 500 }
    );
  }
}
