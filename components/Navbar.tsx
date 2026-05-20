"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Logo from "./Logo";

const navLinks = [
  { href: "/#features", label: "Services" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isAuthed = status === "authenticated";
  const role = (session?.user as { role?: string } | undefined)?.role;
  const dashboardHref = role === "ADMIN" ? "/admin" : "/portal";

  return (
    <div className="sticky top-0 z-50">
      {/* ── Announcement banner ── */}
      {!bannerDismissed && (
        <div className="relative flex items-center justify-center gap-3 bg-violet-600 px-5 py-2 text-center animate-fade-in-down">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-200 animate-pulse shrink-0" aria-hidden />
          <p className="text-[0.65rem] font-semibold text-violet-100 uppercase tracking-[0.18em]">
            Free 15-min audit call — we&apos;ll screen-share your site live.{" "}
            <Link href="/book" className="text-white underline underline-offset-2 hover:no-underline transition-all">
              Find a time →
            </Link>
          </p>
          <button
            type="button"
            aria-label="Dismiss announcement"
            onClick={() => setBannerDismissed(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-violet-200 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Main header ── */}
      <header
        className={`transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm"
            : "bg-white border-b border-gray-100"
        }`}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="flex h-16 items-center justify-between">
            <Logo />

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              {/* Click-to-call — primary phone CTA, matches the "your phone should be ringing" pitch */}
              <a
                href="tel:+12482147957"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-violet-700 transition-colors"
                aria-label="Call Macrolight Builder at (248) 214-7957"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-violet-600" aria-hidden>
                  <path d="M2 3.5A1.5 1.5 0 013.5 2h2.879a1.5 1.5 0 011.06.44l1.829 1.828a1.5 1.5 0 01.328 1.628l-.715 1.788a11.04 11.04 0 005.434 5.434l1.788-.715a1.5 1.5 0 011.628.328l1.829 1.829a1.5 1.5 0 01.439 1.06V16.5A1.5 1.5 0 0116.5 18h-1A13.5 13.5 0 012 4.5v-1z" />
                </svg>
                (248) 214-7957
              </a>
              {isAuthed ? (
                <Link
                  href={dashboardHref}
                  className="inline-flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors whitespace-nowrap shadow-sm"
                >
                  Open portal
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Client portal
                  </Link>
                  <Link
                    href="/book"
                    className="inline-flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors whitespace-nowrap shadow-sm"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
                      <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                    </svg>
                    Book a call
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center h-9 w-9 text-gray-500 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-100"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5"
                aria-hidden
              >
                {mobileOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <nav className="flex flex-col px-5 sm:px-8 py-4 gap-0">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3.5 text-sm font-medium text-gray-700 hover:text-gray-900 border-b border-gray-100 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-5 flex flex-col gap-3">
                {isAuthed ? (
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center justify-center bg-violet-600 text-white px-5 py-3 text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors"
                  >
                    Open portal
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/book"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex items-center justify-center gap-2 bg-violet-600 text-white px-5 py-3 text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
                        <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                      </svg>
                      Book a free 15-min call
                    </Link>
                    <a
                      href="tel:+12482147957"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex items-center justify-center gap-1.5 border border-gray-200 text-gray-800 px-5 py-3 text-sm font-semibold rounded-lg hover:border-violet-300 hover:text-violet-700 transition-colors"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-violet-600" aria-hidden>
                        <path d="M2 3.5A1.5 1.5 0 013.5 2h2.879a1.5 1.5 0 011.06.44l1.829 1.828a1.5 1.5 0 01.328 1.628l-.715 1.788a11.04 11.04 0 005.434 5.434l1.788-.715a1.5 1.5 0 011.628.328l1.829 1.829a1.5 1.5 0 01.439 1.06V16.5A1.5 1.5 0 0116.5 18h-1A13.5 13.5 0 012 4.5v-1z" />
                      </svg>
                      Call (248) 214-7957
                    </a>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors text-center"
                    >
                      Client portal
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
