import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/hermes/client/[userId]
 * Returns full client context for the Hermes bootstrap agent.
 * Auth: x-hermes-secret header.
 */

function authorized(req: NextRequest): boolean {
  const secret = process.env.HERMES_API_SECRET;
  if (!secret) return false;
  return req.headers.get("x-hermes-secret") === secret;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      plan: true,
      stripeCustomerId: true,
      createdAt: true,
      onboarding: true,
      project: true,
      subscriptions: {
        where: { status: "ACTIVE" },
        select: {
          stripeSubscriptionId: true,
          basePlan: true,
          status: true,
          currentPeriodEnd: true,
          items: { select: { nameSnapshot: true, priceCents: true, billingType: true } },
        },
        take: 1,
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
