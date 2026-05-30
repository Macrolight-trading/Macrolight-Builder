import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PortalShell from "@/components/portal/PortalShell";

export const metadata: Metadata = {
  title: {
    default: "Client Portal — Macrolight Builder",
    template: "%s | Portal — Macrolight",
  },
};

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Belt + suspenders: the middleware already gates this, but if a deploy
  // ever skips the middleware (preview branch, custom rewrite, etc.) we
  // still want the portal to require auth.
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login?callbackUrl=/portal");
  }

  const userId = (session.user as { id?: string }).id;
  const onboarding = userId
    ? await prisma.onboardingData.findUnique({
        where: { userId },
        select: { completedAt: true },
      })
    : null;

  return (
    <PortalShell
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? "",
      }}
      onboardingComplete={!!onboarding?.completedAt}
    >
      {children}
    </PortalShell>
  );
}
