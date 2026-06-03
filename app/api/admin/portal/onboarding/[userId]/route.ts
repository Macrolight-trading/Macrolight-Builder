import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const patchSchema = z
  .object({
    completed: z.boolean().optional(),
    chatMessages: z.array(z.unknown()).optional(),
  })
  .refine(
    (data) => data.completed !== undefined || data.chatMessages !== undefined,
    { message: "Provide completed and/or chatMessages" },
  );

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") return null;
  return session;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (parsed.data.chatMessages) {
    await prisma.onboardingData.upsert({
      where: { userId: params.userId },
      create: {
        userId: params.userId,
        chatMessages: parsed.data.chatMessages as Prisma.InputJsonValue,
      },
      update: {
        chatMessages: parsed.data.chatMessages as Prisma.InputJsonValue,
      },
    });
  }

  if (parsed.data.completed !== undefined) {
    const completedAt = parsed.data.completed ? new Date() : null;

    await prisma.onboardingData.upsert({
      where: { userId: params.userId },
      create: { userId: params.userId, completedAt },
      update: { completedAt },
    });

    if (parsed.data.completed) {
      const project = await prisma.project.findUnique({
        where: { userId: params.userId },
        select: { stage: true },
      });
      if (!project || project.stage === "ONBOARDING") {
        await prisma.project.upsert({
          where: { userId: params.userId },
          create: { userId: params.userId, stage: "DESIGN" },
          update: { stage: "DESIGN" },
        });
      }
    }
  }

  const onboarding = await prisma.onboardingData.findUnique({
    where: { userId: params.userId },
    select: { completedAt: true },
  });

  return NextResponse.json({
    completedAt: onboarding?.completedAt ?? null,
    completed: !!onboarding?.completedAt,
  });
}
