import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  businessName: z.string().max(200).optional(),
  tagline: z.string().max(300).optional(),
  primaryColor: z.string().max(20).optional(),
  secondaryColor: z.string().max(20).optional(),
  targetAudience: z.string().max(1000).optional(),
  keyServices: z.string().max(1000).optional(),
  competitors: z.string().max(1000).optional(),
  tone: z.string().max(50).optional(),
  themePicks: z.string().max(500).optional(),
  inspirationUrls: z.string().max(2000).optional(),
  additionalNotes: z.string().max(2000).optional(),
  completed: z.boolean().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await prisma.onboardingData.findUnique({ where: { userId } });
  return NextResponse.json(data ?? {});
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { completed, themePicks, inspirationUrls, ...knownFields } = parsed.data;

  // Upsert with the fields the current Prisma client knows about.
  const data = await prisma.onboardingData.upsert({
    where: { userId },
    create: {
      userId,
      ...knownFields,
      completedAt: completed ? new Date() : null,
    },
    update: {
      ...knownFields,
      ...(completed !== undefined
        ? { completedAt: completed ? new Date() : null }
        : {}),
    },
  });

  // Write the two newer columns (themePicks, inspirationUrls) via raw SQL
  // until the Prisma client is regenerated to include them.
  if (themePicks !== undefined || inspirationUrls !== undefined) {
    await prisma.$executeRaw`
      UPDATE onboarding_data
      SET
        "themePicks"      = COALESCE(${themePicks      ?? null}, "themePicks"),
        "inspirationUrls" = COALESCE(${inspirationUrls ?? null}, "inspirationUrls")
      WHERE "userId" = ${userId}
    `;
  }

  // Auto-advance project stage from ONBOARDING → DESIGN when completed
  if (completed) {
    await prisma.project.upsert({
      where: { userId },
      create: { userId, stage: "DESIGN" },
      update: { stage: "DESIGN" },
    });
  }

  return NextResponse.json(data);
}
