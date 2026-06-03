import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { UIMessage } from "ai";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createOnboardingChatResponse } from "@/lib/onboarding/chat-stream";

export const runtime = "nodejs";
export const maxDuration = 120;

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") return null;
  return session;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { id: true },
  });
  if (!client) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  try {
    return await createOnboardingChatResponse(params.userId, messages ?? []);
  } catch (err) {
    console.error("[admin/onboarding/chat] failed:", err);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
