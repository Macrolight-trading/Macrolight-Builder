import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

/**
 * POST /api/hermes/client/[userId]/project
 * Allows the Hermes agent to update project fields (stage, previewUrl, liveUrl, notes).
 * Auth: x-hermes-secret header.
 */

function authorized(req: NextRequest): boolean {
  const secret = process.env.HERMES_API_SECRET;
  if (!secret) return false;
  return req.headers.get("x-hermes-secret") === secret;
}

const schema = z.object({
  stage: z.enum(["ONBOARDING", "DESIGN", "DEVELOPMENT", "REVIEW", "LAUNCHED"]).optional(),
  previewUrl: z.string().url().optional().or(z.literal("")),
  liveUrl: z.string().url().optional().or(z.literal("")),
  githubRepo: z.string().optional(),
  gaPropertyId: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = params;
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { stage, previewUrl, liveUrl, notes, githubRepo, gaPropertyId } = parsed.data;

  // Build notes string that includes githubRepo and gaPropertyId if provided
  let updatedNotes = notes;
  if (githubRepo || gaPropertyId) {
    const existing = await prisma.project.findUnique({
      where: { userId },
      select: { notes: true },
    });
    const lines: string[] = [];
    if (existing?.notes) lines.push(existing.notes);
    if (githubRepo) lines.push(`github_repo: ${githubRepo}`);
    if (gaPropertyId) lines.push(`ga_property_id: ${gaPropertyId}`);
    updatedNotes = lines.join("\n");
  }

  const project = await prisma.project.upsert({
    where: { userId },
    create: {
      userId,
      stage: stage ?? "DESIGN",
      previewUrl: previewUrl || null,
      liveUrl: liveUrl || null,
      notes: updatedNotes || null,
    },
    update: {
      ...(stage ? { stage } : {}),
      ...(previewUrl !== undefined ? { previewUrl: previewUrl || null } : {}),
      ...(liveUrl !== undefined ? { liveUrl: liveUrl || null } : {}),
      ...(updatedNotes !== undefined ? { notes: updatedNotes } : {}),
    },
  });

  return NextResponse.json({ project });
}
