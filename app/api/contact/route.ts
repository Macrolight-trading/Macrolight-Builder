import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail, getNotificationEmails } from "@/lib/email";
import { newLeadEmailHtml, contactAutoReplyEmailHtml } from "@/lib/email-templates";
import { uploadGoogleAdsConversion } from "@/lib/google-ads";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message, company, industry, phone, gclid } = body;

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
        phone: phone || null,
      },
    });

    // Send notification email and track delivery
    const notificationEmails = getNotificationEmails();
    if (notificationEmails.length > 0) {
      try {
        const result = await sendEmail({
          to: notificationEmails,
          subject: `New lead: ${name} from ${company || "Unknown"}`,
          html: newLeadEmailHtml({
            name,
            email,
            company,
            message,
            industry: industry || "",
            phone: phone || "",
          }),
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

    // Auto-reply confirmation to the person who submitted the form
    sendEmail({
      to: email,
      subject: "We received your message — Macrolight",
      html: contactAutoReplyEmailHtml({ name }),
    }).catch((err) => console.error("Contact auto-reply failed:", err));

    // Fire Google Ads conversion (non-blocking — never throws).
    if (gclid && typeof gclid === "string") {
      uploadGoogleAdsConversion({ gclid }).catch(() => {});
    }

    return NextResponse.json(contact, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create contact." },
      { status: 500 }
    );
  }
}

