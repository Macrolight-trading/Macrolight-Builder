import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { buildOnboardingSystemPrompt } from "@/lib/onboarding/prompt";
import {
  completeOnboarding,
  completeOnboardingSchema,
} from "@/lib/onboarding/complete";
import { getOnboardingModel } from "@/lib/ai/model";
import { recoverStuckOnboardingIfNeeded } from "@/lib/onboarding/recover";

export async function createOnboardingChatResponse(
  userId: string,
  messages: UIMessage[],
) {
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
    throw new Error("User not found");
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
