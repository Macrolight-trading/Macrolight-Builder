import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

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

  return NextResponse.json(message, { status: 201 });
}
