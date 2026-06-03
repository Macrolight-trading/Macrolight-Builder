import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { clearOnboardingBrief, fetchPrivateBlob } from "@/lib/onboarding/brief";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const requestedUserId = req.nextUrl.searchParams.get("userId");
  const targetUserId =
    isAdmin && requestedUserId ? requestedUserId : userId;

  if (targetUserId !== userId && !isAdmin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const onboarding = await prisma.onboardingData.findUnique({
    where: { userId: targetUserId },
    select: { briefMarkdownUrl: true, businessName: true },
  });

  if (!onboarding?.briefMarkdownUrl) {
    return new NextResponse("Brief not found", { status: 404 });
  }

  try {
    const upstream = await fetchPrivateBlob(onboarding.briefMarkdownUrl);
    const filename = `${(onboarding.businessName ?? "onboarding-brief").replace(/[^a-zA-Z0-9._-]/g, "_")}.md`;

    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "private, max-age=3600",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("[onboarding/brief] fetch failed:", err);
    return new NextResponse("Failed to load brief", { status: 500 });
  }
}

/** Admin-only: delete the signed-in user's onboarding markdown brief. */
export async function DELETE() {
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
    await clearOnboardingBrief(userId);
    return NextResponse.json({ ok: true, message: "Onboarding brief cleared" });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to clear onboarding brief";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
