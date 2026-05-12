import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
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

  return (
    <PortalShell
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? "",
      }}
    >
      {children}
    </PortalShell>
  );
}
