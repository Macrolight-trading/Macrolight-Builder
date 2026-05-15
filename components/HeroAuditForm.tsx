"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Step = "url" | "details" | "success";

/**
 * Inline hero audit form. Modeled on the Flow Ninja "Foresight" pattern:
 *   Step 1 — single URL field + "Scan my site" button (lowest friction)
 *   Step 2 — reveal name + email inline after URL is entered
 *   Step 3 — success state, fully replaces the form
 *
 * Posts to /api/contact using the same `name`/`email`/`message` contract as
 * the rest of the site, so the lead lands in the existing CRM pipeline.
 */
export default function HeroAuditForm() {
  const [step, setStep] = useState<Step>("url");
  const [website, setWebsite] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const gclidRef = useRef<string | null>(null);

  // Capture gclid from the landing page URL (set by Google Ads auto-tagging).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gclid = params.get("gclid");
    if (gclid) gclidRef.current = gclid;
  }, []);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onAdvance = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!website.trim()) return;
    setErrorMsg(null);
    setStep("details");
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);

    const message = website.trim()
      ? `Free audit request for ${website.trim()}.`
      : "Free audit request — no current website provided.";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, gclid: gclidRef.current ?? undefined }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setStep("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state ─────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div
        className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 sm:p-6 flex items-center gap-4 animate-scale-in"
        role="status"
      >
        <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-md">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="h-5 w-5 text-white"
            aria-hidden
          >
            <path
              d="M5 13l4 4L19 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-900">You&apos;re on the list</p>
          <p className="text-sm text-gray-500">
            Your free audit will be in your inbox within 24 hours.
          </p>
        </div>
      </div>
    );
  }

  // ── Step 1: URL only ─────────────────────────────────────────────
  if (step === "url") {
    return (
      <form onSubmit={onAdvance} className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2 rounded-2xl bg-white border border-gray-200 shadow-lg shadow-gray-200/60 p-1.5">
          <label htmlFor="hero-website" className="sr-only">
            Your website
          </label>
          <input
            id="hero-website"
            name="website"
            type="text"
            inputMode="url"
            autoComplete="url"
            required
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="yourbusiness.com"
            className="flex-1 min-w-0 rounded-xl px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 px-5 sm:px-6 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200 transition-all active:scale-[0.99] whitespace-nowrap"
          >
            Scan my site
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-400 pl-1.5">
          Free AI-powered website audit. Done in under 24 hours.
        </p>
      </form>
    );
  }

  // ── Step 2: details ──────────────────────────────────────────────
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl bg-white border border-gray-200 shadow-lg shadow-gray-200/60 p-4 sm:p-5 space-y-3 animate-fade-in-up"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-violet-600">
        Step 2 of 2 — Where should we send it?
      </p>

      <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-sm">
        <span className="truncate text-gray-700">{website}</span>
        <button
          type="button"
          onClick={() => setStep("url")}
          className="shrink-0 text-xs font-medium text-violet-600 hover:text-violet-800"
        >
          Change
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="hero-name" className="sr-only">
            Your name
          </label>
          <input
            id="hero-name"
            type="text"
            required
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </div>
        <div>
          <label htmlFor="hero-email" className="sr-only">
            Email
          </label>
          <input
            id="hero-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@business.com"
            className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-violet-200 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Sending..." : "Get my free audit"}
      </button>

      {errorMsg && (
        <p className="text-center text-sm text-red-600">{errorMsg}</p>
      )}

      <p className="text-center text-xs text-gray-400">
        Free. No pitch. No credit card.
      </p>
    </form>
  );
}
