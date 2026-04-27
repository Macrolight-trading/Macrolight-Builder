import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

async function getUserByEmail(email: string | null | undefined) {
  if (!email) return null;
  return prisma.user.findFirst({ where: { email } });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const user = await getUserByEmail(session.customer_email);

        if (user) {
          await prisma.payment.create({
            data: {
              amount: session.amount_total ?? 0,
              currency: session.currency ?? "usd",
              status: "SUCCEEDED",
              description: `Checkout: ${session.metadata?.planName ?? "Unknown"} plan build fee`,
              userId: user.id,
            },
          });

          if (session.metadata?.planName) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                plan: session.metadata.planName as "STARTER" | "GROWTH" | "PRO",
              },
            });
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const user = await getUserByEmail(invoice.customer_email);

        if (user) {
          await prisma.payment.create({
            data: {
              amount: invoice.amount_paid ?? 0,
              currency: invoice.currency ?? "usd",
              status: "SUCCEEDED",
              description: `Subscription payment: ${invoice.lines?.data?.[0]?.description ?? "Recurring"}`,
              userId: user.id,
            },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const user = await getUserByEmail(invoice.customer_email);

        if (user) {
          await prisma.payment.create({
            data: {
              amount: invoice.amount_due ?? 0,
              currency: invoice.currency ?? "usd",
              status: "FAILED",
              description: `Failed payment: ${invoice.lines?.data?.[0]?.description ?? "Recurring"}`,
              userId: user.id,
            },
          });
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const user = await getUserByEmail(charge.billing_details?.email);

        if (user) {
          await prisma.payment.create({
            data: {
              amount: charge.amount_refunded ?? 0,
              currency: charge.currency ?? "usd",
              status: "REFUNDED",
              description: `Refund: ${charge.description ?? "Charge refunded"}`,
              userId: user.id,
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
