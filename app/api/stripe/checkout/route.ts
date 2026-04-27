import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const PLAN_PRICES: Record<
  string,
  { buildAmount: number; monthlyAmount: number; name: string }
> = {
  STARTER: { buildAmount: 99900, monthlyAmount: 14900, name: "Starter" },
  GROWTH: { buildAmount: 199900, monthlyAmount: 29900, name: "Growth" },
  PRO: { buildAmount: 349900, monthlyAmount: 49900, name: "Pro" },
};

export async function POST(request: NextRequest) {
  try {
    const { planName, userId } = await request.json();

    if (!planName || !userId) {
      return NextResponse.json(
        { error: "planName and userId are required" },
        { status: 400 }
      );
    }

    const plan = PLAN_PRICES[planName.toUpperCase()];
    if (!plan) {
      return NextResponse.json(
        { error: `Invalid plan: ${planName}` },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${plan.name} Website Build`,
              description: `One-time build fee for the ${plan.name} plan`,
            },
            unit_amount: plan.buildAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        planName: planName.toUpperCase(),
      },
      success_url: `${request.nextUrl.origin}/admin?payment=success`,
      cancel_url: `${request.nextUrl.origin}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
