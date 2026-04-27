"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="sticky top-0 z-50">
      {/* ── Announcement banner ── */}
      {!bannerDismissed && (
        <div className="relative flex items-center justify-center gap-3 bg-violet-600 px-5 py-2 text-center animate-fade-in-down">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-200 animate-pulse shrink-0" aria-hidden />
          <p className="text-[0.65rem] font-semibold text-violet-100 uppercase tracking-[0.18em]">
            Limited spots — only 4 new clients accepted per month.{" "}
            <Link href="/contact" className="text-white underline underline-offset-2 hover:no-underline transition-all">
              Reserve yours →
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
              <Link
                href="/contact"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors whitespace-nowrap shadow-sm"
              >
                Free Audit
              </Link>
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
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Contact
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center bg-violet-600 text-white px-5 py-3 text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors"
                >
                  Free Audit
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
