import type { Plan } from "@prisma/client";

export type BaseMilestone = {
  slug: string;
  title: string;
  dayOffset: number;
  category: string;
};

const STARTER_MILESTONES: BaseMilestone[] = [
  { slug: "kickoff", title: "Kickoff & access handoff", dayOffset: 0, category: "Onboarding" },
  { slug: "brief", title: "Review onboarding brief & assets", dayOffset: 2, category: "Onboarding" },
  { slug: "design", title: "Design & copy direction", dayOffset: 7, category: "Design" },
  { slug: "build", title: "Development & integrations", dayOffset: 14, category: "Build" },
  { slug: "qa", title: "QA & client review", dayOffset: 18, category: "Review" },
  { slug: "launch", title: "Launch on production", dayOffset: 21, category: "Launch" },
];

const GROWTH_MILESTONES: BaseMilestone[] = [
  { slug: "kickoff", title: "Kickoff & conversion goals", dayOffset: 0, category: "Onboarding" },
  { slug: "brief", title: "Review brief, CRM & lead routing", dayOffset: 2, category: "Onboarding" },
  { slug: "design", title: "Design, copy & funnel map", dayOffset: 7, category: "Design" },
  { slug: "build", title: "Build pages + lead capture", dayOffset: 14, category: "Build" },
  { slug: "analytics", title: "Analytics & tracking QA", dayOffset: 17, category: "Build" },
  { slug: "qa", title: "Client review & revisions", dayOffset: 19, category: "Review" },
  { slug: "launch", title: "Launch on production", dayOffset: 21, category: "Launch" },
];

const PRO_MILESTONES: BaseMilestone[] = [
  { slug: "kickoff", title: "Kickoff & acquisition strategy", dayOffset: 0, category: "Onboarding" },
  { slug: "brief", title: "Review brief & automation map", dayOffset: 3, category: "Onboarding" },
  { slug: "design", title: "Design system & funnel architecture", dayOffset: 10, category: "Design" },
  { slug: "build", title: "Build funnels & integrations", dayOffset: 18, category: "Build" },
  { slug: "chatbot", title: "AI chatbot & CRM wiring", dayOffset: 22, category: "Build" },
  { slug: "qa", title: "QA, A/B setup & client review", dayOffset: 26, category: "Review" },
  { slug: "launch", title: "Launch on production", dayOffset: 30, category: "Launch" },
];

export function basePlanMilestones(plan: Plan): BaseMilestone[] {
  switch (plan) {
    case "STARTER":
      return STARTER_MILESTONES;
    case "GROWTH":
      return GROWTH_MILESTONES;
    case "PRO":
      return PRO_MILESTONES;
    default:
      return STARTER_MILESTONES;
  }
}

export function baseSourceKey(plan: Plan, slug: string): string {
  return `base:${plan}:${slug}`;
}

export function lineItemSourceKey(
  optionId: string | null,
  name: string,
  billingType: "ONE_TIME" | "MONTHLY",
): string {
  const id = optionId ?? name.toLowerCase().replace(/\s+/g, "-").slice(0, 40);
  return billingType === "MONTHLY" ? `addon:${id}:monthly` : `addon:${id}:onetime`;
}

/** Default day offset for a one-time add-on deliverable. */
export function oneTimeAddonDayOffset(category: string): number {
  const c = category.toLowerCase();
  if (c.includes("design") || c.includes("brand")) return 10;
  if (c.includes("content") || c.includes("copy")) return 12;
  if (c.includes("seo")) return 16;
  if (c.includes("integration") || c.includes("crm")) return 14;
  return 14;
}
