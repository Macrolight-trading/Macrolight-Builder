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

  if (isAdmin) {
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
