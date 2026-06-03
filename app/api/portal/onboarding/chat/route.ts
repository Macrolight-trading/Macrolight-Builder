import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { UIMessage } from "ai";
import { authOptions } from "@/lib/auth";
import { createOnboardingChatResponse } from "@/lib/onboarding/chat-stream";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  try {
    return await createOnboardingChatResponse(userId, messages ?? []);
  } catch (err) {
    console.error("[onboarding/chat] failed:", err);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
