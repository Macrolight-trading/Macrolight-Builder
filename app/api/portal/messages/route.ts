import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { sendEmail, getNotificationEmails } from "@/lib/email";
import { clientMessageAdminEmailHtml, adminMessageClientEmailHtml } from "@/lib/email-templates";

const schema = z.object({
  body: z.string().min(1).max(5000),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  // Admins can pass ?userId= to view a specific client's thread
  const targetUserId = isAdmin
    ? (req.nextUrl.searchParams.get("userId") ?? userId)
    : userId;

  const messages = await prisma.message.findMany({
    where: { userId: targetUserId },
    orderBy: { createdAt: "asc" },
  });

  // Mark unread admin messages as read for the client (client is reading)
  if (!isAdmin) {
    await prisma.message.updateMany({
      where: { userId, fromAdmin: true, readAt: null },
      data: { readAt: new Date() },
    });
  }

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  const body = await req.json();

  // Admins send on behalf of a target user
  const targetUserId = isAdmin
    ? (body.userId ?? userId)
    : userId;

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const message = await prisma.message.create({
    data: {
      userId: targetUserId,
      fromAdmin: isAdmin,
      body: parsed.data.body,
    },
  });

  // Cross-notify the other party
  if (isAdmin) {
    // Admin sent a message → email the client
    const client = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { name: true, email: true },
    });
    if (client) {
      sendEmail({
        to: client.email,
        subject: "New message from Macrolight",
        html: adminMessageClientEmailHtml({ name: client.name, body: parsed.data.body }),
      }).catch((err) => console.error("Admin→client message email failed:", err));
    }
  } else {
    // Client sent a message → email the admin
    const notificationEmails = getNotificationEmails();
    if (notificationEmails.length > 0) {
      const client = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { name: true, email: true },
      });
      if (client) {
        sendEmail({
          to: notificationEmails,
          subject: `New message from ${client.name ?? client.email}`,
          html: clientMessageAdminEmailHtml({
            name: client.name,
            email: client.email,
            body: parsed.data.body,
          }),
        }).catch((err) => console.error("Client→admin message email failed:", err));
      }
    }
  }

  return NextResponse.json(message, { status: 201 });
}
