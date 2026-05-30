import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fetchPrivateBlob } from "@/lib/onboarding/brief";

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

  const onboarding = await prisma.onboardingData.findUnique({
    where: { userId: params.userId },
    select: {
      briefMarkdownUrl: true,
      businessName: true,
      completedAt: true,
    },
  });

  if (!onboarding?.briefMarkdownUrl) {
    return NextResponse.json({ error: "Brief not found" }, { status: 404 });
  }

  try {
    const upstream = await fetchPrivateBlob(onboarding.briefMarkdownUrl);
    const markdown = await upstream.text();

    return NextResponse.json({
      businessName: onboarding.businessName,
      completedAt: onboarding.completedAt,
      briefMarkdownUrl: onboarding.briefMarkdownUrl,
      markdown,
    });
  } catch (err) {
    console.error("[hermes/brief] fetch failed:", err);
    return NextResponse.json({ error: "Failed to load brief" }, { status: 500 });
  }
}
