"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { reportAdConversion } from "@/lib/gtag";

/**
 * Only relative paths are honored — prevents a `?next=https://evil/` from
 * turning the signup page into an open redirect.
 */
function safeNext(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  return value;
}

const inputCls =
  "w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNext(searchParams.get("next")) ?? "/portal";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Create the account. Phone is optional — only sent if filled in,
      // so the server doesn't have to distinguish empty vs. missing.
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          ...(phone.trim() ? { phone: phone.trim() } : {}),
        }),
      });

      if (!signupRes.ok) {
        const j = await signupRes.json().catch(() => ({}));
        setError(j.error || "Sign-up failed. Please try again.");
        setLoading(false);
        return;
      }

      // 2. Sign in immediately with the same credentials.
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!signInRes || signInRes.error || !signInRes.ok) {
        // Account was created but auto-login failed — bounce them to the
        // login screen rather than getting stuck. Preserve the next path
        // via callbackUrl (the convention LoginForm already honors) so
        // they still land where they intended after logging in.
        const loginNext =
          nextPath !== "/portal"
            ? `?callbackUrl=${encodeURIComponent(nextPath)}`
            : "";
        router.push(`/login${loginNext}`);
        return;
      }

      reportAdConversion();
      // nextPath was sanitized by safeNext() above — only relative.
      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
          placeholder="Your full name"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
          placeholder="you@yourcompany.com"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1.5"
        >
          <span>Phone</span>
          <span className="text-xs font-normal text-gray-400">Optional</span>
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputCls}
          placeholder="(555) 123-4567"
        />
        <p className="mt-1 text-xs text-gray-400">
          So we can text you about your build. Never used for marketing.
        </p>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
          placeholder="At least 8 characters"
        />
        <p className="mt-1 text-xs text-gray-400">
          Must be at least 8 characters.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p className="text-[11px] text-gray-400 text-center leading-relaxed">
        By creating an account you agree to our{" "}
        <a href="/terms" className="underline hover:text-gray-600">
          Terms
        </a>{" "}
        and{" "}
        <a href="/privacy" className="underline hover:text-gray-600">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
