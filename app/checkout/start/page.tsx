"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

/**
 * /checkout/start — post-signup handoff into Stripe.
 *
 * Triggered by the /pricing → /signup → /checkout/start chain so a user can
 * click a plan, create their account, and land on Stripe without a manual
 * second click. Reads `plan` and `options` from the URL, waits for the
 * session to finish loading, then POSTs to /api/stripe/checkout and
 * redirects to the Stripe URL.
 *
 * If the user lands here while logged-out the page bounces back to /signup
 * preserving the same params.
 */
export default function CheckoutStartPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { status } = useSession();
  const [message, setMessage] = useState("Preparing your checkout…");
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  const plan = (search.get("plan") ?? "").toUpperCase();
  const optionsParam = search.get("options") ?? "";
  const optionIds = optionsParam
    ? optionsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  useEffect(() => {
    if (startedRef.current) return;
    if (status === "loading") return;
    if (status === "unauthenticated") {
      const here = `/checkout/start?${search.toString()}`;
      router.replace(
        `/signup?plan=${encodeURIComponent(plan)}&next=${encodeURIComponent(here)}`,
      );
      return;
    }
    if (!["STARTER", "GROWTH", "PRO"].includes(plan)) {
      setError(`Unknown plan "${plan}". Pick a plan from /pricing.`);
      return;
    }

    startedRef.current = true;
    setMessage("Redirecting to Stripe…");

    fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ basePlan: plan, optionIds }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.url) {
          throw new Error(data?.error || "Checkout failed");
        }
        window.location.href = data.url as string;
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Checkout failed");
      });
  }, [status, plan, optionIds, router, search]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
        {error ? (
          <>
            <h1 className="text-lg font-bold text-gray-900">
              Checkout didn&apos;t start
            </h1>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <a
              href="/pricing"
              className="mt-4 inline-block text-sm font-semibold text-violet-600 hover:text-violet-700"
            >
              ← Back to pricing
            </a>
          </>
        ) : (
          <>
            <div className="mx-auto w-10 h-10 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
            <h1 className="mt-4 text-lg font-bold text-gray-900">{message}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Don&apos;t close this tab — we&apos;ll forward you to Stripe in a
              moment.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
