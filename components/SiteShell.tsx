"use client";

import { usePathname } from "next/navigation";

interface SiteShellProps {
  navbar: React.ReactNode;
  footer: React.ReactNode;
  chatWidget: React.ReactNode;
  children: React.ReactNode;
}

export default function SiteShell({
  navbar,
  footer,
  chatWidget,
  children,
}: SiteShellProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isPortal = pathname.startsWith("/portal");
  const isAuth = pathname === "/login" || pathname === "/signup";
  // /sample/* renders an industry showcase mockup that is iframed into
  // the public /[industry] pages. Inside the iframe we don't want the
  // Macrolight navbar/footer/chat widget — the showcase is supposed to
  // present as its own standalone "fake" business site.
  const isSample = pathname.startsWith("/sample");

  if (isAdmin || isPortal || isAuth || isSample) {
    return <>{children}</>;
  }

  return (
    <>
      {navbar}
      <main className="flex-1 relative">{children}</main>
      {footer}
      {chatWidget}
    </>
  );
}
