import type { UIMessage } from "ai";
import prisma from "@/lib/prisma";
import {
  completeOnboarding,
  completeOnboardingSchema,
} from "@/lib/onboarding/complete";

type ToolPart = {
  type?: string;
  state?: string;
  input?: unknown;
};

/** Finish onboarding when a tool call streamed input but never executed. */
export async function recoverStuckOnboardingIfNeeded(
  userId: string,
  messages: UIMessage[],
): Promise<boolean> {
  const existing = await prisma.onboardingData.findUnique({
    where: { userId },
    select: { completedAt: true },
  });
  if (existing?.completedAt) return false;

  for (const message of [...messages].reverse()) {
    if (message.role !== "assistant") continue;

    for (const part of (message.parts ?? []) as ToolPart[]) {
      if (part.type !== "tool-completeOnboarding") continue;
      if (part.state === "output-available") continue;

      const parsed = completeOnboardingSchema.safeParse(part.input);
      if (!parsed.success) continue;

      try {
        await completeOnboarding(userId, parsed.data);
        console.info(
          `[onboarding/recover] Completed stuck brief for user ${userId}`,
        );
        return true;
      } catch (err) {
        console.error("[onboarding/recover] Failed to recover brief:", err);
      }
    }
  }

  return false;
}
