import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const VALID_PLANS = ["NONE", "STARTER", "GROWTH", "PRO", "CUSTOM"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { plan } = body;

    if (!plan || !VALID_PLANS.includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be one of: STARTER, GROWTH, PRO." },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { plan },
    });

    return NextResponse.json({ id: user.id, plan: user.plan });
  } catch {
    return NextResponse.json(
      { error: "Failed to update user plan." },
      { status: 500 }
    );
  }
}
