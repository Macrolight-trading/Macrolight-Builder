import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe Billing Portal session for the current user so they can
 * update payment methods, cancel, change billing email, and download
 * invoices without us building any of that UI.
 *
 * Body (optional):
 *   { returnUrl?: string }   // defaults to /portal/billing
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (!user.stripeCustomerId) {
      return NextResponse.json(
        {
          error:
            "No Stripe customer for this user. Complete a checkout first.",
        },
        { status: 400 },
      );
    }

    const body = await request.json().catch(() => null);
    const returnUrl =
      typeof body?.returnUrl === "string"
        ? body.returnUrl
        : `${request.nextUrl.origin}/portal/billing`;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Stripe billing portal error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create billing portal session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
