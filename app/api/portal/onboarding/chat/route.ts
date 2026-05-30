import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { buildOnboardingSystemPrompt } from "@/lib/onboarding/prompt";
import {
  completeOnboarding,
  completeOnboardingSchema,
} from "@/lib/onboarding/complete";
import { getOnboardingModel } from "@/lib/ai/model";
import { recoverStuckOnboardingIfNeeded } from "@/lib/onboarding/recover";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      phone: true,
      onboarding: { select: { completedAt: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const system = buildOnboardingSystemPrompt({
    userName: user.name,
    userEmail: user.email,
    userPhone: user.phone,
    hasCompletedBrief: !!user.onboarding?.completedAt,
  });

  const result = streamText({
    model: getOnboardingModel(),
    system,
    messages: await convertToModelMessages(messages ?? []),
    stopWhen: stepCountIs(5),
    tools: {
      completeOnboarding: tool({
        description:
          "Finalize the onboarding brief after the user explicitly confirms the summary. Stores structured data and a markdown build brief.",
        inputSchema: completeOnboardingSchema,
        execute: async (input) => {
          try {
            const { briefMarkdownUrl, briefPathname } = await completeOnboarding(
              userId,
              input,
            );
            return {
              success: true,
              briefMarkdownUrl,
              briefPathname,
              message:
                "Brief saved successfully. The client can continue uploading media at /portal/media.",
            };
          } catch (err) {
            console.error("[onboarding/chat] completeOnboarding failed:", err);
            throw err;
          }
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse({
    onFinish: async ({ messages: updatedMessages }) => {
      try {
        await recoverStuckOnboardingIfNeeded(userId, updatedMessages);

        await prisma.onboardingData.upsert({
          where: { userId },
          create: {
            userId,
            chatMessages: updatedMessages as unknown as Prisma.InputJsonValue,
          },
          update: {
            chatMessages: updatedMessages as unknown as Prisma.InputJsonValue,
          },
        });
      } catch (err) {
        console.error("[onboarding/chat] Failed to save transcript:", err);
      }
    },
  });
}
