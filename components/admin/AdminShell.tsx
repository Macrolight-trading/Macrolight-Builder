"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem =
  | { section: string }
  | {
      label: string;
      href: string;
      icon: (p: { active: boolean }) => JSX.Element;
      exact?: boolean;
    };

const nav: NavItem[] = [
  { label: "Overview", href: "/admin", icon: OverviewIcon, exact: true },
  { section: "CRM" },
  { label: "Dashboard", href: "/admin/crm", icon: CrmIcon, exact: true },
  { label: "Leads", href: "/admin/crm/leads", icon: LeadsIcon },
  { label: "Deals", href: "/admin/crm/deals", icon: DealsIcon },
  { label: "Activities", href: "/admin/crm/activities", icon: ActivitiesIcon },
  { section: "Business" },
  { label: "Users", href: "/admin/users", icon: UsersIcon },
  { label: "Payments", href: "/admin/payments", icon: PaymentsIcon },
  { label: "Analytics", href: "/admin/analytics", icon: AnalyticsIcon },
  { label: "Contacts", href: "/admin/contacts", icon: ContactsIcon },
  { label: "SEO Audits", href: "/admin/audits", icon: AuditsIcon },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't wrap the (now-unused) login page in the admin shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link href="/admin">
            <span className="text-lg font-extrabold tracking-tight text-gray-900">
              macro<span className="gradient-text">light</span>
            </span>
          </Link>
          <span className="ml-2.5 text-[10px] font-semibold uppercase tracking-widest text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
            Admin
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map((item, idx) => {
            if ("section" in item) {
              return (
                <p
                  key={`section-${idx}`}
                  className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400"
                >
                  {item.section}
                </p>
              );
            }
            const Icon = item.icon;
            const active = item.exact
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

        <div className="px-3 py-4 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to site
          </Link>
        </div>
      </aside>

      <div className="flex-1 ml-64">
        <main className="p-6 lg:p-8 max-w-7xl">{children}</main>
      </div>
    </div>
  );
}

/* ── Inline SVG icons ─────────────────────────────────────────────────────── */

function iconCls(active: boolean) {
  return `w-5 h-5 ${active ? "text-violet-600" : "text-gray-400"}`;
}

function OverviewIcon({ active }: { active: boolean }) {
  return (
    <svg className={iconCls(active)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10h14V10" />
    </svg>
  );
}

function CrmIcon({ active }: { active: boolean }) {
  return (
    <svg className={iconCls(active)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function LeadsIcon({ active }: { active: boolean }) {
  return (
    <svg className={iconCls(active)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function DealsIcon({ active }: { active: boolean }) {
  return (
    <svg className={iconCls(active)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM9 9h6M9 13h6" />
    </svg>
  );
}

function ActivitiesIcon({ active }: { active: boolean }) {
  return (
    <svg className={iconCls(active)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function UsersIcon({ active }: { active: boolean }) {
  return (
    <svg className={iconCls(active)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a3 3 0 11-6 0 3 3 0 016 0zM3 21v-2a4 4 0 014-4h10a4 4 0 014 4v2" />
    </svg>
  );
}

function PaymentsIcon({ active }: { active: boolean }) {
  return (
    <svg className={iconCls(active)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M5 6h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
    </svg>
  );
}

function AnalyticsIcon({ active }: { active: boolean }) {
  return (
    <svg className={iconCls(active)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
    </svg>
  );
}

function ContactsIcon({ active }: { active: boolean }) {
  return (
    <svg className={iconCls(active)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function AuditsIcon({ active }: { active: boolean }) {
  return (
    <svg className={iconCls(active)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
    </svg>
  );
}
