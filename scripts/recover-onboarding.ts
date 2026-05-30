import { PrismaClient } from "@prisma/client";
import {
  completeOnboarding,
  completeOnboardingSchema,
} from "../lib/onboarding/complete";

const prisma = new PrismaClient();

async function main() {
  const row = await prisma.onboardingData.findFirst({
    orderBy: { updatedAt: "desc" },
    where: { completedAt: null },
    select: { userId: true, chatMessages: true },
  });

  if (!row?.chatMessages || !Array.isArray(row.chatMessages)) {
    console.log("No stuck onboarding session found.");
    return;
  }

  const messages = row.chatMessages as Array<{
    role?: string;
    parts?: Array<{ type?: string; state?: string; input?: unknown }>;
  }>;

  for (const message of [...messages].reverse()) {
    if (message.role !== "assistant" || !Array.isArray(message.parts)) continue;

    for (const part of message.parts) {
      if (part.type !== "tool-completeOnboarding") continue;
      if (part.state === "output-available") continue;

      const parsed = completeOnboardingSchema.safeParse(part.input);
      if (!parsed.success) {
        console.log("Tool input invalid:", parsed.error.flatten());
        continue;
      }

      const result = await completeOnboarding(row.userId, parsed.data);
      console.log("Recovered:", result);
      return;
    }
  }

  console.log("No recoverable stuck tool call found.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
