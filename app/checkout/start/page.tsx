"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import CheckoutTosModal from "@/components/CheckoutTosModal";

/**
 * /checkout/start — post-signup handoff into Stripe.
 *
 * Triggered by the /pricing → /signup → /checkout/start chain so a user can
 * click a plan, create their account, and land on Stripe without a manual
 * second click. Reads `plan` and `options` from the URL, waits for the
 * session to finish loading, then POSTs to /api/stripe/checkout and
 * redirects to the Stripe URL.
 *
 * The inner component reads the URL via useSearchParams, which forces a
 * CSR bailout. Next.js 14 requires that to live inside a Suspense
 * boundary, hence the split below.
 */
export default function CheckoutStartPage() {
  return (
    <Suspense fallback={<LoadingCard message="Preparing your checkout…" />}>
      <CheckoutStartInner />
    </Suspense>
  );
}

function LoadingCard({ message }: { message: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
        <div className="mx-auto w-10 h-10 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
        <h1 className="mt-4 text-lg font-bold text-gray-900">{message}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Don&apos;t close this tab — we&apos;ll forward you to Stripe in a
          moment.
        </p>
      </div>
    </div>
  );
}

function CheckoutStartInner() {
  const router = useRouter();
  const search = useSearchParams();
  const { status } = useSession();
  const [message, setMessage] = useState("Waiting for confirmation…");
  const [error, setError] = useState<string | null>(null);
  // Was the TOS already accepted on the way in (e.g., from /pricing →
  // /signup → here)? CheckoutButton stores a flag in sessionStorage; we
  // honor it so the user doesn't get prompted twice.
  const [tosOpen, setTosOpen] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const startedRef = useRef(false);

  const plan = (search.get("plan") ?? "").toUpperCase();
  const optionsParam = search.get("options") ?? "";
  const optionIds = optionsParam
    ? optionsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  // Open the modal once we know who the user is and that the plan is
  // valid. Skip if we already have a stored acceptance from a prior step.
  useEffect(() => {
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
    const prior =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem("checkoutTosAccepted") === "1";
    if (prior) {
      setTosAccepted(true);
    } else {
      setTosOpen(true);
    }
  }, [status, plan, router, search]);

  // Once TOS is accepted (or skipped due to prior acceptance), fire the
  // actual checkout exactly once.
  useEffect(() => {
    if (!tosAccepted) return;
    if (startedRef.current) return;
    if (status !== "authenticated") return;
    if (!["STARTER", "GROWTH", "PRO"].includes(plan)) return;

    startedRef.current = true;
    setMessage("Redirecting to Stripe…");
    // Clear the sessionStorage flag so a future visit to /checkout/start
    // won't silently inherit a stale agreement.
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("checkoutTosAccepted");
    }

    fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ basePlan: plan, optionIds }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.error || "Checkout failed");
        }
        if (!data?.url) {
          throw new Error("Checkout failed: no redirect URL returned");
        }
        window.location.href = data.url as string;
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Checkout failed");
      });
  }, [tosAccepted, status, plan, optionIds]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
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
        </div>
      </div>
    );
  }

  return (
    <>
      <LoadingCard message={message} />
      <CheckoutTosModal
        open={tosOpen && !tosAccepted}
        busy={busy}
        title="Confirm your subscription"
        description="By continuing, you authorize Macrolight Builder to charge your payment method via Stripe and confirm you've read and accepted our Terms and Privacy Policy."
        confirmLabel="Continue to checkout"
        onCancel={() => {
          setTosOpen(false);
          router.replace("/pricing");
        }}
        onConfirm={() => {
          setBusy(true);
          setTosAccepted(true);
          setTosOpen(false);
        }}
      />
    </>
  );
}
