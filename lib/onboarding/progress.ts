import type { UIMessage } from "ai";

export const ONBOARDING_PHASES = [
  { id: "contact", label: "Contact & location" },
  { id: "business", label: "Business basics" },
  { id: "vision", label: "Website vision & goals" },
  { id: "services", label: "Services & audience" },
  { id: "content", label: "Pages & content" },
  { id: "brand", label: "Brand & design" },
  { id: "review", label: "Review & submit" },
] as const;

const REVIEW_PATTERN =
  /look correct|does everything|confirm|submit this|ready to submit|summary/i;

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => (part as { type: "text"; text: string }).text)
    .join("");
}

function getLastAssistantText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "assistant") {
      return getMessageText(messages[i]!);
    }
  }
  return "";
}

function getPhaseFromUserCount(userCount: number) {
  if (userCount <= 0) {
    return { label: "Getting started", index: -1 };
  }
  if (userCount <= 2) {
    return { label: ONBOARDING_PHASES[0].label, index: 0 };
  }
  if (userCount <= 3) {
    return { label: ONBOARDING_PHASES[1].label, index: 1 };
  }
  if (userCount <= 6) {
    return { label: ONBOARDING_PHASES[2].label, index: 2 };
  }
  if (userCount <= 8) {
    return { label: ONBOARDING_PHASES[3].label, index: 3 };
  }
  if (userCount <= 10) {
    return { label: ONBOARDING_PHASES[4].label, index: 4 };
  }
  if (userCount <= 12) {
    return { label: ONBOARDING_PHASES[5].label, index: 5 };
  }
  return { label: ONBOARDING_PHASES[6].label, index: 6 };
}

/** Roughly 13 user answers before the final confirmation step. */
const ESTIMATED_ANSWERS = 13;

export function calculateOnboardingProgress(
  messages: UIMessage[],
  isCompleted: boolean,
): { percent: number; phase: string; phaseIndex: number } {
  if (isCompleted) {
    return { percent: 100, phase: "Brief complete", phaseIndex: ONBOARDING_PHASES.length };
  }

  const userCount = messages.filter((message) => message.role === "user").length;
  const lastAssistantText = getLastAssistantText(messages);
  const isReviewPhase = REVIEW_PATTERN.test(lastAssistantText);

  if (isReviewPhase) {
    return {
      percent: 92,
      phase: ONBOARDING_PHASES[6].label,
      phaseIndex: 6,
    };
  }

  const { label, index } = getPhaseFromUserCount(userCount);
  const linear = userCount <= 0 ? 0 : 8 + (userCount / ESTIMATED_ANSWERS) * 84;

  return {
    percent: Math.min(91, Math.round(linear)),
    phase: label,
    phaseIndex: index,
  };
}
