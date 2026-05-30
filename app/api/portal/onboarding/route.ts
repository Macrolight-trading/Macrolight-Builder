import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const patchSchema = z.object({
  chatMessages: z.array(z.unknown()),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await prisma.onboardingData.findUnique({ where: { userId } });
  return NextResponse.json(data ?? {});
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const chatMessages = parsed.data.chatMessages as Prisma.InputJsonValue;

  const data = await prisma.onboardingData.upsert({
    where: { userId },
    create: {
      userId,
      chatMessages,
    },
    update: {
      chatMessages,
    },
  });

  return NextResponse.json(data);
}
