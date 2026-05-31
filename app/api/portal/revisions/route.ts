import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { enqueueHermesEvent } from "@/lib/hermes";

/**
 * POST /api/portal/revisions
 *
 * Called by ReviewFeedbackForm when a client submits revision feedback.
 * Enqueues a revision_submitted HermesEvent so the local Hermes agent
 * picks it up and runs Claude Code to apply the changes.
 *
 * Body: { feedback: string }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { feedback } = (await req.json()) as { feedback?: string };
  if (!feedback?.trim()) {
    return NextResponse.json({ error: "feedback is required" }, { status: 422 });
  }

  // Fetch project and onboarding so the agent has full context
  const [project, onboarding, user] = await Promise.all([
    prisma.project.findUnique({ where: { userId } }),
    prisma.onboardingData.findUnique({ where: { userId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),
  ]);

  if (!project) {
    return NextResponse.json({ error: "No project found" }, { status: 404 });
  }

  await enqueueHermesEvent("revision_submitted", userId, {
    feedback: feedback.trim(),
    businessName: onboarding?.businessName ?? null,
    previewUrl: project.previewUrl ?? null,
    liveUrl: project.liveUrl ?? null,
    stage: project.stage,
    projectId: project.id,
    userName: user?.name ?? null,
    userEmail: user?.email ?? null,
  });

  // Move project back to DEVELOPMENT while changes are applied
  await prisma.project.update({
    where: { userId },
    data: { stage: "DEVELOPMENT" },
  });

  return NextResponse.json({ ok: true });
}
