"use client";

import { FormEvent, useState } from "react";
import Button from "./Button";

type FormStatus = "idle" | "submitting" | "success" | "error";

const inputCls =
  "block w-full rounded-lg border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 shadow-sm placeholder:text-gray-400 transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20";

/**
 * Minimal-friction lead form. Three fields, one button, no sidebar of
 * "what's included." Modeled after the Flow Ninja hero / Foresight modal.
 *
 * We collect just enough to populate the existing /api/contact route:
 *   - name (required by API)
 *   - email (required by API)
 *   - currentWebsite (used to compose the `message` body the API expects)
 */
export default function MinimalContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    const message = website.trim()
      ? `Free audit request for ${website.trim()}.`
      : "Free audit request — no current website provided.";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setStatus("success");
      setName("");
      setEmail("");
      setWebsite("");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="surface rounded-2xl p-8 text-center animate-scale-in">
        <div className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-md">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="h-6 w-6 text-white"
            aria-hidden
          >
            <path
              d="M5 13l4 4L19 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">You&apos;re on the list</h3>
        <p className="mt-2 text-gray-500">
          We&apos;ll have your free audit in your inbox within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm text-gray-500 hover:text-gray-800 underline underline-offset-4 transition-colors"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="surface rounded-2xl p-6 sm:p-8 space-y-4"
    >
      <div>
        <label htmlFor="mc-website" className="sr-only">
          Your website
        </label>
        <input
          id="mc-website"
          name="website"
          type="text"
          inputMode="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="yourbusiness.com"
          className={inputCls}
          autoComplete="url"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="mc-name" className="sr-only">
            Your name
          </label>
          <input
            id="mc-name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={inputCls}
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="mc-email" className="sr-only">
            Email
          </label>
          <input
            id="mc-email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@business.com"
            className={inputCls}
            autoComplete="email"
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending..." : "Get my free audit"}
      </Button>

      {status === "error" && (
        <p className="text-center text-sm text-red-600">
          Something went wrong. Please try again or email us directly.
        </p>
      )}

      <p className="text-center text-xs text-gray-400">
        Free. No pitch. Done in under 24 hours.
      </p>
    </form>
  );
}
