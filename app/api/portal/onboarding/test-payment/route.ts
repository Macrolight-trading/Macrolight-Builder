import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { enqueuePaymentConfirmedForUser } from "@/lib/onboarding/payment-confirmed";

export const runtime = "nodejs";

/** Admin-only: enqueue payment_confirmed for the signed-in user's onboarding brief. */
export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string; role?: string } | undefined)?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await enqueuePaymentConfirmedForUser(userId, {
      test: true,
      requireBrief: true,
    });

    return NextResponse.json({
      ok: true,
      message: "Test payment_confirmed event queued for Hermes",
      ...result,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to queue test payment event";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
