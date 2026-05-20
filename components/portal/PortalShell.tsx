"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const nav = [
  { label: "Dashboard", href: "/portal", icon: HomeIcon, exact: true },
  { label: "Build a Plan", href: "/portal/build-plan", icon: BuildPlanIcon },
  { label: "Book a Call", href: "/portal/book-a-call", icon: CalendarIcon },
  { label: "Onboarding", href: "/portal/onboarding", icon: ClipboardIcon },
  { label: "My Project", href: "/portal/project", icon: TimelineIcon },
  { label: "Messages", href: "/portal/messages", icon: ChatIcon },
  { label: "Media", href: "/portal/media", icon: PhotoIcon },
  { label: "Billing", href: "/portal/billing", icon: CreditCardIcon },
  { label: "Profile", href: "/portal/profile", icon: UserIcon },
  { label: "Support", href: "/portal/support", icon: SupportIcon },
] as const;

export default function PortalShell({
  user,
  children,
}: {
  user: { name: string | null; email: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const initial = (user.name || user.email).charAt(0).toUpperCase();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close the sidebar whenever the user navigates to a new route on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when the mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between h-14 px-4 bg-white border-b border-gray-200">
        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={sidebarOpen}
          onClick={() => setSidebarOpen(true)}
          className="-ml-2 p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/portal" className="flex items-center">
          <span className="text-base font-extrabold tracking-tight text-gray-900">
            macro<span className="gradient-text">light</span>
          </span>
          <span className="ml-2 text-[10px] font-semibold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            Client
          </span>
        </Link>
        <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold text-xs">
          {initial}
        </div>
      </header>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-200 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center">
            <Link href="/portal">
              <span className="text-lg font-extrabold tracking-tight text-gray-900">
                macro<span className="gradient-text">light</span>
              </span>
            </Link>
            <span className="ml-2.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Client
            </span>
          </div>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden -mr-2 p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map((item) => {
            const Icon = item.icon;
            const exact = "exact" in item && item.exact;
            const active = exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-violet-50 text-violet-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon active={active} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold text-xs">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-900 truncate">
                {user.name || "Member"}
              </p>
              <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors mt-0.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto lg:mx-0">
          {children}
        </main>
      </div>
    </div>
  );
}

function iconCls(active: boolean) {
  return `w-5 h-5 ${active ? "text-violet-600" : "text-gray-400"}`;
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg className={iconCls(active)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10h14V10" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg className={iconCls(active)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function CreditCardIcon({ active }: { active: boolean }) {
  return (
    <svg className={iconCls(active)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M5 6h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
    </svg>
  );
}

function BuildPlanIcon({ active }: { active: boolean }) {
  return (
    <svg className={iconCls(active)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" />
    </svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg className={iconCls(active)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3M16 7V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
    </svg>
  );
}

function SupportIcon({ active }: { active: boolean }) {
  return (
    <svg className={iconCls(active)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h.01M15 12h.01M9 16c1 1 2 1.5 3 1.5s2-.5 3-1.5" />
    </svg>
  );
}

function ClipboardIcon({ active }: { active: boolean }) {
  return (
    <svg className={iconCls(active)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function TimelineIcon({ active }: { active: boolean }) {
  return (
    <svg className={iconCls(active)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg className={iconCls(active)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function PhotoIcon({ active }: { active: boolean }) {
  return (
    <svg className={iconCls(active)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
