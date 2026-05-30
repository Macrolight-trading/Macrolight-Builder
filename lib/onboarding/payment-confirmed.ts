import prisma from "@/lib/prisma";
import { enqueueHermesEvent } from "@/lib/hermes";
import { getHermesBriefApiUrl } from "@/lib/onboarding/brief";

type PaymentConfirmedOptions = {
  test?: boolean;
  sessionId?: string;
  amountTotal?: number;
  currency?: string;
  plan?: string;
  stripeCustomerId?: string | null;
  requireBrief?: boolean;
};

/**
 * Enqueue Hermes payment_confirmed with the user's onboarding brief —
 * same payload shape as checkout.session.completed in the Stripe webhook.
 */
export async function enqueuePaymentConfirmedForUser(
  userId: string,
  options: PaymentConfirmedOptions = {},
): Promise<{
  briefMarkdownUrl: string | null;
  briefApiUrl: string | null;
  businessName: string | null;
}> {
  const [user, onboarding] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, stripeCustomerId: true },
    }),
    prisma.onboardingData.findUnique({
      where: { userId },
      select: { briefMarkdownUrl: true, businessName: true, completedAt: true },
    }),
  ]);

  if (!user) {
    throw new Error("User not found");
  }

  if (options.requireBrief && !onboarding?.briefMarkdownUrl) {
    throw new Error(
      "Complete onboarding and save a brief before testing payment delivery",
    );
  }

  const briefMarkdownUrl = onboarding?.briefMarkdownUrl ?? null;
  const briefApiUrl = briefMarkdownUrl ? getHermesBriefApiUrl(userId) : null;

  await enqueueHermesEvent("payment_confirmed", userId, {
    test: options.test ?? false,
    plan: options.plan ?? user.plan,
    amountTotal: options.amountTotal ?? 0,
    currency: options.currency ?? "usd",
    stripeCustomerId: options.stripeCustomerId ?? user.stripeCustomerId,
    sessionId: options.sessionId ?? `test_${Date.now()}`,
    briefMarkdownUrl,
    briefApiUrl,
    onboardingComplete: !!onboarding?.completedAt,
    businessName: onboarding?.businessName ?? null,
  });

  return {
    briefMarkdownUrl,
    briefApiUrl,
    businessName: onboarding?.businessName ?? null,
  };
}
