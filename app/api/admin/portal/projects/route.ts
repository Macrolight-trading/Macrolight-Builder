import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  userId: z.string().min(1),
  stage: z.enum(["ONBOARDING", "DESIGN", "DEVELOPMENT", "REVIEW", "LAUNCHED"]).optional(),
  liveUrl: z.string().url().optional().or(z.literal("")),
  previewUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().max(2000).optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") return null;
  return session;
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { userId, stage, liveUrl, previewUrl, notes } = parsed.data;

  const project = await prisma.project.upsert({
    where: { userId },
    create: { userId, stage: stage ?? "ONBOARDING", liveUrl: liveUrl || null, previewUrl: previewUrl || null, notes: notes || null },
    update: {
      ...(stage ? { stage } : {}),
      ...(liveUrl !== undefined ? { liveUrl: liveUrl || null } : {}),
      ...(previewUrl !== undefined ? { previewUrl: previewUrl || null } : {}),
      ...(notes !== undefined ? { notes: notes || null } : {}),
    },
  });

  return NextResponse.json(project);
}
